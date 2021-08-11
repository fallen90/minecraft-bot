import MinecraftData from 'minecraft-data';
import { CollectBlock } from 'mineflayer-collectblock';
import BasePlugin, { Bot, BotOptions, PluginParams } from '../BasePlugin';
import { BotExtended } from './BotExtended';
import { CollectionOptions } from './CollectionOptions';
import { LumberType } from './LumberType';

class Lumberjack extends BasePlugin {
  bot: BotExtended;
  collectBlock: CollectBlock;
  mcData: MinecraftData.IndexedData;

  shouldCollect: boolean = true;


  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;
    this.collectBlock = this.bot.collectBlock;
    this.mcData = MinecraftData(this.botVersion());

    this.bot.lumberjack = {
      collectLumber: this.collectLumber.bind(this)
    }
    this.logger = this.createLogger(Lumberjack.name);
  }

  onInit() {
    this.logger.log('Init');
    this.bot.chatControl.registerControl({
      pattern: new RegExp('stop everything', 'gim'),
      callback: () => this.stopCollection()
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('gather', 'gim'),
      callback: ({ args }) => {

        args.forEach((arg: string) => {
          if (Object.values(LumberType).includes(arg as any)) {
            this.collectLumber(arg as any);
          }
        });

      }
    })
  }

  collectLumber(lumberType: LumberType, options?: CollectionOptions) {
    this.shouldCollect = true;

    const collect = () => {
      if (!this.shouldCollect) return;

      const getId = (name: string) => this.mcData.blocksByName[name].id;
      const lumber = this.bot.findBlock({
        matching: getId(lumberType),
        maxDistance: 64
      })

      if (lumber) {
        // If we found one, collect it.
        this.collectBlock.collect(lumber, {
          ignoreNoPath: true,
          chestLocations: options ? options.chestLocations : [],
          itemFilter: options ? options.itemFilter : (item => item.name === lumberType)
        }, err => {
          if (err)
            if (options && options.stopOnError) {
              this.logger.log('Stop on Error', err);
            } else {
              this.logger.log('Error occured while in process.', err);
              collect();
            }
          else
            collect()
        })
      }
    }

    collect();
  }

  stopCollection() {
    this.shouldCollect = false;

    this.bot.stopDigging();

    //get nearest entity
    const nearest = this.bot.nearestEntity(entity => entity.type === 'player')
    if (nearest != null) {
      this.bot.lookAt(nearest.position.offset(0, nearest.height, 0))
    }
  }
}

export default (...args: PluginParams) => new Lumberjack(...args);