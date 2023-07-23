## documentation

新しいコマンドを追加する時は以下のテンプレートを使用してください

```ts
import { SlashCommandBuilder } from 'discord.js';
const command = new SlashCommandBuilder().setName('yourCommand');

export default {
  metadata: command.toJSON(),
  callback: async (interaction: CommandInteraction<CacheType>, activeGuild: string) => {
    // ここにコマンドの処理を書く
  }
};
```

コマンドの実装が終わったら `index.ts` を編集してmetadataとcallbackを紐付けてください  
（これを忘れるとコマンドが登録されません！）

```ts
// ...
import yourCommand from 'yourCommand'

export default {
  // ...
  yourCommand: { ...yourCommand },
}
```