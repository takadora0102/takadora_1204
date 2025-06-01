// ─────────────────────────────────────────
// index.js
// ─────────────────────────────────────────

// 1. 環境変数を読み込む
require('dotenv').config();

// 2. Discord.js から必要なクラスを読み込む
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');

// 3. Bot が受け取る Intent を指定する
//    - Guilds：サーバー関連イベント（Botがサーバーに参加したなど）
//    - GuildMessages：サーバー内のメッセージイベント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

// 4. Bot のトークンを環境変数から取得
const token = process.env.BOT_TOKEN;

// ───────────────
// ここから「Bot の準備ができたとき」に実行される処理
// ───────────────
client.once(Events.ClientReady, () => {
  console.log(`ログイン成功！ Bot のユーザー名: ${client.user.tag}`);
});

// ───────────────
// ここから「スラッシュコマンドを受け取ったとき」の処理
// ───────────────
client.on(Events.InteractionCreate, async interaction => {
  // 「スラッシュコマンドじゃなかったら」何もしない
  if (!interaction.isChatInputCommand()) return;

  // ユーザーが入力したコマンド名を取り出す（例: "おはよう"）
  const { commandName } = interaction;

  // コマンド名が "おはよう" なら・・・
  if (commandName === 'おはよう') {
    // deferReply() で「処理しています」の状態を先に出すこともできるが、今回は即時返信
    try {
      // reply() でユーザーにメッセージを返す
      await interaction.reply('おはようございます！ ☀️');
    } catch (error) {
      console.error('おはようコマンドの返信時にエラー:', error);
      // 万が一返信に失敗したら、エラーメッセージだけ送っておく
      if (!interaction.replied) {
        await interaction.reply('すみません、エラーが発生しました。');
      }
    }
  }
});

// ───────────────
// 最後に Bot を Discord にログインさせる（実行の起点）
// ───────────────
client.login(token);