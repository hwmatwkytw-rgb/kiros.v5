const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "اغنية",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "البحث عن الأغاني وتحميلها من يوتيوب",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("⎔ الرجاء كتابة اسم الأغنية", threadID, messageID);

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    // استخدام محرك البحث لجلب 7 نتائج
    const searchUrl = `https://azadx69x-all-apis-top.vercel.app/api/ytsearch?query=${encodeURIComponent(query)}`;
    const res = await axios.get(searchUrl);
    const results = res.data.results.slice(0, 7);

    if (!results || results.length === 0) {
      return api.sendMessage("⊞ لم يتم العثور على نتائج", threadID, messageID);
    }

    let msg = "⎔ نتائج البحث المتوفرة:\n───━━━━───\n";
    results.forEach((item, index) => {
      msg += `│${index + 1}│ ${item.title}\n`;
    });
    msg += "───━━━━───\n⊞ رد برقم الأغنية للتحميل";

    api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        results: results
      });
    }, messageID);

  } catch (error) {
    return api.sendMessage(`⊞ خطأ أثناء البحث: ${error.message}`, threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body) - 1;
  if (isNaN(body) || index < 0 || index >= handleReply.results.length) {
    return api.sendMessage("⎔ اختيار غير صحيح، اختر من 1 إلى 7", threadID, messageID);
  }

  const video = handleReply.results[index];
  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⬇️", messageID, () => {}, true);

  try {
    const downloadUrl = `https://azadx69x-all-apis-top.vercel.app/api/sing?song=${encodeURIComponent(video.url)}`;
    const res = await axios.get(downloadUrl);

    if (!res.data?.success) throw new Error("فشل التحميل");

    const filePath = path.join(__dirname, `cache/sing_${Date.now()}.mp3`);
    const downloadRes = await axios({
      url: res.data.audio.url,
      method: "GET",
      responseType: "arraybuffer"
    });

    fs.writeFileSync(filePath, Buffer.from(downloadRes.data));

    api.sendMessage({
      body: `───━━━━───\n⊞ تم التحميل بنجاح\n⎔ العنوان: ${video.title}\n───━━━━───`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (error) {
    api.sendMessage(`⊞ تعذر تحميل الأغنية: ${error.message}`, threadID, messageID);
  }
};
