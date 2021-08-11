import { CollectionOptions } from './CollectionOptions';
import { LumberType } from './LumberType';

export type BotLumberjack = {
  lumberjack: {
    collectLumber: (lumberType: LumberType, options?: CollectionOptions) => void;
  };
};
