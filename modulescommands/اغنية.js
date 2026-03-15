const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytSearch = require("youtube-search-api");
const ytdl = require("@distube/ytdl-core");

module.exports.config = {
  name: "اغنية",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "بحث وتحميل من اليوتيوب باستخدام المكتبات الداخلية",
  commandCategory: "الوسائط والتحميل",
  usages: "[اسم الأغنية أو الرابط]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) return api.sendMessage("يا حبيبنا أكتب اسم الأغنية أو الرابط ₍ •`-ʼ• ₎", threadID, messageID);

  // إذا كان المدخل رابط يوتيوب مباشر
  if (ytdl.validateURL(input)) {
    return downloadAndSend(input, api, event);
  } else {
    // البحث بالاسم باستخدام youtube-search-api الموجود عندك
    try {
      const searchResults = await ytSearch.GetListByKeyword(input, false, 5);
      const items = searchResults.items;

      if (!items || items.length === 0) return api.sendMessage("مالقيت حاجة بالاسم ده، جرب كلمات تانية.", threadID, messageID);

      let msg = `╮────────── ⎔ ──────────╭\n` +
                `         YOUTUBE MUSIC 🎵\n` +
                `╯────────── ⎔ ──────────╰\n\n`;

      const results = items.map((item, index) => {
        msg += `│ ${index + 1} ─ ${item.title}\n`;
        return { title: item.title, id: item.id };
      });

      msg += `\n╮────────── ⊞ ──────────╭\n` +
             `│ رد برقم الأغنية للتحميل ✅\n` +
             `╯────────── ⊞ ──────────╰`;

      return api.sendMessage(msg, threadID, (error, info) => {
        global.client.handleReply.push({
          type: "reply",
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          results: results
        });
      }, messageID);
    } catch (e) {
      console.log(e);
      return api.sendMessage("حصل خطأ في البحث، جرب الرابط المباشر.", threadID, messageID);
    }
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.results.length) return;

  api.unsendMessage(handleReply.messageID);
  const videoID = handleReply.results[index - 1].id;
  const url = `https://www.youtube.com/watch?v=${videoID}`;
  
  return downloadAndSend(url, api, event);
};

async function downloadAndSend(url, api, event) {
  const { threadID, messageID } = event;
  const filePath = path.resolve(__dirname, 'cache', `${Date.now()}.mp3`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    
    // التحميل باستخدام ytdl-core الداخلي عندك
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio"
    });

    stream.pipe(fs.createWriteStream(filePath)).on('finish', () => {
      return api.sendMessage({
        body: "أبشررر، ريكوردك جاهز 🎶",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);
    });

  } catch (e) {
    console.log(e);
    return api.sendMessage("جلى الرمية! الفيديو ده محمي أو حجمه كبير.", threadID, messageID);
  }
}
