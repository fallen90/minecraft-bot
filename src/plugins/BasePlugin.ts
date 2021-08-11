import events from './../shared/Events';
import mineflayer, { BotOptions } from 'mineflayer';
import Feedback from '../shared/Feedback';
import { Logger } from './Logger';
import modem from '../shared/WirelessModem';
import Config from '../shared/ConfigManager';

class Augmentable {
  constructor(augment: any = {}) {
    Object.assign(this, augment)
  }
  static create<T extends typeof Augmentable, U>(this: T, augment?: U) {
    return new this(augment) as InstanceType<T> & U
  }
}

export type Bot = mineflayer.Bot;
export type PluginParams = [bot: Bot, botOptions: BotOptions];
export { BotOptions };

const fb = new Feedback();
const ClientConfig = Config.config.client;

export default class BasePlugin extends Augmentable {
  bot: Bot;
  botOptions: mineflayer.BotOptions;
  logger: Logger;
  fb: Feedback = fb;

  constructor(bot: Bot, botOptions: BotOptions) {
    super();
    this.bot = bot;
    this.botOptions = botOptions;

    this.logger = this.createLogger(BasePlugin.name);

    if(ClientConfig.controls === 'modem'){
      this.fb.setChatFn(modem.chatAsPayload.bind(modem));
    } else { 
      this.fb.setChatFn(this.bot.whisper);
    }

    events.spawned$.subscribe(spawned => {
      if(spawned) this.onInit();
    })
  }

  createLogger(name: string): Logger {
    return new Logger('Plugins/' + name);
  }

  debug() {
    console.log(this.botOptions.plugins);
  }

  onInit() { }

  botVersion() {
    return this.bot && this.bot.version ? this.bot.version : '1.16.1';
  }
}
