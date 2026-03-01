const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تحميل",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تحميل ذكي من كل المنصات مع تفاعل ملون - APIs متعددة",
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
    // --- نظام الـ APIs المتعددة ---
    const apiEndpoints = [
      `https://api.ryann.my.id/download/allinone?url=${encodeURIComponent(url)}`,
      `https://api.vreden.my.id/api/download/allinone?url=${encodeURIComponent(url)}`,
      `https://api.kenliejugarap.com/all-downloader?url=${encodeURIComponent(url)}`
    ];

    let apiRes = null;
    let apiUsed = "";

    // تجربة الـ APIs حتى يعمل أحدها
    for (const endpoint of apiEndpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 15000 });
        if (response.data && (response.data.status === 200 || response.data.result)) {
          apiRes = response.data;
          apiUsed = endpoint;
          break;
        }
      } catch (e) {
        continue; // جرب التالي
      }
    }

    if (!apiRes) throw new Error("API_ERROR");

    // --- استخراج البيانات بناءً على الـ API ---
    let downloadUrl = "";
    let title = "فيديو بدون عنوان";

    if (apiUsed.includes("ryann")) {
      downloadUrl = apiRes.data.download_url;
      title = apiRes.data.title;
    } else if (apiUsed.includes("vreden")) {
      downloadUrl = apiRes.result.url;
      title = apiRes.result.title;
    } else if (apiUsed.includes("kenlie")) {
      downloadUrl = apiRes.download_url;
      title = apiRes.title;
    }

    if (!downloadUrl) throw new Error("URL_NOT_FOUND");

    // --- إدارة الملفات ---
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    const cachePath = path.join(cacheDir, `kirus_${Date.now()}.mp4`);
    
    // عملية تحميل الفيديو
    const videoStream = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 120000 });
    fs.writeFileSync(cachePath, Buffer.from(videoStream.data, "binary"));

    const stats = fs.statSync(cachePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // حد الإرسال (45 ميجا للفيسبوك)
    if (stats.size > 45 * 1024 * 1024) { 
      fs.unlinkSync(cachePath);
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage("🍃 عذراً، الفيديو ثقيل جداً (تجاوز 45MB).", threadID, messageID);
    }

    api.unsendMessage(waitMsg.messageID);
    
    // --- إرسال الرسالة ---
    return api.sendMessage({
      body: `•————— 🦋 ڪايࢪوس —————•\n\n` +
            `📝 الـعنوان: ${title.substring(0, 50)}...\n` +
            `🌐 المـنصة: ${platform}\n` +
            `⚖️ الـحجم: ${sizeMB} MB\n\n` +
            `•————————————————•`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    console.error("Download Error:", err);
    return api.sendMessage("🍃 لم أستطع تحميل الفيديو، تأكد من أن الرابط متاح للعامة.", threadID, messageID);
  }
};
