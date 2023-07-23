import {
    ChannelType,
    CacheType,
    Collection,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    Message,
    SlashCommandBuilder,
    Snowflake,
    TextChannel,
    VoiceChannel,
} from 'discord.js';

// botが送る先のチャンネルID(key)にサーバーID(value)に対して紐づけておく
const targets = new Map(Object.entries({
    '446352301934903316': '991505129142497380', // 十勝
    '450226249630220288': '1132689809194889267', // テスト用サーバー(jpnykw)
}))

const command = new SlashCommandBuilder().setName('vc')
    .setDescription('Tell everyone what you are doing now.')
    .addStringOption(option => option.setName('objective').setDescription('What are you doing now?').setRequired(true))

export default {
    metadata: command.toJSON(),
    callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
        if (!interaction.inGuild()) return;

        // VCチャンネル以外からコマンドを使用された場合は無視
        if (interaction.channel!.type !== ChannelType.GuildVoice) {
          interaction.reply({
            content: 'please command in text-in-voice channel',
            ephemeral: true
          });
          return;
        }

        // 使用者がVCに参加していなかった場合
        const currentVCMember = (interaction.channel as VoiceChannel)!.members;
        if (!currentVCMember.has((interaction.member as GuildMember).id)) {
          interaction.reply({
            content: 'please join voice channel',
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

        const objective = interaction.options.get('objective')?.value
        if (typeof objective !== 'string') return

        // TODO: 複数のVCに対応させる
        const embedsMessage = new EmbedBuilder()
            .setTitle('New Activity')
            .setColor(0x4287f5)
            .setTimestamp(new Date())
            .addFields({ name: `<#${interaction.channelId}>`, value: objective });

        targetChannel.send({ embeds: [embedsMessage] })
        interaction.reply(`Updated an activity. Check out for <#${targets.get(activeGuild)}>.`)
      }
}