const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تحسين",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحسين جودة الصور بالذكاء الاصطناعي (Real-ESRGAN)",
  commandCategory: "الصور",
  cooldowns: 15
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  // التحقق من وجود صورة
  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("📸 ○ نعتذر.. يجب الرد على صورة أولاً", threadID, messageID);
  }

  const startTime = Date.now();
  const imageUrl = messageReply.attachments[0].url;

  try {
    // تفاعل أولي
    api.setMessageReaction("⏳", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖤 𝖭 𝖦 𝖨 𝖭 𝖤
╯─────── 🝓 ───────╰
│ ⌑ الحالة : جاري المعالجة...
│ ⌑ المحرك : Real-ESRGAN
│ ⌑ انتظر قليلاً يا ملك ○
╯────────────── 🝓`;

    const info = await api.sendMessage(loadingMsg, threadID);

    // استخدام بروكـسي أو API مباشر للتحسين (يفضل استخدام Replicate عبر سرور خارجي أو API مفتاح مخفي)
    // هنا سنستخدم رابط API التحسين الاحترافي
    const upscaleUrl = `https://raihan-api.vercel.app/remini?url=${encodeURIComponent(imageUrl)}`;

    const response = await axios.get(upscaleUrl, { responseType: "arraybuffer" });
    
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `kairus_pro_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data, "utf-8"));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭
    𝖯 𝖱 𝖮   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : تم بنجاح ○
│ ⌑ الدقة : 4K Enhanced
│ ⌑ الوقت : ${duration} ثانية
│ ⌑ المطور : DANTE
╯────────────── 🝓`;

    return api.sendMessage({
      body: report,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل النظام في تحسين الصورة\n╯─────── 🝓", threadID, messageID);
  }
};
