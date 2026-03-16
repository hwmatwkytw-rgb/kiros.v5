const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "فيس",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "تحميل فيديوهات من الفيسبوك عبر الرابط",
  commandCategory: "الوسائط والتحميل",
  usages: "[رابط الفيديو]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) return api.sendMessage("يا حبيبنا حط رابط فيديو الفيسبوك! ₍ •`-ʼ• ₎", threadID, messageID);

  try {
    // التفاعل بعلامة التنزيل عند بدء العملية
    api.setMessageReaction("📥", messageID, () => {}, true);

    // استخدام API لجلب روابط التحميل (هذا مثال لـ API فعال)
    const res = await axios.get(`https://api.samir.xyz/download/facebook?url=${encodeURIComponent(url)}`);
    
    // ملاحظة: تأكد من مراجعة هيكلة البيانات (Data Structure) للـ API الذي ستستخدمه
    // سنفترض هنا أن الرابط المباشر في res.data.result.hd أو sd
    const videoUrl = res.data.result.hd || res.data.result.sd;
    const title = res.data.result.title || "فيديو فيسبوك";

    if (!videoUrl) throw new Error("لم يتم العثور على رابط تحميل مباشر.");

    const filePath = path.resolve(__dirname, 'cache', `fb_${Date.now()}.mp4`);
    const videoData = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(videoData, "utf-8"));

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `         FACEBOOK VIDEO 🎬\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› العنوان: ${title}\n` +
                `› تم بواسطة: ڪايࢪوس\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ استخدم اوامر [فيس] للتفاصيل ✅\n` +
                `╯────────── ⊞ ──────────╰`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("جلى الرمية! تأكد إنو الفيديو عام (Public) والرابط صحيح.", threadID, messageID);
  }
};
