const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "فيس",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "تحميل فيديوهات الفيسبوك بخوارزمية التمويه",
  commandCategory: "الوسائط والتحميل",
  usages: "[رابط الفيديو]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) return api.sendMessage("يا حبيبنا وين الرابط؟ ₍ •`-ʼ• ₎", threadID, messageID);

  try {
    // التفاعل لبدء عملية "الخداع" بنجاح
    api.setMessageReaction("📥", messageID, () => {}, true);

    // الخوارزمية: إرسال الطلب مع User-Agent لمتصفح حقيقي لتجنب الحظر
    const res = await axios.get(`https://api.vyt.com/fb?url=${encodeURIComponent(url)}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
    });

    // جلب الرابط المباشر (الخوارزمية بتفضل الـ HD دائماً)
    const videoUrl = res.data.hd || res.data.sd || res.data.url;
    
    if (!videoUrl) throw new Error("Link not found");

    const filePath = path.resolve(__dirname, 'cache', `fb_kirus_${Date.now()}.mp4`);
    
    // تحميل الفيديو مع التمويه أيضاً
    const videoStream = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'arraybuffer',
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36"
        }
    });

    fs.writeFileSync(filePath, Buffer.from(videoStream.data, "utf-8"));

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `         FACEBOOK VIDEO 🎬\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› الحالة: تم فك التشفير بنجاح ✅\n` +
                `› المصدر: فيسبوك\n` +
                `› بواسطة: ڪايࢪوس\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ استخدم اوامر [فيس] للتفاصيل ⚠️\n` +
                `╯────────── ⊞ ──────────╰`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (e) {
    console.error(e);
    // في حال فشل الخوارزمية الأولى، نرسل تنبيه ذكي
    return api.sendMessage("الموقع كشف الخدعة! 🐸 تأكد إنو الفيديو 'عام' وجرب رابط تاني.", threadID, messageID);
  }
};
