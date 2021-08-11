import { Item } from 'prismarine-item';
import { BotCLIControl } from './CLIControls';
import { CollectBlock } from 'mineflayer-collectblock';
import { BotMovement } from './Movement';
import MinecraftData from 'minecraft-data';
import { BotChatControl } from './ChatControl';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import { Vec3 } from 'vec3';
import { Block } from 'prismarine-block';
import Config from '../shared/ConfigManager';
import events from '../shared/Events';
import { Window } from 'prismarine-windows';
import { emptyInventory } from 'mineflayer-collectblock/lib/Inventory';

type BotExtended = Bot & BotChatControl & BotMovement & BotCLIControl & { cobbleMiner: any, collectBlock: CollectBlock };
type CobblestoneMinerConfig = {
  blocks: string[];
  distance: number;
  throttle: number;
}

class CobblestoneMiner extends BasePlugin {
  bot: BotExtended;
  marker: string;
  chestMarker: string;
  mcData: MinecraftData.IndexedData;

  blocks: any[] = [];
  config: CobblestoneMinerConfig;

  storage: Block[] = [];

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.cobbleMiner = {}
    this.logger = this.createLogger(CobblestoneMiner.name);
    this.marker = 'light_weighted_pressure_plate';
    this.chestMarker = 'spruce_pressure_plate';
    this.mcData = MinecraftData(this.bot.version);
    this.config = Config.getPluginConfig('cobblestone-miner');
    this.config.throttle = this.config.throttle ? this.config.throttle : 0;
    this.config.distance = isNaN(this.config.distance) ? 6 : this.config.distance;
  }

  onInit() {
    this.logger.log('Init');
    this.getHarvestTool();
    this.logger.log('Config ' + JSON.stringify(this.config));

    this.bot.chatControl.registerControl({
      pattern: new RegExp('cobble-init', 'gim'),
      callback: () => this.gotoGeneratorMarker()
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('cobble-start', 'gim'),
      callback: () => this.start()
    })

    this.bot.CLIControls.registerCommand('lol');
    this.bot.CLIControls.registerCommand('cobble-init');
    this.bot.CLIControls.registerCommand('cobble-start');
    this.bot.CLIControls.registerCommand('inventory');
    this.bot.CLIControls.registerCommand('chest');

    events.directCommand$.subscribe((command: string) => {
      if (command.includes('cobble-init')) this.gotoGeneratorMarker();
      else if (command.includes('cobble-start')) this.start();
      else if (command.includes('inventory')) this.getInventory();
      else if (command.includes('chest')) this.gotoChestMarker();
      else {
        this.logger.log('Unknown command ' + `[${command}]` + ' received');
      }
    })
  }

  getInventory() {
    const inventory = this.bot.inventory;
    const items = inventory.items();
    const itemsStr = items.map((item: Item) => {
      return `${item.displayName}x${item.count}`
    }).join(' | ')

    this.logger.log('[Inventory] ' + itemsStr);
  }

  findNearestChests() {
    const chestLoc: any[] = this.bot.findBlocks({
      matching: this.mcData.blocksByName['chest'].id,
      maxDistance: 2,
      count: 4
    })

    const chests = chestLoc.map((i: Vec3) => this.bot.blockAt(i));

    if (chests && chests.length) {
      this.storage = chests as Block[];

      emptyInventory(this.bot, chestLoc, (item) => !item.name.includes('pickaxe'), (err) => {
        if(err) console.log('ERROR', err)
      })
    }

    // console.info('Storage', this.storage);

    // this.openChest(this.storage[0])
  }

  openChest(chest: Block) {
    this.bot.openChest(chest);
    this.bot.once('windowOpen', (window: Window) => {
      console.info('Window', window);
      const items = window.slots;
      const slots = this.mapItemsToSlots(window.inventoryStart, items);
      const inventory = slots.filter(i => i.location === 'inventory')
      const chest = slots.filter(i => i.location === 'chest')
      const availableInventory = inventory.filter((i) => i.item === null || !this.isItemFullStacked(i.item));
      const availableChest = chest.filter((i) => i.item === null || !this.isItemFullStacked(i.item));
      const isFullInventory = availableInventory.length < 1;
      const isFullChest = availableChest.length < 1;

      const isHarvestTool = (item: Item) => item.name.includes('pickaxe');

      if (isFullInventory && !isFullChest) {
        inventory
          .filter(i => i.item !== null)
          .sort((a, b) => b.item.count - a.item.count).
          forEach(item => {
            if (!isHarvestTool(item.item)) {
              const chestLocation = this.getEmptySlotOnChest(chest);
              if(chestLocation){
                window.updateSlot(chestLocation.slot, item.item);
              }
            }
          })
      }
    })
  }

  getEmptySlotOnChest(chestSlots: any){
    return chestSlots.find((slot:any) => slot.item === null);
  }

  isItemFullStacked(item: any) {
    return item.count >= item.stackSize;
  }

  mapItemsToSlots(inventoryStart: number, items: Item[]) {
    return (items as (Item & { slot: number })[]).map((item, index) => {
      if(item){
        if (item.slot < inventoryStart) {
          return { item, location: 'chest', slot: item.slot }
        } else {
          return { item, location: 'inventory', slot: item.slot }
        }
      } else {
        if(index < inventoryStart) return { item, location: 'chest', slot: index };
        else return { item, location: 'inventory', slot: index };
      }
    })
  }

  gotoChestMarker() {
    const block = this.bot.findBlock({
      matching: this.mcData.blocksByName[this.chestMarker].id,
      maxDistance: 10,
      count: 1,
    })

    if (block) {
      this.bot.movement.move(block.position)
      this.bot.once('goal_reached' as any, () => this.findNearestChests());
    }
  }

  addBlock(username: string) {
    if (this.bot.entities) {
      this.blocks.push(
        this.bot.blockAt(
          //@ts-expect-error
          Object.values(this.bot.entities)
            .find(i => i.type === 'player' && i.username === username)
            .position.offset(0, -1, 0)
        )
      );
    }
  }

  gotoGeneratorMarker() {
    const block = this.bot.findBlock({
      matching: this.mcData.blocksByName[this.marker].id,
      maxDistance: 10,
      count: 1,
    })

    if (block) {
      this.bot.movement.move(block.position)
    }
  }

  getHarvestTool() {
    this.bot.inventory.items().forEach(item => {
      if (item.name.includes('pickaxe')) {
        this.bot.inventory.updateSlot(0, item);
        this.bot.setQuickBarSlot(0);
      }
    });
  }

  start() {
    let index = 0;
    const blocks = this.config.blocks;
    const getBlock = () => (
      this.bot.findBlock({
        matching: (block: Block) => blocks.includes(block.name),
        maxDistance: this.config.distance,
        count: 1,
      })
    )
    const dig = () => {
      setTimeout(() => {
        _dig();
      }, this.config.throttle);
    }

    const _dig = () => {
      const block = getBlock();
      console.time('startDig');

      console.info('Minable found?', !block, Math.random());

      if (block) {
        this.bot.lookAt(block.position, true, () => {
          this.bot.dig(block, () => {
            dig();
            console.timeEnd('startDig');
          })
        });

      } else {
        setTimeout(() => {
          dig();
          console.timeEnd('startDig');
        }, 500);
      }
    }

    dig();
  }

  findGenerated(startingBlock: Block) {
    const { x: x1, y, z: z1 } = startingBlock.position;
    for (let x = 0; x < x1; x++) {
      for (let z = 0; z < z1; z++) {
        const found = this.bot.blockAt(new Vec3(x, y, z))

        if (found && found.name === 'cobblestone') {
          console.info(found);
        }
      }
    }
  }
}

export default (...args: PluginParams) => new CobblestoneMiner(...args);