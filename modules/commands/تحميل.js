const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تحميل",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تحميل ذكي من كل المنصات مع تفاعل ملون",
  commandCategory: "الخدمات",
  usages: "[رابط الفيديو]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) return api.sendMessage("✨ يرجى إدراج الرابط الذي تود تحميله.", threadID, messageID);

  // تحديد المنصة والتفاعل اللوني
  let platform = "منصة غير معروفة";
  let emoji = "📥";
  let theme = "✨";

  if (url.includes("youtube.com") || url.includes("youtu.be")) { platform = "يوتيوب"; emoji = "🔴"; theme = "🔻"; }
  else if (url.includes("tiktok.com")) { platform = "تيك توك"; emoji = "🖤"; theme = "🎵"; }
  else if (url.includes("facebook.com") || url.includes("fb.watch")) { platform = "فيسبوك"; emoji = "🔵"; theme = "🔹"; }
  else if (url.includes("instagram.com")) { platform = "إنستجرام"; emoji = "🟣"; theme = "📸"; }

  api.setMessageReaction(emoji, messageID, () => {}, true);
  const waitMsg = await api.sendMessage(`${theme} جاري جلب البيانات من ${platform}.. يرجى الانتظار.`, threadID);

  try {
    // API جديد سريع
    const apiRes = await axios.get(`https://api.ryann.my.id/download/allinone?url=${encodeURIComponent(url)}`);
    
    // استخراج رابط التحميل والبيانات
    const result = apiRes.data;
    if (!result || result.status !== 200) throw new Error("API_ERROR");

    const downloadUrl = result.data.download_url;
    const title = result.data.title || "فيديو بدون عنوان";

    if (!downloadUrl) throw new Error("URL_NOT_FOUND");

    const cachePath = path.join(__dirname, "cache", `kirus_${Date.now()}.mp4`);
    
    // عملية تحميل الفيديو
    const videoStream = await axios.get(downloadUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(videoStream.data, "binary"));

    const stats = fs.statSync(cachePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // حد الإرسال (تجاوز 45 ميجا قد يسبب فشل الإرسال في مسنجر)
    if (stats.size > 45 * 1024 * 1024) { 
      fs.unlinkSync(cachePath);
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("🍃 عذراً، الفيديو ثقيل جداً (تجاوز 45MB).", threadID, messageID);
    }

    api.unsendMessage(waitMsg.messageID);
    
    return api.sendMessage({
      body: `•————— 🦋 ڪايࢪوس —————•\n\n` +
            `📝 الـعنوان: ${title}\n` +
            `🌐 المـنصة: ${platform}\n` +
            `⚖️ الـحجم: ${sizeMB} MB\n\n` +
            `•————————————————•`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    console.error(err); // لتوثيق الخطأ في الكونسول
    return api.sendMessage("🍃 لم أستطع تحميل الفيديو، تأكد من أن الرابط متاح للعامة أو أن الـ API لا يزال يعمل.", threadID, messageID);
  }
};
