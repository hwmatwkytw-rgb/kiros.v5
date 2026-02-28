const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ارسم",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "توليد صور فنية من خلال الوصف النصي",
  commandCategory: "الصور",
  usages: "[الوصف]",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("✨ يرجى إدخال وصف للصورة.\nمثال: ارسم قطة ترتدي نظارة شمسية في الفضاء.", threadID, messageID);

  api.setMessageReaction("🎨", messageID, () => {}, true);
  const loading = await api.sendMessage("◸——————————————————◹\n   ⌬ جاري رسم الصورة.. ⌬\n◺——————————————————◿", threadID);

  try {
    // API قوي ومجاني لتوليد الصور (Stable Diffusion)
    const res = await axios.get(`https://api.samirxp.xyz/api/stablediffusion?prompt=${encodeURIComponent(prompt)}`, {
      responseType: "arraybuffer"
    });

    const cachePath = path.join(__dirname, "cache", `art_${Date.now()}.png`);
    fs.writeFileSync(cachePath, Buffer.from(res.data, "binary"));

    api.unsendMessage(loading.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const reportUI = 
      `◸——————————————————◹\n` +
      `   ⌬ تـقـرير الـرسم الـذكي ⌬\n` +
      `◺——————————————————◿\n\n` +
      `✨ تم رسم الصورة بنجاح.\n` +
      `📝 الوصف: ${prompt}\n` +
      `🤖 النموذج: Stable Diffusion XL\n\n` +
      `——————————————————\n` +
      `صُنع بـحُب لـ ڪايࢪوس 🦋`;

    return api.sendMessage({ body: reportUI, attachment: fs.createReadStream(cachePath) }, threadID, () => fs.unlinkSync(cachePath), messageID);
  } catch (e) {
    api.unsendMessage(loading.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("🍃 فشل النظام في توليد الصورة، حاول بوصف آخر.", threadID, messageID);
  }
};
