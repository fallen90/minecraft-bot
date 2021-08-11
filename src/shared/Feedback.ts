import { inspect } from "util";
import Config from "./ConfigManager";

export type FeedbackType = {
  feedback: {
    chat: (...args: any[]) => void;
  }
}

type BotChatFn = (username: string, message: string) => void;

export default class Feedback {
  private __chat: BotChatFn = () => { };
  master: string = Config.get('client').master;

  constructor(botChatFn?: BotChatFn, master?: string) {
    if (botChatFn) this.__chat = botChatFn;
    if (master) this.master = master;
  }

  chat(...args: any[]) {
    if (this.master !== '') {
      const str = args.map(i => inspect(i)).join(' ').replace(new RegExp("'",'gim'), '');
      this.__chat(this.master, str);
    } else {
      console.log('[CHAT (setup master)] >>', ...args);
    }
  }

  setMaster(master: string) {
    if (master) this.master = master;
  }

  setChatFn(chatFn: BotChatFn) {
    if (typeof chatFn === 'function') this.__chat = chatFn;
  }

  get hasMaster(){
    return (this.master !== null && typeof this.master !== 'undefined' && this.master !== '')
  }
}