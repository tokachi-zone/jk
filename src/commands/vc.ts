import {
  Client,
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

const vcObjectiveMap = new Map();

export const updateMappingAndMessages = async (client: Client, activeGuild: string) => {
  // チャンネルのログを読み、自身の投稿が存在したら削除する
  const outgoingChannelId = serverChannelMap.get(activeGuild);
  if (outgoingChannelId === undefined) return;
  const outogoingChannel = client.channels.cache.get(outgoingChannelId) as TextChannel;
  const messagesInOutgoingChannel: Collection<Snowflake, Message> = await outogoingChannel.messages.fetch({ limit: 10 });
  const previousBotMessages = messagesInOutgoingChannel.filter(message => message.author.bot && message.author.id === client.user!.id);
  previousBotMessages.forEach((message) => message.delete());

  [...vcObjectiveMap].forEach(([channelId]) => {
    const voiceChannel = client.channels.cache.get(channelId) as VoiceChannel;
    if (voiceChannel?.members.size === 0) vcObjectiveMap.delete(channelId);
  });

  if (vcObjectiveMap.size === 0) return;

  // メッセージを作成して送信
  const embedsMessage = new EmbedBuilder()
    .setTitle('New Activity')
    .setColor(0x4287f5)
    .setTimestamp(new Date())
    .addFields([...vcObjectiveMap].map(([channelId, objective]) => ({ name: `<#${channelId}>`, value: objective })));

  return outogoingChannel.send({ embeds: [embedsMessage] });
}

export default {
  metadata: command.toJSON(),
  callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
    if (!interaction.inGuild()) return;

    // text-in-voiceチャンネル以外からコマンドを使用した場合
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

    // ユーザーが入力した引数を取得する
    const objective = interaction.options.get('objective')?.value;
    if (typeof objective !== 'string') return;

    // 複数のVCで同時に使う場合を想定してマッピング
    vcObjectiveMap.set(interaction.channelId, objective);

    updateMappingAndMessages(interaction.client, activeGuild).then(() => {
      interaction.reply({ content: `Updated an activity. Check out for <#${serverChannelMap.get(activeGuild)}>.`, ephemeral: true });
    });
  }
};