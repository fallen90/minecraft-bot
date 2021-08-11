import { CollectBlock } from 'mineflayer-collectblock';
import { Pathfinder } from 'mineflayer-pathfinder';
import { PVP } from 'mineflayer-pvp/lib/PVP';
import { Entity } from 'prismarine-entity';
import BasePlugin, { Bot, BotOptions, PluginParams } from '../BasePlugin';
import { BotChatControl } from './../ChatControl';

type BotExtended = Bot & BotChatControl & { collectBlock: CollectBlock, hunter: any, pvp: PVP, pathfinder: Pathfinder };

class Hunter extends BasePlugin {
  bot: BotExtended;
  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.hunter = {}
    this.logger = this.createLogger(Hunter.name);
  }

  onInit() {
    this.logger.log('Init');
    this.bot.on('stoppedAttacking' as any, this.onStoppedAttacking.bind(this));

    this.bot.chatControl.registerControl({
      pattern: new RegExp('hunt', 'gim'),
      callback: ({ args }) => {
        const [entityName] = args;
        if (entityName !== '') {
          this.doHunt(entityName);
        }
      }
    })
  }

  doHunt(entityName: string) {
    const filter = (e: Entity) => (
      e.name === entityName
      // e.type === 'mob' &&
      && e.position.distanceTo(this.bot.entity.position) < 16
      // e.mobType !== 'Armor Stand' // Mojang classifies armor stands as mobs for some reason?
    )

    const entity = this.bot.nearestEntity(filter)

    if (entity) {
      this.bot.pvp.attack(entity);
    }
  }

  onStoppedAttacking() {
    console.log('I stopped attacking');
    // const gatherDrops = () => {
      const filter = (e: Entity) => e.kind === 'Drops' && e.onGround;
    //   const drop = this.bot.nearestEntity(filter);

    //   if (drop) {
    //     const { x, y, z } = drop.position;
    //     this.bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
    //     this.bot.once('goal_reached' as any, () => {
          
    //     });
    //   }
    // }

    // gatherDrops();

    this.bot.collectBlock.collect(this.bot.nearestEntity(filter) as Entity); 
  }

  stopHunt() {
    this.bot.pvp.stop()
    this.bot.pathfinder.setGoal(null as any)
  }
}

export default (...args: PluginParams) => new Hunter(...args);