import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import Modem from '../shared/WirelessModem';

type BotExtended = Bot & { wirelessModem: any };

class WirelessModem extends BasePlugin {
  bot: BotExtended;
  modem: typeof Modem

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;
    this.bot.wirelessModem = {}
    this.logger = this.createLogger(WirelessModem.name);
    this.modem = Modem;
  }

  onInit() {
    // TODO: redirect all data from modem data to chat controls
    this.logger.log('Init');
  }
}

export default (...args: PluginParams) => new WirelessModem(...args);