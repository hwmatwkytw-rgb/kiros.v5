const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const Youtube = require('youtube-search-api');

module.exports.config = {
  name: "اغنية",
  version: "2.8.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "بحث متقدم وتحميل أغاني بخوارزمية التمويه",
  commandCategory: "الوسائط والتحميل",
  usages: "[اسم الأغنية أو الرابط]",
  cooldowns: 5
};

// خوارزمية التحميل المركزية (الخداع والتمويه)
async function downloadMusic(url, path, api, event) {
  const { threadID, messageID } = event;
  const timestart = Date.now();

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    
    // استخدام API خارجي مع Headers لتمويه السيرفر
    const res = await axios.get(`https://api.djasub.com/ytmp3?url=${encodeURIComponent(url)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0" }
    });

    const downloadUrl = res.data.download_url || res.data.url;
    const title = res.data.title || "موسيقى ڪايࢪوس";

    const response = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream',
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10)" }
    });

    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve({ title, timestart }));
      writer.on('error', reject);
    });
  } catch (e) { throw e; }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const keyword = args.join(" ");
  const cachePath = `${__dirname}/cache/${Date.now()}.mp3`;

  if (!keyword) return api.sendMessage("╮── ⎔\n│ اكتب اسم الأغنية أو الرابط ₍ •`-ʼ• ₎\n╯────────────⊞", threadID, messageID);

  // الحالة 1: إذا أرسل رابطاً مباشراً
  if (keyword.indexOf("https://") == 0) {
    try {
      const data = await downloadMusic(keyword, cachePath, api, event);
      sendAudio(api, event, data, cachePath);
    } catch (e) { return api.sendMessage("جلى الرمية! السيرفر رفض الطلب.", threadID, messageID); }
  } 
  // الحالة 2: بحث بالاسم (منطق الكود الجديد)
  else {
    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      const searchData = (await Youtube.GetListByKeyword(keyword, false, 6)).items;
      
      let msg = `╮────────── ⎔ ──────────╭\n` +
                `         YOUTUBE SEARCH 🎵\n` +
                `╯────────── ⎔ ──────────╰\n\n`;
      let links = [];

      searchData.forEach((item, index) => {
        links.push(item.id);
        msg += `│ ${index + 1} ─ ${item.title} (${item.length.simpleText})\n`;
      });

      msg += `\n╮────────── ⊞ ──────────╭\n` +
             `│ رد برقم الأغنية للتحميل ✅\n` +
             `╯────────── ⊞ ──────────╰`;

      return api.sendMessage(msg, threadID, (error, info) => {
        global.client.handleReply.push({
          type: 'reply',
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          links
        });
      }, messageID);
    } catch (e) { return api.sendMessage("حصل خطأ أثناء البحث!", threadID, messageID); }
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  api.unsendMessage(handleReply.messageID);
  const videoUrl = `https://www.youtube.com/watch?v=${handleReply.links[index - 1]}`;
  const cachePath = `${__dirname}/cache/${Date.now()}.mp3`;

  try {
    const data = await downloadMusic(videoUrl, cachePath, api, event);
    sendAudio(api, event, data, cachePath);
  } catch (e) { api.sendMessage("فشل تحميل الأغنية المختارة.", threadID); }
};

function sendAudio(api, event, data, path) {
  if (fs.statSync(path).size > 26214400) {
    api.sendMessage('الملف ده كبير شديد (أكبر من 25MB)! حاول تختار فيديو أقصر.', event.threadID);
    return fs.unlinkSync(path);
  }

  const msg = `╮────────── ⎔ ──────────╭\n` +
              `         YOUTUBE MP3 🎶\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `› العنوان: ${data.title}\n` +
              `› الوقت المستغرق: ${Math.floor((Date.now() - data.timestart) / 1000)} ثانية\n\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `│ تم التحميل بواسطة: ڪايࢪوس ✅\n` +
              `╯────────── ⊞ ──────────╰`;

  api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, event.threadID, () => {
    fs.unlinkSync(path);
    api.setMessageReaction("✅", event.messageID, () => {}, true);
  }, event.messageID);
}
