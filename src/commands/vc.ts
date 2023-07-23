import {
    ChannelType,
    CacheType,
    Collection,
    CommandInteraction,
    GuildMember,
    Message,
    SlashCommandBuilder,
    Snowflake,
    TextChannel,
    VoiceChannel,
} from "discord.js";

const targets = new Map(Object.entries({
    '446352301934903316': '991505129142497380', // 十勝
    '450226249630220288': '1132689809194889267', // テスト用サーバー(jpnykw)
}))

const command = new SlashCommandBuilder().setName('vc')
    .setDescription('今からやることを伝えよう')
    .addStringOption(option => option.setName('トピック').setDescription('いまなにしてる？').setRequired(false))

export default {
    metadata: command.toJSON(),
    callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
        if (!interaction.inGuild()) return;

        // VCチャンネル以外からコマンドを使用された場合は無視
        if (interaction.channel!.type !== ChannelType.GuildVoice) {
          interaction.reply({
            content: "please command in text-in-voice channel",
            ephemeral: true
          });
          return;
        }

        // 使用者がVCに参加していなかった場合
        const currentVCMember = (interaction.channel as VoiceChannel)!.members;
        if (!currentVCMember.has((interaction.member as GuildMember).id)) {
          interaction.reply({
            content: "please join voice channel",
            ephemeral: true
          });
          return;
        }

        // チャンネルのログを読み、自身の投稿が存在したら消して送り直す
        const targetChannelId = targets.get(activeGuild)
        if (targetChannelId === undefined) return
        const targetChannel = interaction.client.channels.cache.get(targetChannelId) as TextChannel
        const messages: Collection<Snowflake, Message> = await targetChannel.messages.fetch({ limit: 10 })
        const sentMessages = messages.filter(message => message.author.bot && message.author.id === '1132610021864255588')
        sentMessages.forEach(async (message) => await message.delete())
        targetChannel.send('hello again!')
      }
}