const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اغنية",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "بحث وتحميل الأغاني بالاسم أو الرابط مع خوارزمية التمويه",
  commandCategory: "الوسائط والتحميل",
  usages: "[اسم الأغنية أو الرابط]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) return api.sendMessage("╮── ⎔\n│ اكتب اسم الأغنية أو رابط اليوتيوب! 🎵\n╯────────────⊞", threadID, messageID);

  // إذا كان المدخل رابطاً
  if (input.includes("http")) {
    return downloadMusic(input, api, event);
  }

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);
    // البحث باستخدام API محدث
    const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(input)}`);
    
    // سنقوم هنا بمحاكاة قائمة بحث (بناءً على نتائج الـ API)
    const results = [
      { title: res.data.title || input, artist: res.data.artist || "فنان غير معروف", url: input }
    ];

    let msg = `╮────────── ⎔ ──────────╭\n` +
              `         SONG SEARCH 🎵\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `│ 1 ─ ${results[0].title} (${results[0].artist})\n\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `│ رد برقم [1] للتحميل كـ ريكورد ✅\n` +
              `╯────────── ⊞ ──────────╰`;

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        type: "reply",
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        link: input // تمرير البحث للخطوة التالية
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage("لم يتم العثور على نتائج، جرب الرابط المباشر.", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  if (body === "1") {
    api.unsendMessage(handleReply.messageID);
    return downloadMusic(handleReply.link, api, event);
  }
};

async function downloadMusic(query, api, event) {
  const { threadID, messageID } = event;
  const filePath = path.resolve(__dirname, 'cache', `music_${Date.now()}.mp3`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);

    // خوارزمية التمويه (Headers) لخدع السيرفرات كما في أمر التيك توك
    const res = await axios.get(`https://api.djasub.com/ytmp3?url=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    const downloadUrl = res.data.download_url || res.data.url;
    if (!downloadUrl) throw new Error("No download link");

    const audioStream = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'arraybuffer',
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G960U)" }
    });

    fs.writeFileSync(filePath, Buffer.from(audioStream.data, "utf-8"));

    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage({
      body: "╮── ⎔\n│ تم التحميل بواسطة ڪايࢪوس 🎶\n╯────────────⊞",
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("فشل التحميل، جرب رابطاً آخر أو تأكد من جودة الإنترنت.", threadID, messageID);
  }
}
