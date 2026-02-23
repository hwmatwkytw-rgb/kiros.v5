const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const search = require("youtube-search-api");

module.exports.config = {
  name: "اغاني",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "بحث وتحميل الأغاني مع تفاصيل كاملة",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية أو رابط]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) return api.sendMessage("╭── • 📥 • ──╮\n يرجى وضع رابط أو اسم أغنية\n╰── • 📥 • ──╯", threadID, messageID);

  if (ytdl.validateURL(input)) {
    api.setMessageReaction("⬇️", messageID, () => {}, true);
    return downloadAudio(api, threadID, messageID, input);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);
  try {
    const results = await search.GetListByKeyword(input, false, 5);
    const list = results.items;
    if (!list || list.length === 0) return api.sendMessage("⚠️ لم أجد نتائج.", threadID, messageID);

    let menu = `╭── • ڪايࢪوس • ──╮\n  ⌈ نـتـائـج الـبـحـث ⌋\n╰── • 🎵 • ──╯\n\n`;
    list.forEach((item, i) => {
      menu += `${i + 1}. ${item.title}\n⏳ المدة: ${item.length.simpleText}\n\n`;
    });
    menu += `«— رد برقم الأغنية —»`;

    return api.sendMessage(menu, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        results: list
      });
    }, messageID);
  } catch (err) {
    return api.sendMessage("❌ حدث خطأ في البحث.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID != handleReply.author) return;

  const index = parseInt(body) - 1;
  if (isNaN(body) || index < 0 || index >= handleReply.results.length) return;

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  const url = `https://www.youtube.com/watch?v=${handleReply.results[index].id}`;
  await downloadAudio(api, threadID, messageID, url);
};

async function downloadAudio(api, threadID, messageID, url) {
  const cachePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  try {
    // جلب معلومات الفيديو الكاملة
    const info = await ytdl.getInfo(url);
    const v = info.videoDetails;

    const wait = await api.sendMessage(`⏳ جاري معالجة: ${v.title}...`, threadID, messageID);

    const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });
    
    stream.pipe(fs.createWriteStream(cachePath)).on("finish", async () => {
      const stats = fs.statSync(cachePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);

      if (stats.size > 83886080) { 
        fs.unlinkSync(cachePath);
        return api.editMessage("❌ الملف ضخم جداً (أكبر من 80MB).", wait.messageID, threadID);
      }

      // إرسال الملف مع التفاصيل الكاملة
      const caption = `✅ تـم الـتـحـمـيـل بـنـجـاح\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `🎼 الـعـنـوان: ${v.title}\n` +
                      `👤 الـقـنـاة: ${v.author.name}\n` +
                      `⏳ الـمـدة: ${Math.floor(v.lengthSeconds / 60)} دقيقة\n` +
                      `📅 الـنـشر: ${v.publishDate}\n` +
                      `📦 الـحـجـم: ${fileSize} MB\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

      await api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(cachePath)
      }, threadID, messageID);

      api.unsendMessage(wait.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
      fs.unlinkSync(cachePath);
    });

  } catch (err) {
    api.sendMessage("❌ حدث خطأ أثناء التحميل.", threadID, messageID);
  }
}
