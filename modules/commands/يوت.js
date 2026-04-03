const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "يوت",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحميل فيديوهات اليوتيوب بجودة عالية (استايل كايروس)",
  commandCategory: "الوسائط",
  usages: "[رابط الفيديو]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى وضع رابط يوتيوب صحيح ○\n╯────────────── 🝓", threadID, messageID);
  }

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭\n    𝖸 𝖮 𝖴 𝖳 𝖴 𝖡 𝖤   𝖣 𝖮 𝖶 𝖭\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : جاري جلب الفيديو...\n│ ⌑ المصدر : YouTube Engine\n╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    // استخدام API تحميل مستقر وسريع (مشابه لنظام التيك توك)
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`);
    const data = res.data.result;

    if (!data || !data.download) throw new Error("رابط غير صالح");

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `yt_${Date.now()}.mp4`);
    
    // جلب الفيديو كـ Stream لتوفير الذاكرة
    const videoStream = await axios.get(data.download, { responseType: "arraybuffer" });
    
    const fileSizeMB = (videoStream.data.byteLength / (1024 * 1024)).toFixed(2);
    
    if (fileSizeMB > 45) { // حد أقصى 45 ميجا لضمان الإرسال
        api.unsendMessage(info.messageID);
        return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ الفيديو كبير جداً للإرسال ○\n╯────────────── 🝓", threadID, messageID);
    }

    fs.writeFileSync(filePath, Buffer.from(videoStream.data));

    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭\n    𝖸 𝖳   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳\n╯─────── 🝓 ───────╰\n│ ⌑ العنوان : ${data.title.substring(0, 30)}...\n│ ⌑ الحجم : ${fileSizeMB} MB\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    return api.sendMessage({
      body: report,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل سحب الفيديو.. جرب رابطاً آخر ○\n╯────────────── 🝓", threadID, messageID);
  }
};
