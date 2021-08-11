import { BotChatControl } from './ChatControl';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import events, { MessageArgs } from '../shared/Events';
import Config from '../shared/ConfigManager';

type BotExtended = Bot & BotChatControl;

type AuthMeConfig = {
  [key: string]: any;
  username: string;
  password: string;
  onLoginCommands: string[];
}

class AuthMe extends BasePlugin {
  bot: BotExtended;
  config: AuthMeConfig;

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;
    this.logger = this.createLogger(AuthMe.name);
    this.config = Config.getPluginConfig('authme');
    this.parseOnLoginCommands();
  }

  parseOnLoginCommands() {
    const onLoginCmds = this.config['on-login'];
    if (onLoginCmds && Array.isArray(onLoginCmds)) {
      this.config.onLoginCommands = onLoginCmds
        .map((cmd: string) => cmd.trim())
        .filter((cmd: string) => cmd.startsWith('/'));
    } else {
      this.config.onLoginCommands = [];
    }
  }

  onInit() {
    this.logger.log('Init');
    events.message$.subscribe((message: MessageArgs) => {
      this.processSystemChat(message);
    })
  }

  processSystemChat(message: MessageArgs) {
    const messageString = message.jsonMsg.toString();
    const position = message.position;

    if (position === 'system') {
      //login
      if (messageString.includes('Please, login with the command:')) {
        // login command
        this.logger.log('Login command received');
        this.bot.chat('/login ' + this.config.password);
        return;
      }


      //loggedIn 
      if (messageString.includes('Successful login')) {
        this.logger.log('Logged In!');
        events.setLoggedIn(true);
        //goto skyblock
        this.logger.log(JSON.stringify(this.config.onLoginCommands, null, 2));
        this.config.onLoginCommands.forEach((cmd, index) => {
          setTimeout(() => {
            this.bot.chat(cmd);
          }, 1000 * index);
        })
        return;
      }
    }
  }
}

export default (...args: PluginParams) => new AuthMe(...args);