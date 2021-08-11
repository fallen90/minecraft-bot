import { BehaviorSubject, Observable } from 'rxjs';
import Websocket from 'ws';
import { Logger } from '../plugins/Logger';
import Config from './ConfigManager';
import stdout from './stdout-logger';
type WirelessModemConfig = {
  host?: string;
  port: number;
  path?: string;
}

type WirelessModemPayload = {
  type: string;
  id: string;
  payload: any;
}

const configToPath = ({ host, port, path }: WirelessModemConfig) => (
  `ws://${host}:${port}/${path}`
)

const createPayload = (type: string, id: string, payload: any): WirelessModemPayload => ({
  type, id, payload
})

class WirelessModem {
  ws: any;
  config: WirelessModemConfig;
  pendingBeforeConnect: WirelessModemPayload[] = [];
  logger: Logger;

  state: any = 'CONNECTING';

  protected message: BehaviorSubject<WirelessModemPayload>;
  message$: Observable<WirelessModemPayload>;

  protected open: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  open$: Observable<any> = this.open.asObservable();

  constructor() {
    this.config = Config.getPluginConfig('wirelessModem');
    this.logger = new Logger('WirelessModem');
    this.logger.setLogHandler(stdout)
    
    if(Config.config.client.control === 'modem'){
      this.ws = new Websocket(configToPath(this.config))

      this.ws.on('open', () => {
        this.logger.log('Connection opened.');
        this.open.next(null);
        this.state = 'OPENED';
      })

      this.logger.log('WirelessModemClient Started')
    } else {
      this.logger.log('WirelessModemClient Not Started');
    }

    const messageSubject = new BehaviorSubject<WirelessModemPayload>(createPayload('','',''));
    this.message = messageSubject;
    this.message$ = this.message.asObservable();
  }

  get hasConnection() {
    return this.state === 'OPENED';
  }

  send(payload: WirelessModemPayload) {
    if(Config.config.client.control === 'modem'){
      if (this.hasConnection) {
        this.ws.send(JSON.stringify(payload));
      } else {
        this.logger.log('Connection to server not yet established, deferring...');
        this.pendingBeforeConnect.push(payload);
      }
    }
  }

  onConnectionOpen() {
    let currentIndex = this.pendingBeforeConnect.length - 1;

    const sendPending = () => {
      if (this.pendingBeforeConnect[currentIndex]) {
        this.send(this.pendingBeforeConnect[currentIndex]);
        this.logger.log('Payload sent to server');
        currentIndex--;
        sendPending();
      } else {
        this.logger.log('No pending payloads to send');
      }
    }

    sendPending();
  }

  chatAsPayload(username: string, message: string){
    this.send({
      type: 'chat',
      id: 'system',
      payload: {
        to: username,
        message: message
      }
    })
  }
}

const modem = new WirelessModem();

export default modem;
