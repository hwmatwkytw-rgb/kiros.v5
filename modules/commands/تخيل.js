const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تخيل",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "صنع صور بالذكاء الاصطناعي (مجاني وسريع)",
  commandCategory: "الخدمات",
  usages: "[وصف الصورة بالعربية]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) return api.sendMessage("╭── • 📥 • ──╮\n اكتب وصفاً ليتخيله كايࢪوس\n╰── • 📥 • ──╯", threadID, messageID);

  api.setMessageReaction("🎨", messageID, () => {}, true);

  try {
    // ترجمة الوصف للعربية تلقائياً لضمان دقة الرسم
    const trRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
    const enPrompt = trRes.data[0][0][0];

    // API الرسم السريع
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enPrompt)}?width=1080&height=1080&model=flux`;
    
    const cachePath = path.join(__dirname, "cache", `imagine_${Date.now()}.png`);
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(imgRes.data, "binary"));

    return api.sendMessage({
      body: `╭── • ڪايࢪوس • ──╮\n  ⌈ خـيـال الـذكـاء الاصـطـنـاعـي ⌋\n╰── • ✨ • ──╯\n\n✅ تـم رسـم: ${prompt}\n\n『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (e) {
    return api.sendMessage("❌ عذراً، محرك الرسم مشغول حالياً.", threadID, messageID);
  }
};
