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

const vcObjectiveMapMemory = new Map();

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

    // チャンネルのログを読み、自身の投稿が存在したら削除する
    const outgoingChannelId = serverChannelMap.get(activeGuild);
    if (outgoingChannelId === undefined) return;
    const outogoingChannel = interaction.client.channels.cache.get(outgoingChannelId) as TextChannel;
    const messagesInOutgoingChannel: Collection<Snowflake, Message> = await outogoingChannel.messages.fetch({ limit: 10 });
    const previousBotMessages = messagesInOutgoingChannel.filter(message => message.author.bot && message.author.id === '1132610021864255588');
    previousBotMessages.forEach((message) => message.delete());

    // ユーザーが入力した引数を取得する
    const objective = interaction.options.get('objective')?.value;
    if (typeof objective !== 'string') return;

    // 複数のVCで同時に使う場合を想定してマッピング
    vcObjectiveMapMemory.set(interaction.channelId, objective);

    // 更新時に他のVCをチェックし、人が居ないチャンネルはマッピングから削除する
    [...vcObjectiveMapMemory].map(([channelId]) => {
      const voiceChannel = interaction.client.channels.cache.get(channelId) as VoiceChannel;
      if (voiceChannel?.members.size === 0) vcObjectiveMapMemory.delete(channelId);
    });

    // メッセージを作成して送信し、完了したらコマンド使用者のみに見える返事をする
    const embedsMessage = new EmbedBuilder()
      .setTitle('New Activity')
      .setColor(0x4287f5)
      .setTimestamp(new Date())
      .addFields([...vcObjectiveMapMemory].map(([channelId, objective]) => ({ name: `<#${channelId}>`, value: objective })));

    outogoingChannel.send({ embeds: [embedsMessage] }).then(() => {
      interaction.reply({ content: `Updated an activity. Check out for <#${serverChannelMap.get(activeGuild)}>.`, ephemeral: true });
    });
  }
};