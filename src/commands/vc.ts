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

const serverChannelMap = new Map(Object.entries({
// 'Server ID'         : 'Channel ID'
  '446352301934903316': '991505129142497380', // 十勝
  '450226249630220288': '1132689809194889267', // テスト用サーバー(jpnykw)
}));

const command = new SlashCommandBuilder().setName('vc')
  .setDescription('Tell everyone what you are doing now.')
  .addStringOption(option => option.setName('objective').setDescription('What are you doing now?').setRequired(true));

export default {
  metadata: command.toJSON(),
  callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
    if (!interaction.inGuild()) return;

    // VCチャンネル以外からコマンドを使用された場合は無視
    if (interaction.channel!.type !== ChannelType.GuildVoice) {
      interaction.reply({ content: `You can't use this command out text-in-voice channel.`, ephemeral: true });
      return;
    }

    // 使用者がVCに参加していなかった場合
    const currentVCMember = (interaction.channel as VoiceChannel)!.members;
    if (!currentVCMember.has((interaction.member as GuildMember).id)) {
      interaction.reply({ content: `You can't use this command without joining a vc.`, ephemeral: true });
      return;
    }

    // チャンネルのログを読み、自身の投稿が存在したら消して送り直す
    const outgoingChannelId = serverChannelMap.get(activeGuild);
    if (outgoingChannelId === undefined) return;
    const outogoingChannel = interaction.client.channels.cache.get(outgoingChannelId) as TextChannel;
    const messagesInOutgoingChannel: Collection<Snowflake, Message> = await outogoingChannel.messages.fetch({ limit: 10 });
    const previousBotMessages = messagesInOutgoingChannel.filter(message => message.author.bot && message.author.id === '1132610021864255588');
    previousBotMessages.forEach(async (message) => await message.delete());

    // ユーザーが入力した引数を取得する
    const objective = interaction.options.get('objective')?.value;
    if (typeof objective !== 'string') return;

    // TODO: 複数のVCに対応させる
    const embedsMessage = new EmbedBuilder()
      .setTitle('New Activity')
      .setColor(0x4287f5)
      .setTimestamp(new Date())
      .addFields({ name: `<#${interaction.channelId}>`, value: objective });

      outogoingChannel.send({ embeds: [embedsMessage] });
    interaction.reply({ content: `Updated an activity. Check out for <#${serverChannelMap.get(activeGuild)}>.`, ephemeral: true });
  }
};