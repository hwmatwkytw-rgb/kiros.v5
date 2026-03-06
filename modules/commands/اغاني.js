const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const search = require("youtube-search-api");

module.exports.config = {
  name: "اغاني",
  version: "2.8.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تحميل الأغاني بنمط ⚝ الموحد",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) return api.sendMessage("── • ⌈ ⚝ ⌋ • ──\nحدد اسم المقطع المطلوب\n── • ⌈ ⚝ ⌋ • ──", threadID, messageID);

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const results = await search.GetListByKeyword(input, false, 5);
    const list = results.items;
    if (!list || list.length === 0) return api.sendMessage("── • ⌈ ⚝ ⌋ • ──\nلم يتم العثور على نتائج\n── • ⌈ ⚝ ⌋ • ──", threadID, messageID);

    let menu = `─── • ⌈ ⚝ ⌋ • ───\n  نـتـائـج الـبـحـث\n─── • ⌈ ⚝ ⌋ • ───\n\n`;
    list.forEach((item, i) => {
      menu += `⌈ ${i + 1} ⌋ ${item.title}\n⚝ الـمدة: ${item.length.simpleText}\n\n`;
    });
    menu += `« رد بالرقم للتحميل »\n─── • ⌈ ⚝ ⌋ • ───`;

    return api.sendMessage(menu, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        results: list
      });
    }, messageID);
  } catch (err) {
    return api.sendMessage("── • ⌈ ⚝ ⌋ • ──\nخطأ في الاتصال بالسيرفر\n── • ⌈ ⚝ ⌋ • ──", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID != handleReply.author) return;

  const index = parseInt(body) - 1;
  if (isNaN(body) || index < 0 || index >= handleReply.results.length) return;

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⌛", messageID, () => {}, true);

  const url = `https://www.youtube.com/watch?v=${handleReply.results[index].id}`;
  await downloadAudio(api, threadID, messageID, url);
};

async function downloadAudio(api, threadID, messageID, url) {
  const cachePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  try {
    const info = await ytdl.getInfo(url);
    const v = info.videoDetails;

    const wait = await api.sendMessage(`── • ⌈ ⚝ ⌋ • ──\nجاري الجلب: ${v.title}\n── • ⌈ ⚝ ⌋ • ──`, threadID, messageID);

    const stream = ytdl(url, { 
        filter: "audioonly", 
        quality: "lowestaudio", 
        highWaterMark: 1 << 25 
    });
    
    const fileStream = fs.createWriteStream(cachePath);
    stream.pipe(fileStream);

    fileStream.on("finish", async () => {
      api.setMessageReaction("🏁", messageID, () => {}, true);
      
      const stats = fs.statSync(cachePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);

      let caption = `─── • ⌈ ⚝ ⌋ • ───\n`;
      caption += `⚝ الـعـنوان: ${v.title}\n`;
      caption += `⚝ الـحـجم: ${fileSize} MB\n`;
      caption += `─── • ⌈ ⚝ ⌋ • ───\n`;
      caption += `[ ⚙︎ ڪايࢪوس ]`;

      await api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(cachePath)
      }, threadID, messageID);

      api.unsendMessage(wait.messageID);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("── • ⌈ ⚝ ⌋ • ──\nفشل في معالجة الملف\n── • ⌈ ⚝ ⌋ • ──", threadID, messageID);
  }
}
