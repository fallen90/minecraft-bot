import BasePlugin, { PluginParams } from './BasePlugin';

class Avoidance extends BasePlugin {

  previousHealth = 0;

  constructor(...args: PluginParams) {
    super(...args);

    this.logger = this.createLogger(Avoidance.name);
  }

  onInit(){
    this.logger.log('Init');
    this.bot.once('health', () => this.previousHealth = this.bot.health);
    this.bot.on('playerAttacked' as any, this.onPlayerAttacked.bind(this));
    this.bot.on('health', this.onHealthChange.bind(this))
  }

  onHealthChange(){
    if(this.previousHealth > this.bot.health){
      this.logger.log('Im taking damage')
      // I'm taking damage
      this.bot.emit('playerAttacked' as any);
    } else if(this.previousHealth === this.bot.health){
      this.bot.emit('fullHealth' as any);
    }
  }

  onPlayerAttacked(){
    this.logger.log('I was attacked!');

    // this.bot.chat('/effect give @p minecraft:health_boost')
    // this.bot.chat('/effect give @p minecraft:instant_health')
    // this.bot.chat('/effect give @p minecraft:regeneration')

    this.logger.log(this.bot.health);
  }
}

export default (...args: PluginParams) => new Avoidance(...args);