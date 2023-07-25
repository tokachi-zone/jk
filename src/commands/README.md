## documentation

Please use the following template when adding new commands.

```ts
import { SlashCommandBuilder } from 'discord.js';

const command = new SlashCommandBuilder().setName('yourCommand');

export default {
  metadata: command.toJSON(),
  callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
    // Write the execution contents of the command here.
  }
};
```

After implementing the command, edit `index.ts` and associate metadata and callback.  
**(If you forget this step, the command will not be registered!)**  

```ts
import { CacheType, CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
// ...
import yourCommand from 'yourCommand';

export interface Command {
  metadata: RESTPostAPIChatInputApplicationCommandsJSONBody
  callback: (interaction: CommandInteraction<CacheType>, activeGuild: string) => Promise<void>
}

export default [/*...*/, yourCommand]
```