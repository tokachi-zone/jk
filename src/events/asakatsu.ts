import cron from 'node-cron'

import { Client } from 'discord.js';

const serverChannelMap = new Map(Object.entries({
// 'Server ID'         : 'Channel ID'
   '446352301934903316': '651344058501038081', // 十勝
   '431420500518895636': '1040126116679143424', // テスト用サーバー(layState)
}));

const imageURL = 'https://cdn.discordapp.com/guild-events/959994601656164392/a37fc446362fd62cd11bf23bdf37ec59?size=2048';

const firstDay = new Date(2022, 3, 4, 6, 0, 0);
const dayTime = 1000 * 60 * 60 * 24;


const calcAsakatsuNumber = (eventDate: Date) => {
  return (eventDate.valueOf() - firstDay.valueOf()) / dayTime + 1
};

export default {
  callback: async (client: Client, activeGuild: string) => {
    cron.schedule('0 0 12 * * *', async () => {
      const guild = client.guilds.cache.get(activeGuild);

      const today = new Date();
      const [month, day, year] = [today.getMonth(), today.getDate(), today.getFullYear()];
      const EventDate: Date = new Date(year, month, day + 1, 6, 0, 0);
      const EventTitle = `十勝朝活 #${calcAsakatsuNumber(EventDate)}`;

      const eventOptions = {
        name: EventTitle,
        scheduledStartTime: EventDate.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        privacyLevel: 2, //GUILD_ONLY
        entityType: 2, //VOICE
        description: '*参加者さんは健康のために23時くらいには寝ましょう!\n* 6時に開始になっていますが皆朝は色々あると思うので前後しても大丈夫です!',
        channel: serverChannelMap.get(activeGuild),
        image: imageURL
      };
      guild?.scheduledEvents.create(eventOptions);
    });
  }
};
