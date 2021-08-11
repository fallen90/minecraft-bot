import { ItemFilter } from 'mineflayer-collectblock/lib/Inventory';
import { Vec3 } from 'vec3';

export interface CollectionOptions {
  chestLocations?: Vec3[];
  itemFilter?: ItemFilter;
  stopOnError?: boolean;
}
