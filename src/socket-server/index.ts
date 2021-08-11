import Websocket from 'ws';
import Config from '../shared/ConfigManager';

const start = () => {
  const wss = new Websocket.Server({ ...Config.getPluginConfig('wirelessModemServer')})
  
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  
    ws.send('something');
  });

  console.log('started');

}

start();