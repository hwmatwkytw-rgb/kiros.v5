const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const Youtube = require('youtube-search-api');

module.exports.config = {
  name: "اغنية",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "أقوى نسخة لتحميل الأغاني باستخدام محركين بحث وتحميل",
  commandCategory: "الوسائط والتحميل",
  usages: "[اسم الأغنية أو الرابط]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();

  if (!input) return api.sendMessage("╮── ⎔\n│ اكتب اسم الأغنية أو الرابط ₍ •`-ʼ• ₎\n╯────────────⊞", threadID, messageID);

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    // استخدام المكتبة الداخلية للبحث (أسرع وأدق)
    const searchData = (await Youtube.GetListByKeyword(input, false, 6)).items;
    if (!searchData || searchData.length === 0) throw new Error("لم يتم العثور على نتائج.");

    let msg = `╮────────── ⎔ ──────────╭\n` +
              `         KIRUS PLAYER 🎵\n` +
              `╯────────── ⎔ ──────────╰\n\n`;
    let links = [];

    searchData.forEach((item, index) => {
      links.push(item.id);
      msg += `│ ${index + 1} ─ ${item.title}\n`;
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

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`╮── ⎔\n│ حدث خطأ: ${e.message}\n╯────────────⊞`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  api.unsendMessage(handleReply.messageID);
  const videoUrl = `https://www.youtube.com/watch?v=${handleReply.links[index - 1]}`;
  
  // الخوارزمية المستخرجة: التحميل باستخدام Nexalo API القوي
  return downloadAndSend(videoUrl, api, event);
};

async function downloadAndSend(url, api, event) {
  const { threadID, messageID } = event;
  const filePath = path.join(__dirname, 'cache', `kirus_${crypto.randomBytes(4).toString('hex')}.mp3`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);

    // استخدام API المستخرج من كودك الأخير (Nexalo)
    const dlRes = await axios.get(`https://nexalo-api.vercel.app/api/ytmp3dl?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    
    if (!dlRes.data || !dlRes.data.success) throw new Error("فشل الـ API في جلب الرابط.");

    const mp3Url = dlRes.data.download_url;
    const title = dlRes.data.title || "موسيقى ڪايࢪوس";

    // تحميل الملف كنظام Stream (أكثر استقراراً للملفات الكبيرة)
    const response = await axios({
      method: 'get',
      url: mp3Url,
      responseType: 'stream',
      timeout: 30000
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stats = fs.statSync(filePath);
    if (stats.size > 26214400) { // 25MB limit
      fs.unlinkSync(filePath);
      return api.sendMessage("╮── ⎔\n│ الملف ده حجمه كبير شديد (أكبر من 25MB)!\n╯────────────⊞", threadID, messageID);
    }

    const msg = {
      body: `╮────────── ⎔ ──────────╭\n` +
            `         DONE DOWNLOAD ✅\n` +
            `╯────────── ⎔ ──────────╰\n\n` +
            `› الاسم: ${title}\n` +
            `› الحالة: تم التحميل بنجاح\n\n` +
            `╮────────── ⊞ ──────────╭\n` +
            `│ بـواسطـة: ڪايࢪوس\n` +
            `╯────────── ⊞ ──────────╰`,
      attachment: fs.createReadStream(filePath)
    };

    api.sendMessage(msg, threadID, () => {
      fs.unlinkSync(filePath);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(`╮── ⎔\n│ فشل التحميل: السيرفر لم يستجب.\n╯────────────⊞`, threadID, messageID);
  }
}
