import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';

type BotExtended = Bot & { __blank__: any };

class BLANK extends BasePlugin {
  bot: BotExtended;
  
  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.__blank__ = {}
    this.logger = this.createLogger(BLANK.name);
  }

  onInit() {
    
  }
}

export default (...args: PluginParams) => new BLANK(...args);