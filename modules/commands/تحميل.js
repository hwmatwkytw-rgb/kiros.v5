const apiManager = require('../../utils/apis');
const formatter = require('../../utils/formatter');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "تحميل",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Manus-Agent",
  description: "تحميل ذكي وفائق السرعة من (YouTube, TikTok, FB, IG)",
  commandCategory: "وسائط",
  usages: "[رابط الفيديو]",
  cooldowns: 5,
  dependencies: {
      axios: "",
      "fs-extra": ""
  }
};

module.exports.run = async function ({ api: bot, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) {
    return bot.sendMessage(formatter.formatMessage("يرجى وضع رابط الفيديو بعد الأمر.\nمثال: .تحميل [رابط]", "INFO"), threadID, messageID);
  }

  // تحديد المنصة والرموز
  let platform = "الويب";
  let emoji = "📥";
  if (url.includes("youtube.com") || url.includes("youtu.be")) { platform = "YouTube"; emoji = "🔴"; }
  else if (url.includes("tiktok.com")) { platform = "TikTok"; emoji = "🖤"; }
  else if (url.includes("facebook.com") || url.includes("fb.watch")) { platform = "Facebook"; emoji = "🔵"; }
  else if (url.includes("instagram.com")) { platform = "Instagram"; emoji = "🟣"; }

  bot.setMessageReaction(emoji, messageID, () => {}, true);
  const waitMsg = await bot.sendMessage(formatter.formatMessage(`جاري معالجة رابط ${platform} عبر خوادم N-Dora... 🎬`, "WAIT"), threadID);

  try {
    let downloadUrl = "";
    let title = "فيديو مستخرج";

    // محاولة جلب الرابط من المحرك المركزي
    const videoData = await apiManager.getUniversalDownload(url);
    
    if (videoData) {
      downloadUrl = videoData.url || videoData.mp3 || videoData.video || videoData.download;
      title = videoData.title || title;
    }

    if (!downloadUrl) {
      // محاولة بديلة لـ YouTube
      if (platform === "YouTube") {
        const ytData = await apiManager.getYouTubeDownload(url);
        downloadUrl = ytData?.mp3 || ytData?.url;
      }
    }

    if (!downloadUrl) throw new Error("NOT_FOUND");

    // معالجة الملف مؤقتاً
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    const cachePath = path.join(cacheDir, `ndora_${Date.now()}.mp4`);

    const videoBuffer = await axios.get(downloadUrl, { responseType: "arraybuffer", timeout: 180000 });
    fs.writeFileSync(cachePath, Buffer.from(videoBuffer.data, "binary"));

    const stats = fs.statSync(cachePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // قيود فيسبوك (48MB كحد أقصى)
    if (stats.size > 48 * 1024 * 1024) { 
      fs.unlinkSync(cachePath);
      bot.unsendMessage(waitMsg.messageID);
      bot.setMessageReaction("⚠️", messageID, () => {}, true);
      return bot.sendMessage(formatter.formatMessage(`حجم الفيديو (${sizeMB}MB) يتخطى حدود الإرسال المسموح بها.`, "ERROR"), threadID, messageID);
    }

    bot.setMessageReaction("✅", messageID, () => {}, true);
    bot.unsendMessage(waitMsg.messageID);
    
    return bot.sendMessage({
      body: formatter.formatMessage(`تم استخراج الفيديو بنجاح!\n📝 العنوان: ${title.substring(0, 40)}...\n🌐 المنصة: ${platform}\n⚖️ الحجم: ${sizeMB} MB`, "SUCCESS"),
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    bot.unsendMessage(waitMsg.messageID);
    bot.setMessageReaction("❌", messageID, () => {}, true);
    return bot.sendMessage(formatter.formatMessage("فشل النظام في جلب الفيديو. تأكد من أن الرابط صحيح وعام.", "ERROR"), threadID, messageID);
  }
};
