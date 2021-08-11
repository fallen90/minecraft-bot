import { Entity } from 'prismarine-entity';
import MinecraftData from 'minecraft-data';
import { goals, Movements, Pathfinder } from 'mineflayer-pathfinder';
import { Vec3 } from 'vec3';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';

export type BotMovement = { movement: Movement };

type BotExtended = Bot & { movement: any, pathfinder: Pathfinder };

class Movement extends BasePlugin {
  bot: BotExtended;
  defaultMove: Movements;
  mcData: MinecraftData.IndexedData;

  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.movement = {
      move: this.move.bind(this),
      setGoal: this.setGoal.bind(this),
      follow: this.follow.bind(this)
    }
    this.logger = this.createLogger(Movement.name);
    this.mcData = MinecraftData(this.botVersion());
    this.defaultMove = new Movements(bot, this.mcData);
  }

  onInit() {
    this.logger.log('Init');
  }

  move(p: Vec3) {
    this.bot.pathfinder.setMovements(this.defaultMove)
    this.bot.pathfinder.setGoal(new goals.GoalBlock(p.x, p.y, p.z))
  }

  follow(player: string){
    const target = this.bot.players[player].entity;
    this.bot.pathfinder.setMovements(this.defaultMove);
    this.bot.pathfinder.setGoal(new goals.GoalFollow(target, 5), true)
  }

  setGoal(goal: goals.Goal, dynamic = false) {
    this.bot.pathfinder.setMovements(this.defaultMove)
    this.bot.pathfinder.setGoal(goal, dynamic);
  }

  lookAt(entity: Entity){
    if(entity){
      this.bot.lookAt(entity.position.offset(0, entity.height, 0))
    }
  }
}

export default (...args: PluginParams) => new Movement(...args);