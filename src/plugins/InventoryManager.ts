import { EnchantmentItemNBT } from './../shared/Enchantments';
import { getDisplayName } from '../shared/Enchantments';
import BasePlugin, { Bot, BotOptions, PluginParams } from './BasePlugin';

type BotExtended = Bot & { inventoryManager: any };

class InventoryManager extends BasePlugin {
  bot: BotExtended;
  
  constructor(bot: Bot, botOptions: BotOptions) {
    super(bot, botOptions);
    this.bot = bot as BotExtended;

    this.bot.inventoryManager = {}
    this.logger = this.createLogger(InventoryManager.name);
  }

  onInit() {
    this.logger.log('Init');
    this.bot.on('playerCollect', (collector, collected) => {
      this.getInventory()  
    })

    this.getInventory()  
  }

  getInventory(){
    const inventory = this.bot.inventory;

    const items = inventory.items();

    console.table(items.map((i: any)=> ({
      nbt: this.getNBTEnchantments(this.getValue(i.nbt)),
      displayName: `${i.displayName} x${i.count}`,
      stackSize: i.stackSize,
      slot: i.slot,
      type: i.type,
    })));

    const slot = this.bot.getEquipmentDestSlot('off-hand');
    this.bot.inventory.updateSlot(slot, items[3]);
    this.bot.toss(items.find((i:any)=> i.slot === 38)?.type as any, null, 10);
  }

  getInventoryNBT(nbt: any){

  }

  getNBTEnchantments(value: any){
    if(value){
      const enchantments = this.getValue(value['Enchantments']);
      return enchantments.map((i: EnchantmentItemNBT) => getDisplayName(i)).join(',')
    }
  }

  getValue(nbtField: any){
    if(!nbtField) return false;

    if(nbtField.type === 'list'){
      return nbtField.value.value;
    } else {
      return nbtField.value;
    }
  }
}



export default (...args: PluginParams) => new InventoryManager(...args);