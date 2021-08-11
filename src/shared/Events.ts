import { BehaviorSubject, Observable } from 'rxjs';
import { Bot, BotOptions, ChatMessage } from 'mineflayer';

export class ChatArgs {
  username: string = '';
  message: string = '';
  translate: string | null = null;
  jsonMsg: ChatMessage | string = '';

  constructor(partial: Partial<ChatArgs>) {
    Object.assign(this, partial)
  }
}
export class MessageArgs {
  jsonMsg: ChatMessage | string = '';
  position: string = 'chat';

  constructor(partial: Partial<MessageArgs>){
    Object.assign(this,partial);
  }
}
class Events {
  protected spawned: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  spawned$: Observable<boolean>;

  protected chat: BehaviorSubject<ChatArgs> = new BehaviorSubject<ChatArgs>(new ChatArgs({}));
  chat$: Observable<ChatArgs>;

  protected message: BehaviorSubject<MessageArgs> = new BehaviorSubject<MessageArgs>(new MessageArgs({}));
  message$: Observable<MessageArgs>;

  protected loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loggedIn$: Observable<boolean>;

  protected directCommand: BehaviorSubject<string> = new BehaviorSubject<string>('');
  directCommand$: Observable<string>;

  protected goalReached: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  goalReached$: Observable<any>;

  constructor() {
    this.spawned$ = this.spawned.asObservable();
    this.chat$ = this.chat.asObservable();
    this.message$ = this.message.asObservable();
    this.loggedIn$ = this.loggedIn.asObservable();
    this.directCommand$ = this.directCommand.asObservable();
    this.goalReached$ = this.goalReached.asObservable();
  }

  bootstrap(bot: Bot) {
    bot.once('spawn', () => {
      this.spawned.next(true);
    })

    bot.on('chat', (username, message, translate, jsonMsg) => (
      this.chat.next(
        new ChatArgs({ username, message, translate, jsonMsg })
      )
    ))

    bot.on('message', (jsonMsg, position) => {
      this.message.next(
        new MessageArgs({ jsonMsg, position })
      )
    })

    bot.on('goal_reached' as any, () => {
      this.goalReached.next(true);
    })
  }

  setLoggedIn(loggedIn: boolean){
    this.loggedIn.next(loggedIn);
  }

  sendDirectCommand(command: string){
    this.directCommand.next(command);
  }
}
const events = new Events();
export default events;