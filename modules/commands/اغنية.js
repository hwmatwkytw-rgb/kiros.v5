const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const Youtube = require('youtube-search-api');
const ytdl = require("@distube/ytdl-core");

module.exports.config = {
  name: "اغنية",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA + Upgrade",
  description: "تحميل الموسيقى بنظام احترافي بدون API",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();
  const botName = global.config.BOTNAME || "KYROS";

  if (!input) {
    return api.sendMessage(`╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭\n  عذراً.. يرجى كتابة اسم الأغنية 🎵\n╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰`, threadID, messageID);
  }

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    const searchData = (await Youtube.GetListByKeyword(input, false, 6)).items;
    if (!searchData || searchData.length === 0) throw new Error("لم يتم العثور على نتائج.");

    let msg = `╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭\n     ${botName} PLAYER 🎧\n╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰\n\n`;
    let links = [];

    searchData.forEach((item, index) => {
      links.push(item.id);
      msg += ` ⬡ ${index + 1} ─ ${item.title.substring(0, 45)}...\n`;
    });

    msg += `\n╮───────────────────╭\n  رد برقم الأغنية للتحميل ✅\n╯───────────────────╰`;

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        type: 'reply',
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        links
      });
    }, messageID);

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`⚠️ خطأ في البحث: ${e.message}`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  api.unsendMessage(handleReply.messageID);

  const videoId = handleReply.links[index - 1];
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return downloadAndSend(videoUrl, videoId, api, event);
};

async function downloadAndSend(url, videoId, api, event) {
  const { threadID, messageID } = event;
  const cachePath = path.join(__dirname, 'cache');
  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

  const filePath = path.join(cachePath, `${crypto.randomBytes(4).toString('hex')}.mp3`);
  const adminName = global.config.AMDIN_NAME || "انجالاتي";

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);

    // 🔥 التحميل باستخدام ytdl-core (بدون API)
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio"
    });

    const writer = fs.createWriteStream(filePath);
    stream.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stats = fs.statSync(filePath);
    if (stats.size > 26214400) {
      fs.unlinkSync(filePath);
      return api.sendMessage("⚠️ عذراً.. الأغنية أكبر من 25MB.", threadID, messageID);
    }

    const msg = {
      body: `╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭\n     DOWNLOAD SUCCESS ✅\n╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰\n\n⋄ الـمـطور : ${adminName}\n⋄ الـحـالة : تـم الـتـحـمـيل\n\n╮───────────────────╭\n  اسـتـمـاعـاً مـمـتـعـاً لـك 🤍\n╯───────────────────╰`,
      attachment: fs.createReadStream(filePath)
    };

    return api.sendMessage(msg, threadID, () => {
      fs.unlinkSync(filePath);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ فشل تحميل الأغنية. حاول لاحقاً.", threadID, messageID);
  }
}
