import { CollectBlock } from 'mineflayer-collectblock';
import { Bot } from '../BasePlugin';
import { BotChatControl } from '../ChatControl';
import { BotLumberjack } from './BotLumberjack';

export type BotExtended = Bot & BotChatControl & BotLumberjack & { collectBlock: CollectBlock; };
