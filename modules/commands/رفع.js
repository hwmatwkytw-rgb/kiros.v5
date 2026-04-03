const axios = require("axios");

module.exports.config = {
  name: "رفع",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "رفع الصور وتحويلها إلى رابط مباشر (استايل كايروس)",
  commandCategory: "أدوات",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;

  // التحقق من وجود صورة في الرد
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length == 0) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى الرد على صورة لرفعها ○\n╯────────────── 🝓", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى الرد على صورة فقط ○\n╯────────────── 🝓", threadID, messageID);
  }

  try {
    api.setMessageReaction("☁️", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭\n    𝖴 𝖯 𝖫 𝖮 𝖠 𝖣   𝖢 𝖤 𝖭 𝖳 𝖤 𝖱\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : جاري الرفع...\n│ ⌑ المصدر : Cloud Storage\n╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    // استخدام API رفع مستقر (ImgBB أو Catbox عبر بروكسي محكم)
    const res = await axios.get(`https://api.vreden.my.id/api/upload?url=${encodeURIComponent(attachment.url)}`);
    
    // التأكد من الحصول على الرابط المباشر
    const directLink = res.data.result.url || res.data.result;

    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭\n    𝖴 𝖯 𝖫 𝖮 𝖠 𝖣   𝖣 𝖮 𝖭 𝖤\n╯─────── 🝓 ───────╰\n│ ⌑ الرابط المباشر :\n│ ${directLink}\n│\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    return api.sendMessage(report, threadID, messageID);

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل رفع الصورة حالياً ○\n╯────────────── 🝓", threadID, messageID);
  }
};
