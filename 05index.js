// ─────────────────────────────────────────
// index.js
// ─────────────────────────────────────────

// 1. 環境変数を読み込む
require('dotenv').config();

// Canvas ライブラリの読み込み（存在しない場合は無効化）
let Canvas;
try {
  Canvas = require('@napi-rs/canvas');
} catch (error) {
  console.warn('Canvas ライブラリが見つからないため、画像生成機能は無効化されています。');
}

// 2. Discord.js から必要なクラスを読み込む
const { Client, GatewayIntentBits, Events, Collection, AttachmentBuilder } = require('discord.js');

// 3. Bot が受け取る Intent を指定する
//    - Guilds：サーバー関連イベント（Botがサーバーに参加したなど）
//    - GuildMessages：サーバー内のメッセージイベント
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ]
});

// 4. Bot のトークンを環境変数から取得
const token = process.env.BOT_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
const welcomeBgPath = process.env.WELCOME_BG_PATH;

// メンバー参加時に送信する画像を生成
async function createWelcomeImage(member) {
  if (!Canvas) return null;
  const { createCanvas, loadImage } = Canvas;
  const width = 700;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  if (welcomeBgPath) {
    try {
      const bg = await loadImage(welcomeBgPath);
      ctx.drawImage(bg, 0, 0, width, height);
    } catch (err) {
      console.error('背景画像の読み込みに失敗しました:', err);
      ctx.fillStyle = '#2C2F33';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = '#2C2F33';
    ctx.fillRect(0, 0, width, height);
  }

  // ユーザーアイコン
  const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  const avatar = await loadImage(avatarURL);
  const avatarSize = 200;
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, height / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, (height - avatarSize) / 2, avatarSize, avatarSize);
  ctx.restore();

  // テキスト
  ctx.fillStyle = '#ffffff';
  ctx.font = '30px sans-serif';
  ctx.fillText(`ようこそ, ${member.user.username} さん!`, 250, height / 2 + 15);

  const buffer = await canvas.encode('png');
  return new AttachmentBuilder(buffer, { name: 'welcome.png' });
}

// ───────────────
// ここから「Bot の準備ができたとき」に実行される処理
// ───────────────
client.once(Events.ClientReady, () => {
  console.log(`ログイン成功！ Bot のユーザー名: ${client.user.tag}`);
});

// ───────────────
// メンバーがサーバーに参加したときの処理
// ───────────────
client.on(Events.GuildMemberAdd, async member => {
  const channel = welcomeChannelId
    ? member.guild.channels.cache.get(welcomeChannelId)
    : member.guild.systemChannel;
  if (!channel) return;
  const attachment = await createWelcomeImage(member);
  const options = { content: `ようこそ、${member} さん！` };
  if (attachment) options.files = [attachment];
  await channel.send(options);
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
