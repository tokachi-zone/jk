import { CacheType, Client, GatewayIntentBits, Interaction, Message, Partials } from 'discord.js'
import commands from './commands'
import guilds from './guilds'
import dotenv from 'dotenv'
dotenv.config()

const activeGuild = guilds.jpnykwDevServer // ここで対象サーバーを選ぶ

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel],
})

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return
    if (message.content === '!hello') {
        message.channel.send('world!');
    }
})

client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    Object.entries(commands).map(([_, { metadata, callback }]) => {
      if (metadata.name === interaction.commandName) callback(interaction, activeGuild)
    })
  }
})

client.once('ready', () => {
  client.application?.commands.set(Object.entries(commands).map(([_, { metadata }]) => metadata), activeGuild)
})

client.login(process.env.DISCORD_BOT_TOKEN)
