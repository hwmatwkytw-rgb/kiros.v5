const axios = require("axios");
const FormData = require("form-data"); // موجودة في ملفك

module.exports.config = {
  name: "رابط",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "رفع الصور والحصول على رابط مباشر سريع",
  commandCategory: "الخدمات",
  usages: "[رد على صورة]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;

  if (type !== "message_reply" || !messageReply.attachments[0]) {
    return api.sendMessage("╭── • 📥 • ──╮\n قم بالرد على (صورة/فيديو/صوت)\n╰── • 📥 • ──╯", threadID, messageID);
  }

  api.setMessageReaction("☁️", messageID, () => {}, true);

  try {
    const fileURL = messageReply.attachments[0].url;
    const response = await axios.get(fileURL, { responseType: "stream" });
    
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", response.data);

    // استخدام Catbox API (سريع ومجاني للأبد)
    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const directLink = uploadRes.data;

    return api.sendMessage(`╭── • ڪايࢪوس • ──╮\n  ⌈ مـركـز الـرفـع الـسـريـع ⌋\n╰── • 🔗 • ──╯\n\n✅ الـرابط الـمـباشـر:\n${directLink}\n\n『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`, threadID, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ فشل الرفع، قد يكون حجم الملف كبيراً جداً.", threadID, messageID);
  }
};
