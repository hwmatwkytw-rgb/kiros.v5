const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Replicate = require("replicate");

module.exports.config = {
  name: "تحسين",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "KYROS AI",
  description: "تحسين الصور بالذكاء الاصطناعي (نسخة احترافية)",
  commandCategory: "الصور",
  cooldowns: 15
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments[0]) {
    return api.sendMessage("📸 | رد على صورة أولاً", threadID, messageID);
  }

  const startTime = Date.now(); // ⏱️ بداية الوقت
  const imageUrl = messageReply.attachments[0].url;

  try {
    api.setMessageReaction("🧠", messageID, () => {}, true);

    const loading = await api.sendMessage(
`╭───────────────╮
│ 🧠 KYROS AI ENGINE │
╰───────────────╯

⏳ جاري تحليل وتحسين الصورة...
📡 الرجاء الانتظار`,
      threadID
    );

    // 🔐 Replicate
    const replicate = new Replicate({
      auth: "r8_6ptaaTA1CC3d5u0tDVWupNgQKE47hJ74cnfVd"
    });

    // 🧠 تشغيل النموذج
    const output = await replicate.run(
      "nightmareai/real-esrgan",
      {
        input: {
          image: imageUrl,
          scale: 2
        }
      }
    );

    const resultUrl = Array.isArray(output) ? output[0] : output;

    const res = await axios.get(resultUrl, {
      responseType: "arraybuffer"
    });

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `pro_${Date.now()}.png`);
    fs.writeFileSync(filePath, res.data);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    api.unsendMessage(loading.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report =
`╭───────────────╮
│ ✨ KYROS AI REPORT │
╰───────────────╯

🧠 الحالة: تم بنجاح
🚀 المحرك: Real-ESRGAN
🎯 الجودة: عالية جداً (×2)

⏱️ وقت المعالجة: ${duration} ثانية
📡 المصدر: Replicate API

╰───「 تم بواسطة الذكاء الاصطناعي 」───╯`;

    return api.sendMessage(
      {
        body: report,
        attachment: fs.createReadStream(filePath)
      },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );

  } catch (e) {
    console.log(e);

    api.setMessageReaction("❌", messageID, () => {}, true);

    return api.sendMessage(
`╭───────────────╮
│ ❌ خطأ في النظام │
╰───────────────╯

⚠️ فشل تحسين الصورة
💡 حاول مرة أخرى لاحقاً`,
      threadID,
      messageID
    );
  }
};
