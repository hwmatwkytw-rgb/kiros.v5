const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "جودة",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تعلية جودة الصور بالذكاء الاصطناعي",
  commandCategory: "الصور",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;
  let attachmentUrl;

  if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
    attachmentUrl = messageReply.attachments[0].url;
  } else if (event.attachments[0]?.type === "photo") {
    attachmentUrl = event.attachments[0].url;
  }

  if (!attachmentUrl) return api.sendMessage("✨ يرجى الرد على صورة لرفع جودتها.", threadID, messageID);

  api.setMessageReaction("🔄", messageID, () => {}, true);
  const loading = await api.sendMessage("◸——————————————————◹\n   ⌬ جاري صقل الصورة لـ 4K.. ⌬\n◺——————————————————◿", threadID);

  try {
    // API قوي جداً لتعلية الجودة
    const res = await axios.get(`https://api.samirxp.xyz/api/upscale?url=${encodeURIComponent(attachmentUrl)}`, {
      responseType: "arraybuffer"
    });

    const cachePath = path.join(__dirname, "cache", `highres_${Date.now()}.png`);
    fs.writeFileSync(cachePath, Buffer.from(res.data, "binary"));

    api.unsendMessage(loading.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const reportUI = 
      `◸——————————————————◹\n` +
      `   ⌬ تـقـرير تـعـلية الـجودة ⌬\n` +
      `◺——————————————————◿\n\n` +
      `✨ تم تحسين الصورة بنجاح.\n` +
      `🚀 الجودة: 4K Ultra HD\n` +
      `🎨 المعالج: Neural Engine\n\n` +
      `——————————————————\n` +
      `صُنع بـحُب لـ ڪايࢪوس 🦋`;

    return api.sendMessage({ body: reportUI, attachment: fs.createReadStream(cachePath) }, threadID, () => fs.unlinkSync(cachePath), messageID);
  } catch (e) {
    api.unsendMessage(loading.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("🍃 واجه النظام صعوبة في معالجة هذه الصورة.", threadID, messageID);
  }
};
