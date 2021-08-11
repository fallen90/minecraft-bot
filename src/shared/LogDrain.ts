import modem from "./WirelessModem";
import Config from './ConfigManager';
import stdout from "./stdout-logger";

const clientConfig = Config.get('client');

export const createLogDrain = (handler: any) => {
  console.log = handler;
}

export const startLogDrain = () => {
  const type = 'log';
  const id = 'system';
  if (clientConfig.controls === 'modem') {
    createLogDrain((...args: any[]) => {
      modem.send({
        type, id,
        payload: {
          contents: args.join(' ')
        }
      })
    })
  } else {
    createLogDrain(stdout)
  }
}