import { Pathfinder, goals } from 'mineflayer-pathfinder';
import MinecraftData from 'minecraft-data';
import { CollectBlock } from 'mineflayer-collectblock';
import { Block } from 'prismarine-block';
import { Entity } from 'prismarine-entity';
import { Item } from 'prismarine-item';
import { Vec3 } from 'vec3';
import BasePlugin, { Bot, BotOptions, PluginParams } from '../BasePlugin';
import { BotChatControl } from '../ChatControl';
import { CollectionOptions } from '../Lumberjack/CollectionOptions';
import { time } from 'console';
import { emptyInventory } from '../../shared/InventoryHelper';

type BotExtended = Bot & BotChatControl & { miner: any, collectBlock: CollectBlock, pathfinder: Pathfinder };

const oreToMineral = (oreName: string) => {
  const oreOnly = ['iron_ore', 'gold_ore'];
  const minerals: { [index: string]: string } = {
    'diamond_ore': 'diamond',
    'redstone_ore': 'redstone',
    'lapis_ore': 'lapis_lazuli',
    'coal_ore': 'coal'
  }

  return oreOnly.includes(oreName) ? oreName : minerals[oreName];
}

class Miner extends BasePlugin {
  bot: BotExtended;
  mcData: MinecraftData.IndexedData;
  shouldMine = true;
  collectBlock: CollectBlock;
  chestLocations: Vec3[] = [];
  maxItems: number = 64 * 10; //ten stacks
  blocks: MinecraftData.Block[] = [];
 
  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.miner = {}
    this.mcData = MinecraftData(this.bot.version);
    this.logger = this.createLogger(Miner.name);
    this.collectBlock = this.bot.collectBlock;

  }

  onInit() {
    this.logger.log('Init');

    this.bot.chatControl.registerControl({
      pattern: new RegExp('mine', 'gim'),
      callback: ({ username, args }) => {
        const blocks = args.map((mineable: any) => {
          if (isNaN(+mineable)) {
            const block = this.mcData.blocksByName[mineable];
            return block;
          } else {
            this.maxItems = parseInt(mineable);
            return null;
          }
        }).filter((i: MinecraftData.Block) => i !== null);

        this.blocks = blocks;
        this.registerClosestChestFromMaster()
        .then(() => {
          this.doMine({
            chestLocations: this.chestLocations
          });
        })
        .catch(err => console.log(err));
      }
    });

    this.bot.chatControl.registerControl({
      pattern: new RegExp('check chest', 'gim'),
      callback: ({ username, args }) => {
        this.registerClosestChestFromMaster();
      }
    })

    this.bot.once('goal_updated' as any, () => {
      this.nudge();
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('what is', 'gim'),
      callback: ({ username, args }) => {
        const material = this.getMaterialFromName(args[0]);
        if(material){
          this.fb.chat(`When asked to gather, I will give you ${material?.displayName}s`)
        } else {
          this.fb.chat(`I dont quite see what you mean.`)
        }
      }
    })
  }

  totalNudges: number = 0;
  getMaterialFromName(name: string){
    const material = this.getMaterial(name);
    if(material){
      return this.materialMap(material);
    }

    return null;
  }

  materialMap(material: MinecraftData.Item | MinecraftData.Block){
    const mapping: { [k:string]: string } = {
      'snow': 'snowball',
      'grass': 'wheat_seeds',
      'wheat': 'wheat'
    }
  
    if(mapping[material.name]){
      return this.getMaterial(mapping[material.name]);
    } else if(material.name.includes('_leaves')){
      return this.getMaterial(material.name.replace('leaves', 'sapling'));
    }

    return material;
  }

  getMaterial(name: string){
    const item = this.mcData.itemsByName[name];
    const block = this.mcData.blocksByName[name];
  
    if(item) return item;
    else if(block) return item;
    else return null;
  }

  nudge() {
    if (this.totalNudges >= 5) {
      this.totalNudges = this.totalNudges + 1;
      const pos = this.bot.entity.position;
      const goal = new goals.GoalNear(pos.x + 1, pos.y, pos.z, 3);
      this.bot.pathfinder.setGoal(goal);
      this.bot.once('goal_updated' as any, () => {
        this.nudge();
      })
    }
  }

  createFilter<T>(blocks: MinecraftData.Block[], nameField: string) {
    if (blocks && blocks.length) {
      let blocksName = blocks.filter(i => typeof i !== 'undefined').map(i => i.name);
      return ((item: T & { [index: string]: any }) => blocksName.includes(item[nameField]));
    }

    return (_: T) => false;
  }


  doMine(options?: CollectionOptions) {
    this.shouldMine = true;
    const blocks = this.blocks;

    const collect = () => {
      if (!this.shouldMine) return;

      const mineral = this.bot.findBlock({
        matching: this.createFilter<Block>(blocks, 'name'),
        maxDistance: 64
      })

      if (mineral) {
        // If we found one, collect it.
        this.collectBlock.collect(mineral, {
          ignoreNoPath: true,
          chestLocations: options ? options.chestLocations : [],
          itemFilter: options ? options.itemFilter : this.createFilter<Item>(blocks, 'name')
        }, err => {
          if (err) {
            if (options && options.stopOnError) {
              this.logger.log('Stop on Error', err);
            } else {
              this.logger.log('Error occured while in process.', err);
              if(err.name === 'NoChests'){
                this.logger.log('Error No Chest', err);
              } else {
                collect();
                this.checkInventory()
              }
            }
          } else {
            collect()
            this.checkInventory()
          }
        })
      } else {
        this.fb.chat('Nothing found anymore');
      }
    }

    collect();
  }

  addChestLocation(location: Vec3) {
    this.chestLocations.push(location);
  }

  getCurrentLocation(entity: Entity) {
    return entity.position ? entity.position : null;
  }

  getMaster(): Entity | null {
    const filter = ([, entity]: [string, Entity]) => entity.type === 'player' && entity.username === this.fb.master;
    const matches = Object.entries(this.bot.entities).find(filter);
    const [, player] = typeof matches !== 'undefined' ? matches : [];

    return typeof player === 'undefined' ? null : player;
  }

  addChestLocationFromCaller() {
    const player = this.getMaster();

    if (player) {
      const location = this.getCurrentLocation(player);
      if (location) {
        this.addChestLocation(location);
      }
    }
  }

  getClosestChest(callingEntity: Entity, chestLocations: Vec3[]): Vec3 | null {
    let chest = null
    let distance = 0

    for (const c of chestLocations) {
      const dist = c.distanceTo(callingEntity.position)
      if (chest == null || dist < distance) {
        chest = c
        distance = dist
      }
    }

    if (chest != null) {
      chestLocations.splice(chestLocations.indexOf(chest), 1)
    }

    return chest
  }

  checkInventory() {
    const inventory = this.bot.inventory;
    const filter = this.createFilter<Item>(this.blocks, 'name');
    // /serthis.fb.chat(`I have to mine ${this.blocks.filter(i => typeof i !== 'undefined').map(i => i.displayName)} with ${this.maxItems} each`)
    const items = inventory.items().filter(filter)

    items.forEach((item) => {
      let msg = `Item ${item.displayName} => `;

      if (item.count >= this.maxItems) {
        //remove item from blocks
        this.blocks = this.blocks.filter(i => i.name !== item.name);
        msg += `${item.count}/${this.maxItems} Done`;
      } else {
        msg += `${this.maxItems - item.count} more to go`;
      }

      this.fb.chat(msg);
    });

    if (this.blocks.length < 1) {
      //all blocks has beene collected,
      //return
      this.bot.collectBlock.cancelTask();
      this.shouldMine = false;
      const closest = this.getClosestChest(this.bot.entity, this.chestLocations);

      if (closest) {
        this.bot.pathfinder.setGoal(new goals.GoalNear(closest.x, closest.y, closest.z, 3));
        this.fb.chat('Master, collection is done, I\'m returning')
        emptyInventory(this.bot, [closest], filter, () => {
          this.fb.chat('Master, everything is in the chest')
        });
      } else {
        if (this.fb.master !== '') {
          const master = this.getMaster();
          if (master) {
            this.fb.chat('Master, collection is done, I\'m coming to you');
            const pos = master.position;
            this.bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2));
            this.bot.once('goal_reached' as any, () => {
              items.forEach(item => {
                //toss
                this.bot.tossStack(item, (err) => {
                  console.log(err);
                });
              })
            })
          } else {
            this.fb.chat('Master, collection is done, but I cant find you');
          }
        } else {
          this.fb.chat('Master, collection is done, but I cant find you');
        }
      }
    }
  }

  async registerClosestChestFromMaster() {
    return new Promise((resolve, reject) => {
      const master = this.getMaster();

      if (master) {
        this.fb.chat('Wait I\'m coming...');

        this.bot.pathfinder.setGoal(
          new goals.GoalNear(
            master.position.x,
            master.position.y,
            master.position.z,
            3
          )
        )

        // this.bot.chat('/homes home');

        this.bot.once('goal_reached' as any, () => {
          // set found as unknown first since findBlocks for some reason returns Vec3 array
          const found: unknown = this.bot.findBlocks({
            matching: this.createFilter<Block>([
              this.mcData.blocksByName.chest
            ], 'name'),
            maxDistance: 16
          });

          if (master) {
            const chest = this.getClosestChest(master, found as Vec3[]);

            if (chest) {
              this.fb.chat('I\'m adding the chest nearest you');

              this.addChestLocation(chest);
              resolve(true);
            } else {
              this.fb.chat('I cant seem to find a chest near you master.');
              reject();
            }
          }


        })
      } else {
        this.fb.chat('Master I can\'t see you.')
        // this.bot.chat('/homes home');
        reject();
      }
    })
  }
}

export default (...args: PluginParams) => new Miner(...args);