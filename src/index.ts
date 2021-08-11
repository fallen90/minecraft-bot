import { startLogDrain } from './shared/LogDrain';
import mineflayer from 'mineflayer';
import Avoidance from './plugins/Avoidance';
import ArmorManager from 'mineflayer-armor-manager';
import { plugin as CollectBlock } from 'mineflayer-collectblock';
import { plugin as PVP } from 'mineflayer-pvp';
import Lumberjack from './plugins/Lumberjack/Lumberjack';
import ChatControl from './plugins/ChatControl';
import Hunter from './plugins/Hunter/Hunter';
import Miner from './plugins/Miner/Miner';
import { Logger } from './plugins/Logger';

// @ts-expect-error
import { mineflayer as Viewer } from 'prismarine-viewer';
import Master from './plugins/Master';
import Select from './plugins/Select';
import Movement from './plugins/Movement';
import ClearArea from './plugins/ClearArea';
import events from './shared/Events';
import CLIControls from './plugins/CLIControls';
import ConfigManager from './shared/ConfigManager';
import WirelessModem from './plugins/WirelessModem';
import modem from './shared/WirelessModem';
import stdout from './shared/stdout-logger';
import CobblestoneMiner from './plugins/CobblestoneMiner';
import AuthMe from './plugins/AuthMe';
import InventoryManager from './plugins/InventoryManager';

const logger = new Logger('App');
logger.setLogHandler(stdout);

startLogDrain();

const bootstrapBot = () => {
  const options = {
    ...ConfigManager.config.server
  };

  const bot = mineflayer.createBot(options);

  logger.log('Username used ' + bot.username)

  events.bootstrap(bot);
  // bot.loadPlugin(WirelessModem);
  bot.loadPlugin(AuthMe);
  bot.loadPlugin(CLIControls);
  bot.loadPlugin(ArmorManager);
  bot.loadPlugin(PVP);
  bot.loadPlugin(CollectBlock);

  setImmediate(() => {
    bot.loadPlugins([
      // Select,
      Movement,
      ChatControl,
      // Master,
      // Avoidance,
      // Lumberjack,
      // Hunter,
      // Miner,
      // ClearArea,
      CobblestoneMiner,
      InventoryManager
    ])
  })

  bot._client.on('state', (newState) => {
    const state = (s: string) => {
      if (s === 'handshaking') return 'Connecting';
      else if (s === 'login') return 'Logging in';
      else if (s === 'play') return 'Joining world';
      else return s;
    }

    logger.log(state(newState) + '...')
  })

  events.spawned$.subscribe(spawned => {
    if (spawned) {
      logger.log('I\'m Alive!');
    };
  })

  bot.on('end', () => {
    logger.log('Session ended');
    process.exit(0);
  })

  bot.on('kicked', (reason: string, loggedIn: boolean) => {
    logger.log('Kicked', reason, loggedIn);
  })

  bot.on('message', (jsonMsg: any, position: any) => {
    console.log(`[${position}]`, jsonMsg.toAnsi())
    modem.send({
      type: 'chat',
      id: 'system',
      payload: { position, message: jsonMsg.toAnsi() }
    })
  })
}

bootstrapBot();
