const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تعديل",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تعديل الصور بالذكاء الاصطناعي عبر الوصف (img2img)",
  commandCategory: "الصور",
  usages: "[الوصف بالإنجليزية]",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const prompt = args.join(" ");

  // التحقق من المدخلات
  if (!prompt) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ اكتب وصف التعديل يا ملك ○\n│ مثال: تعديل anime style\n╯────────────── 🝓", threadID, messageID);
  }

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يجب الرد على صورة أولاً ○\n╯────────────── 🝓", threadID, messageID);
  }

  const startTime = Date.now();
  const imageUrl = messageReply.attachments[0].url;

  try {
    // تفاعل البدء
    api.setMessageReaction("🎨", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖠 𝖨   𝖠 𝖱 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : جاري التعديل...
│ ⌑ الوصف : ${prompt.substring(0, 20)}...
│ ⌑ انتظر قليلاً يا ملك ○
╯────────────── 🝓`;

    const info = await api.sendMessage(loadingMsg, threadID);

    // استخدام محرك معالجة صور خارجي مستقر (Image-to-Image)
    const editApi = `https://api.shayan.tech/img2img?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;
    
    const response = await axios.get(editApi, { responseType: "arraybuffer" });
    
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `kairus_edit_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // إزالة رسالة الانتظار وتفاعل النجاح
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭
    𝖤 𝖣 𝖨 𝖳   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : تم التعديل بنجاح ○
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
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ عذراً.. فشل تعديل الصورة حالياً\n╯─────── 🝓", threadID, messageID);
  }
};
