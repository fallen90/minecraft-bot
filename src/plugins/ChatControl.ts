import { TemporarySubscriber } from 'mineflayer-utils';
import events, { ChatArgs } from './../shared/Events';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';

interface Control {
  pattern: RegExp;
  callback: (...any: any[]) => void;
  timeout?: number;
  requiredMaster?: boolean;
}

interface ChatMessage {
  parse(displayWarning: boolean): void;
  length(): number;
  getText(idx: any, lang?: any): string;
  toString(lang?: any): string;
  valueOf(): string;
  toMotd(): string;
  toAnsi(lang?: any): string;
}

export type BotChatControl = {
  chatControl: {
    registerControl: ({ pattern, callback, timeout, requiredMaster }: Control) => void
  }
}
type BotExtended = Bot & BotChatControl;

class ChatControl extends BasePlugin {
  bot: BotExtended;
  previousHealth = 0;
  tempSub: TemporarySubscriber;
  controls: Control[];
  delayTimeoutMS: number = 350;

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;
    this.logger = this.createLogger(ChatControl.name);
    this.tempSub = new TemporarySubscriber(this.bot);
    this.controls = [];

    this.bot.chatControl = {
      registerControl: this.registerControl.bind(this)
    }
  }

  onInit() {
    this.logger.log('Init');

    events.chat$.subscribe((chat: ChatArgs) => {
      this.processChat(chat);
    });
  }

  processChat({ username, message, translate, jsonMsg }: ChatArgs) {
    const string = (jsonMsg as ChatMessage).toString();

    if (username === this.bot.username && !string.startsWith('cmd')) return;
    if (translate === 'commands.message.display.outgoing') return;

    if(translate === 'commands.message.display.incoming'){
      if(string.includes(this.fb.master)){
        username = this.fb.master;
      }
    }
    

    process.nextTick(() => {
      const hasMaster = this.fb.hasMaster;

      this.controls.forEach(control => {
        // console.log('control', control.pattern, control.requiredMaster, hasMaster);
        //exit if it's not this control
        if (!control.pattern.test(string)) return;

        //if control requireMaster, and we dont have Master;
        if (control.requiredMaster && !hasMaster)
          return this.fb.chat(`I cant execute '${control.pattern.source}', I dont have a master`);

        const [...args] = message.replace(control.pattern, '').split(' ').filter(i => i !== '');
        const delayMS = control.timeout ? control.timeout : this.delayTimeoutMS;

        setTimeout(() => control.callback({ username, message, jsonMsg, args }), delayMS)

      })
    })
  }

  registerControl({ pattern, callback, timeout, requiredMaster = true }: Control) {
    this.controls.push(
      timeout ? { pattern, callback, timeout, requiredMaster } : { pattern, callback, requiredMaster }
    )
  }

  setCallbackDelay(timeout: number) {
    if (!isNaN(timeout)) {
      this.delayTimeoutMS = timeout;
    }
  }
}

export default (...args: PluginParams) => new ChatControl(...args);