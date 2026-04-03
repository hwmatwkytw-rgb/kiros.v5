const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "تحسين",
  version: "5.5.0",
  credits: "DANTE",
  description: "تحسين الجودة عبر سيرفر كايروس",
  commandCategory: "الصور",
  cooldowns: 15
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;
  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("📸 ○ رد على صورة يا ملك", threadID, messageID);
  }

  const tempPath = path.join(__dirname, "cache", `raw_${Date.now()}.jpg`);
  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);
    const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: 'arraybuffer' });
    fs.outputFileSync(tempPath, Buffer.from(imgRes.data));

    // الرفع للسيرفر الموحد (file)
    const form = new FormData();
    form.append('file', fs.createReadStream(tempPath));
    const upload = await axios.post('https://kiros-api-22.onrender.com/api/upload', form, { headers: form.getHeaders() });
    
    // التحسين
    const upscaleUrl = `https://api.shayan.tech/remini?url=${encodeURIComponent(upload.data.url)}`;
    const result = await axios.get(upscaleUrl, { responseType: "arraybuffer" });
    
    const finalPath = path.join(__dirname, "cache", `hd_${Date.now()}.png`);
    fs.outputFileSync(finalPath, Buffer.from(result.data));

    api.sendMessage({ body: "✅ تم التحسين (𝖪𝖠𝖨𝖱𝖴𝖲 𝖧𝖣) ○", attachment: fs.createReadStream(finalPath) }, threadID, () => {
      fs.unlinkSync(tempPath); fs.unlinkSync(finalPath);
    }, messageID);
  } catch (e) {
    api.sendMessage("❌ فشل المحرك حالياً..", threadID, messageID);
  }
};
