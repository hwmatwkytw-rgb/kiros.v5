const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "تحسين",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحسين الجودة 4K مع نظام معالجة الأخطاء الذكي",
  commandCategory: "الصور",
  cooldowns: 20
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("📸 ○ نعتذر.. يجب الرد على صورة أولاً", threadID, messageID);
  }

  const startTime = Date.now();
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  const tempPath = path.join(cacheDir, `kairus_raw_${Date.now()}.jpg`);

  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);
    const info = await api.sendMessage("╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖤 𝖭 𝖦 𝖨 𝖭 𝖤\n╯─────── 🝓 ───────╰\n│ ⌑ جاري التحسين عبر السيرفر الخاص...\n╯────────────── 🝓", threadID);

    // 1. تحميل ورفع الصورة لسيرفرك أولاً (جسر البيانات)
    const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(imgRes.data));

    const form = new FormData();
    form.append('image', fs.createReadStream(tempPath));
    const uploadRes = await axios.post('https://kiros-api-22.onrender.com/api/upload', form, {
      headers: form.getHeaders()
    });
    const myLink = uploadRes.data.url;

    // 2. محاولة التحسين (نظام المحرك الأساسي)
    let upscaleApi = `https://api.shayan.tech/remini?url=${encodeURIComponent(myLink)}`;
    
    // إذا تعطل المحرك الأول، نستخدم المحرك الاحتياطي (Fallback)
    let response;
    try {
        response = await axios.get(upscaleApi, { responseType: "arraybuffer", timeout: 40000 });
    } catch (e) {
        console.log("المحرك الأول فشل، جاري تجربة المحرك الاحتياطي...");
        upscaleApi = `https://raihan-api.vercel.app/remini?url=${encodeURIComponent(myLink)}`;
        response = await axios.get(upscaleApi, { responseType: "arraybuffer" });
    }
    
    const filePath = path.join(cacheDir, `kairus_hd_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖧 𝖣\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : تم بنجاح ○\n│ ⌑ الوقت : ${duration} ثانية\n╯────────────── 🝓`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      [tempPath, filePath].forEach(p => { if(fs.existsSync(p)) fs.unlinkSync(p); });
    }, messageID);

  } catch (error) {
    if(fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 فشل 」\n│ السيرفر الخارجي مضغوط حالياً.. حاول لاحقاً ○\n╯─────── 🝓", threadID, messageID);
  }
};
