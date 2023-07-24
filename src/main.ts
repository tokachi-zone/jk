import { CacheType, Client, GatewayIntentBits, Interaction, Partials, VoiceChannel, VoiceState } from 'discord.js';
import { updateVcObjectiveMappingAndMessage } from './commands/vc';
import commands, { Command } from './commands';
import guilds from './guilds';
import dotenv from 'dotenv';
dotenv.config();

const activeGuild = guilds.jpnykwDevServer; // ここで対象サーバーを選ぶ

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Message, Partials.Channel],
});

client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    commands.map(({ metadata, callback }: Command) => {
      if (metadata.name === interaction.commandName) callback(interaction, activeGuild);
    });
  }
});

client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
  if (newState.channelId === oldState.channelId) return;
  const channelId = oldState.channelId || newState.channelId;
  if (channelId === null) return;
  if ((client.channels.cache.get(channelId) as VoiceChannel).members.size === 0) updateVcObjectiveMappingAndMessage(client, activeGuild);
})

client.once('ready', () => {
  client.application?.commands.set(commands.map(({ metadata }: Command) => metadata), activeGuild);
});

client.login(process.env.DISCORD_BOT_TOKEN);
