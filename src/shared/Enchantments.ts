export type EnchantmentItemNBT = {
  lvl: { type: string, value: number },
  id: { type: string, value: string }
}

const map: { [key:string] : string } = {
  'fortune': 'Fortune',
  'efficiency': 'Efficiency'
}

const numerals = ['I','II','III', 'IV', 'V','VI', 'VII', 'VIII', 'IX', 'X', 'XI','XII'];

export const getDisplayName = (enchantment: EnchantmentItemNBT) => {
  const { id, lvl } = enchantment;
  let name = id.value.replace('minecraft:', '');

  if(map[name]){
    name = map[name];
  }

  return `${name} ${numerals[lvl.value -1]}`;
}