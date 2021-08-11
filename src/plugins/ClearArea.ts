import { CollectBlock } from 'mineflayer-collectblock';
import { Block } from 'prismarine-block';
import { Item } from 'prismarine-item';
import BoundingBox from '../shared/BoundingBox';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import { BotChatControl } from './ChatControl';
import { BotMovement } from './Movement';
import { BotSelect } from './Select';

type BotExtended = Bot & BotChatControl & BotMovement & BotSelect & { collectBlock: CollectBlock, clearArea: any };

class ClearArea extends BasePlugin {
  bot: BotExtended;

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.clearArea = {}
    this.logger = this.createLogger(ClearArea.name);
  }

  createFilter(selectedBox: BoundingBox){
    return (item: Block) => item !== null && item.position && selectedBox.contains(item.position)
  }

  onInit() {
    this.bot.chatControl.registerControl({
      pattern: new RegExp('cleararea', 'gim'),
      callback: ({ args }) => {
        this.bot.select.onSelected().subscribe(box => {

          const blocks = this.bot.findBlock({
            matching: this.createFilter(box),
            maxDistance: 64
          })

          console.log(blocks);
          // this.bot.collectBlock.collect(mineral, err => {
          //   console.log('error', err);
          // })

        })
      }
    })
  }
}

export default (...args: PluginParams) => new ClearArea(...args);