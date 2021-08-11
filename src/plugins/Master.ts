import { BotChatControl } from './ChatControl';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import Config from '../shared/ConfigManager';

type BotExtended = Bot & BotChatControl & { master: any };

class Master extends BasePlugin {
  bot: BotExtended;
  name: string = Config.get('client').master;

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.master = {}
    this.logger = this.createLogger(Master.name);
  }

  onInit() {
    this.logger.log('Init');
    this.bot.chatControl.registerControl({
      pattern: new RegExp('i am your master', 'gim'),
      callback: ({ username }) => {
        this.fb.setMaster(username);
        this.fb.chat('I welcome you My Lord');
      },
      requiredMaster: false
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('who is your master', 'gim'),
      callback: ({ username }) => {
        if(this.fb.master !== ''){
          const str = (username === this.fb.master) ? 'You are My Lord' : this.fb.master;
          this.fb.chat(str);
        } else {
          this.fb.setMaster(username);
          this.fb.chat('I dont have a master');
          this.fb.setMaster('');
        }
      },
      requiredMaster: false
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('release seal', 'gim'),
      callback:({ username }) => {
        this.fb.setMaster('');
      },
      requiredMaster: false
    })
  }
}

export default (...args: PluginParams) => new Master(...args);