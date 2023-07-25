import { CacheType, CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import vc from './vc';

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
  callback: (interaction: CommandInteraction<CacheType>, activeGuild: string) => Promise<void>;
};

export default [vc];