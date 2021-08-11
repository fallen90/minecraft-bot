import { Pathfinder } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';
import BoundingBox from '../shared/BoundingBox';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';
import { BotChatControl } from './ChatControl';
import { BotMovement } from './Movement';
import { BehaviorSubject, Observable } from 'rxjs';

export type BotSelect = { select: { onSelected: () => Observable<BoundingBox> }}

type BotExtended = Bot & BotChatControl & BotMovement & BotSelect & { pathfinder: Pathfinder };

class Select extends BasePlugin {
  bot: BotExtended;
  p1: Vec3 = new Vec3(0, 0, 0);
  p2: Vec3 = new Vec3(0, 0, 0);
  selected: BoundingBox = new BoundingBox(this.p1, this.p2);

  protected selected$ = new BehaviorSubject(this.selected);

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.select = {
      onSelected: this.onSelected.bind(this)
    }

    this.logger = this.createLogger(Select.name);
  }

  onSelected(): Observable<BoundingBox> {
    return this.selected$.asObservable();
  }

  isMarker(args: string[]) {
    const [location] = args;
    const allowed = ['p1', 'pos1', 'p2', 'pos2', 'center', 'cen'];
    return allowed.includes(location);
  }

  onInit() {
    this.logger.log('Init');

    this.bot.chatControl.registerControl({
      pattern: new RegExp('select', 'gim'),
      callback: ({ username, args }) => {
        if (this.isMarker(args)) {
          const [location] = args;
          const position = this.getPosition(username);

          if (position !== null) {
            this.fb.chat('Setting value for marker', location);
            switch (location) {
              case 'p1':
              case 'pos1': {
                this.setPos('p1', position.clone())
                break;
              }

              case 'p2':
              case 'pos2': {
                this.setPos('p2', position.clone())
                //create bounding box
                this.setSelected(new BoundingBox(this.p1, this.p2));
                break;
              }

              default:
                this.fb.chat('Invalid position marker')
                break;
            }
          }
        }
      }
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('goto', 'gim'),
      callback: ({ args }) => {
        if (this.isMarker(args)) {
          const [location] = args;

          switch (location) {
            case 'p1':
            case 'pos1': {
              this.bot.movement.move(this.p1);
              break;
            }
            case 'p2':
            case 'pos2': {
              this.bot.movement.move(this.p2);
              break;
            }

            case 'center':
            case 'cen': {
              if (this.selected) this.bot.movement.move(this.selected.getCenter())
              break;
            }
            default:
              this.fb.chat('Invalid position marker')
              break;
          }

        }
      }
    })

    this.bot.chatControl.registerControl({
      pattern: new RegExp('show box', 'gim'),
      callback: ({ args }) => {
        console.log(this.selected)
      }
    });
  }

  setPos(loc: string, value: Vec3) {
    if (loc === 'p1') this.p1 = value;
    else if (loc === 'p2') this.p2 = value;
  }

  getPosition(username: string) {
    const entity = Object.values(this.bot.entities).find((value) => value.username === username);
    return entity ? entity.position : null;
  }

  setSelected(box: BoundingBox){
    this.selected = box;
    this.selected$.next(this.selected);
  }
}

export default (...args: PluginParams) => new Select(...args);