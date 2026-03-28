const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Replicate = require("replicate");

module.exports.config = {
  name: "تعديل",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "KYROS AI",
  description: "تعديل الصور بالوصف (AI حقيقي)",
  commandCategory: "الصور",
  usages: "[الوصف]",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("✨ اكتب وصف التعديل\nمثال: تعديل اجعلها انمي", threadID, messageID);
  }

  if (!messageReply || !messageReply.attachments[0]) {
    return api.sendMessage("📸 رد على صورة مع كتابة الوصف", threadID, messageID);
  }

  const startTime = Date.now();
  const imageUrl = messageReply.attachments[0].url;

  try {
    api.setMessageReaction("🎨", messageID, () => {}, true);

    const loading = await api.sendMessage(
`╭───────────────╮
│ 🎨 KYROS EDITOR │
╰───────────────╯

⏳ جاري تنفيذ التعديل:
"${prompt}"`,
      threadID
    );

    // 🔑 API KEY
    const replicate = new Replicate({
      auth: "r8_6ptaaTA1CC3d5u0tDVWupNgQKE47hJ74cnfVd"
    });

    // 🔥 تعديل الصورة (img2img)
    const output = await replicate.run(
      "stability-ai/stable-diffusion",
      {
        input: {
          prompt: prompt,
          image: imageUrl,
          strength: 0.7
        }
      }
    );

    const resultUrl = Array.isArray(output) ? output[0] : output;

    const img = await axios.get(resultUrl, {
      responseType: "arraybuffer"
    });

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `edit_${Date.now()}.png`);
    fs.writeFileSync(filePath, img.data);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    api.unsendMessage(loading.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report =
`╭───────────────╮
│ ✨ KYROS EDIT │
╰───────────────╯

🎨 التعديل: ${prompt}
🧠 النموذج: Stable Diffusion

⏱️ الوقت: ${duration} ثانية
📡 AI Processing

╰───「 تم التعديل بنجاح 」───╯`;

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
`❌ فشل التعديل
💡 ممكن السبب:
- الصورة غير مدعومة
- الضغط على السيرفر
- انتهى رصيد API`,
      threadID,
      messageID
    );
  }
};
