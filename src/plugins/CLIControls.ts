import { BotMovement } from './Movement';
import { BotChatControl } from './ChatControl';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import readline from 'readline';
import events from '../shared/Events';

export type BotCLIControl = {
  CLIControls: {
    registerCommand: (pattern: RegExp | string) => void
  }
};

type BotExtended = Bot & BotChatControl & BotMovement & BotCLIControl;

class CLIControls extends BasePlugin {
  bot: BotExtended;
  rl: readline.Interface;
  commands: any = [];

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.CLIControls = {
      registerCommand: this.registerCommand.bind(this)
    }
    this.logger = this.createLogger(CLIControls.name);
    this.rl = readline.createInterface(process.stdin, process.stdout);
  }

  onInit() {
    this.logger.log('Init');
    this.rl.on('line', input => {
      readline.moveCursor(process.stdout, input.toString().length * -1, -2)
      readline.clearScreenDown(process.stdout);

      this.logger.log('⏫ ' + input.toString());

      const msg = input.toString();

      if (this.hasCommand(msg)) {
        this.logger.log(`👍 Command [${msg}] accepted`);
        events.sendDirectCommand(msg);
      } else {
        this.bot.chat(msg);
      }
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('follow', 'gim'),
      callback: ({ username, args }) => {
        this.bot.movement.follow(username);
      }
    })
  }

  registerCommand(pattern: string | RegExp) {
    if (pattern instanceof RegExp) this.commands.push(pattern);
    else this.commands.push(new RegExp(pattern, 'gim'));
  }

  hasCommand(msg: string) {
    const matches = this.commands.filter((i: RegExp) => i.test(msg));

    return matches && Array.isArray(matches) && matches.length >= 1;
  }
}

export default (...args: PluginParams) => new CLIControls(...args);