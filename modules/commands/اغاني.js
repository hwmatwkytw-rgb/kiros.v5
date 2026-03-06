const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const search = require("youtube-search-api");

module.exports.config = {
  name: "اغاني",
  version: "2.5.5",
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
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  const cachePath = path.join(cacheDir, `${Date.now()}.mp3`);

  let waitMessageID;

  try {
    // إرسال رسالة انتظار وتخزين الـ ID الخاص بها
    const wait = await api.sendMessage(`⏳ جاري جلب البيانات والمعالجة...`, threadID, messageID);
    waitMessageID = wait.messageID;

    const info = await ytdl.getInfo(url, {
        requestOptions: {
            headers: {
                cookie: "" // (اختياري) يمكنك وضع الكوكيز هنا إذا استمرت المشاكل
            }
        }
    });
    
    const v = info.videoDetails;
    
    // التحقق من الحجم قبل البدء (تقريبي)
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    
    const stream = ytdl.downloadFromInfo(info, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25 // زيادة حجم البافر لتجنب التقطيع
    });

    const fileStream = fs.createWriteStream(cachePath);
    stream.pipe(fileStream);

    fileStream.on("finish", async () => {
      const stats = fs.statSync(cachePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);

      if (stats.size > 83886080) { // 80MB
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        return api.editMessage("❌ الملف ضخم جداً (أكبر من 80MB).", waitMessageID, threadID);
      }

      const caption = `✅ تـم الـتـحـمـيـل بـنـجـاح\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `🎼 الـعـنـوان: ${v.title}\n` +
                      `👤 الـقـنـاة: ${v.author.name}\n` +
                      `⏳ الـمـدة: ${Math.floor(v.lengthSeconds / 60)} دقيقة\n` +
                      `📦 الـحـجـم: ${fileSize} MB\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

      await api.sendMessage({
        body: caption,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

      api.unsendMessage(waitMessageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
    });

    fileStream.on("error", (err) => {
        throw err;
    });

  } catch (err) {
    console.error(err);
    if (waitMessageID) api.unsendMessage(waitMessageID);
    api.sendMessage(`❌ فشل التحميل. (قد يكون الفيديو محمي أو السيرفر محظور من يوتيوب)`, threadID, messageID);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  }
}
