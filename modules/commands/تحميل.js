const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تحميل",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "تحميل ذكي (Apify Engine) مع تنسيق ڪايࢪوس الأنيق",
  commandCategory: "الخدمات",
  usages: "[رابط الفيديو]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];
  
  // المفتاح الخاص بك الذي قمت بتزويدي به
  const APIFY_TOKEN = "apify_api_eDLZzyxOOebIxT0Nf5yqjKYxhuf6Pw2rQ6ST"; 

  if (!url) {
    return api.sendMessage("─── 🦋 ڪايࢪوس ───\n✨ يرجى إدراج الرابط الذي تود تحميله.", threadID, messageID);
  }

  // إعدادات المنصات والتفاعلات
  let platform = "الويب";
  let emoji = "📥";
  let theme = "🔹";

  if (url.includes("youtube.com") || url.includes("youtu.be")) { platform = "YouTube"; emoji = "🔴"; theme = "🔻"; }
  else if (url.includes("tiktok.com")) { platform = "TikTok"; emoji = "🖤"; theme = "🎵"; }
  else if (url.includes("facebook.com") || url.includes("fb.watch")) { platform = "Facebook"; emoji = "🔵"; theme = "🔹"; }
  else if (url.includes("instagram.com")) { platform = "Instagram"; emoji = "🟣"; theme = "📸"; }

  // تفاعل البدء
  api.setMessageReaction(emoji, messageID, () => {}, true);
  const waitMsg = await api.sendMessage(`${theme} جاري معالجة الرابط عبر خوادم ڪايࢪوس..`, threadID);

  try {
    let downloadUrl = "";
    let title = "فيديو مستخرج";

    // --- المحرك الأول: Apify (الأكثر دقة) ---
    try {
      const apifyEndpoint = `https://api.apify.com/v2/acts/wilcode~all-social-media-video-downloader/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
      const apifyRes = await axios.post(apifyEndpoint, {
        url: url,
        mergeAV: true,
        mergeYoutube: true
      }, { timeout: 45000 });

      if (apifyRes.data && apifyRes.data.length > 0) {
        const result = apifyRes.data[0];
        downloadUrl = result.download || result.url;
        title = result.title || title;
      }
    } catch (e) {
      console.log("Apify engine bypass, trying secondary nodes...");
    }

    // --- المحرك الثاني: Fallback (في حال فشل الأول) ---
    if (!downloadUrl) {
      const fallbacks = [
        `https://api.ryann.my.id/download/allinone?url=${encodeURIComponent(url)}`,
        `https://api.vreden.my.id/api/download/allinone?url=${encodeURIComponent(url)}`
      ];

      for (const link of fallbacks) {
        try {
          const res = await axios.get(link, { timeout: 15000 });
          if (res.data) {
            downloadUrl = res.data.data?.download_url || res.data.result?.url;
            title = res.data.data?.title || res.data.result?.title || title;
            if (downloadUrl) break;
          }
        } catch (e) { continue; }
      }
    }

    if (!downloadUrl) throw new Error("NOT_FOUND");

    // --- معالجة الملف مؤقتاً ---
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const cachePath = path.join(cacheDir, `kyros_${Date.now()}.mp4`);

    const videoBuffer = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 180000 });
    fs.writeFileSync(cachePath, Buffer.from(videoBuffer.data, "binary"));

    const stats = fs.statSync(cachePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // قيود فيسبوك (48MB كحد أقصى)
    if (stats.size > 48 * 1024 * 1024) { 
      fs.unlinkSync(cachePath);
      api.unsendMessage(waitMsg.messageID);
      api.setMessageReaction("⚠️", messageID, () => {}, true);
      return api.sendMessage(`─── 🦋 ڪايࢪوس ───\n🍃 حجم الفيديو (${sizeMB}MB) يتخطى حدود الإرسال.`, threadID, messageID);
    }

    // تفاعل النجاح
    api.setMessageReaction("✅", messageID, () => {}, true);
    api.unsendMessage(waitMsg.messageID);
    
    // إرسال النتيجة النهائية
    return api.sendMessage({
      body: `─── 🦋 ڪايࢪوس ───\n\n` +
            `📝 العنوان: ${title.substring(0, 40)}...\n` +
            `🌐 المنصة: ${platform}\n` +
            `⚖️ الحجم: ${sizeMB} MB\n\n` +
            `─── ─── ─── ───`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("─── 🦋 ڪايࢪوس ───\n🍃 فشل النظام في جلب الفيديو، تأكد من خصوصية الرابط.", threadID, messageID);
  }
};
