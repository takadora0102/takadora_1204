// ─────────────────────────────────────────
// src/deploy-commands.js
// ─────────────────────────────────────────
// 1. Node.js の環境変数を読み込むモジュール
require('dotenv').config();

// 2. Discord.js のライブラリから必要なクラスを読み込む
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// 3. .env から CLIENT_ID, GUILD_ID, BOT_TOKEN を取得
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.BOT_TOKEN;

// 4. スラッシュコマンドの定義
//    ここでは「/おはよう」と入力すると「おはようございます！」と返すコマンドを作る
const commands = [
  new SlashCommandBuilder()
    .setName('おはよう')                // コマンド名（半角英数字でも可だが、日本語も OK）
    .setDescription('Botが「おはようございます！」と返します'),
  // もし他に /こんにちは や /さようなら などを作りたいなら、同様にオブジェクトを追加できる
].map(command => command.toJSON());

// 5. REST API クライアントの準備
const rest = new REST({ version: '10' }).setToken(token);

// 6. コマンドを登録する非同期関数
(async () => {
  try {
    console.log('スラッシュコマンドを Discord に登録中...');

    // GUILD（テストサーバー）にコマンドを登録する
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('スラッシュコマンドの登録が完了しました！');
  } catch (error) {
    console.error('コマンド登録時にエラーが発生しました:', error);
  }
})();
