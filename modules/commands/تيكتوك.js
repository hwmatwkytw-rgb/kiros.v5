const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تيكتوك",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تحميل تيك توك مع عرض تفاصيل الفيديو",
  commandCategory: "الوسائط",
  usages: "[رابط الفيديو]",
  cooldowns: 7
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const link = args[0];

  if (!link || !link.includes("tiktok.com")) {
    return api.sendMessage("╭── • 📥 • ──╮\n يرجى وضع رابط تيك توك صحيح\n╰── • 📥 • ──╯", threadID, messageID);
  }

  api.setMessageReaction("📥", messageID, () => {}, true);

  try {
    const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(link)}`);
    const data = res.data;
    
    // استخراج التفاصيل
    const title = data.title || "بدون عنوان";
    const author = data.author.nickname || data.author.unique_id;
    const likes = data.stats.likeCount || 0;
    const comments = data.stats.commentCount || 0;
    const shares = data.stats.shareCount || 0;
    const music = data.music.title || "الأصلي";

    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ تـحـمـيـل تـيـك تـوك ⌋\n` +
                 `╰── • 🎬 • ──╯\n\n` +
                 `👤 الـمـبدع: ${author}\n` +
                 `📝 الـوصـف: ${title}\n` +
                 `🎵 الـمـوسـيقى: ${music}\n\n` +
                 `❤️ الإعجابات: ${likes.toLocaleString()}\n` +
                 `💬 الـتـعليقات: ${comments.toLocaleString()}\n` +
                 `🔗 الـمـشـاركات: ${shares.toLocaleString()}\n\n` +
                 `* جاري إرسال الفيديو بدون علامة مائية...`;

    const waitMsg = await api.sendMessage(msg, threadID, messageID);

    const filePath = path.join(__dirname, "cache", `tiktok_${Date.now()}.mp4`);
    const videoRes = await axios.get(data.video.noWatermark, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(videoRes.data, "binary"));

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: `✅ تـم الـتـحـمـيـل بـواسطـة ڪايࢪوس`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
        fs.unlinkSync(filePath);
        api.unsendMessage(waitMsg.messageID);
    }, messageID);

  } catch (err) {
    return api.sendMessage("❌ عذراً، لم أتمكن من جلب تفاصيل هذا الفيديو.", threadID, messageID);
  }
};
