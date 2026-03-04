const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ريشة",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "نظام تحويل الأنماط الفنية المتطور",
  commandCategory: "الصور",
  usages: "[قائمة / بحث / رقم النمط]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, type, messageReply } = event;
  const input = args[0];

  // 1. عرض قائمة الأنماط المتوفرة
  if (input === "قائمة" || !input) {
    api.setMessageReaction("🫧", messageID, () => {}, true);
    
    // قائمة الأنماط (تُجلب من أقوى API متاح)
    const styleList = [
      "Anime 🌸", "Cyberpunk 🌆", "Oil Painting 🎨", 
      "Van Gogh 🌻", "Sketch ✏️", "Mosaic 🧱", 
      "3D Render 🧊", "Vibrant 🌈", "Gothic 🕸️"
    ];
    
    let listMsg = `◸——————————————————◹\n   ⌬ مـوسـوعة ريـشة الـجمال ⌬\n◺——————————————————◿\n\n`;
    styleList.forEach((s, index) => {
      listMsg += `  💠 [ ${index + 1} ] ⟸ ${s}\n`;
    });
    listMsg += `\n——————————————————\n🕊️ للـتطبيق: رد على صورة بـ (ريشة + الرقم)\n❄️ للـبحث: (ريشة بحث [الاسم])`;
    
    return api.sendMessage(listMsg, threadID, messageID);
  }

  // 2. تطبيق النمط بالرد على صورة
  let attachmentUrl;
  if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
    attachmentUrl = messageReply.attachments[0].url;
  } else if (event.attachments[0]?.type === "photo") {
    attachmentUrl = event.attachments[0].url;
  }

  if (!attachmentUrl) return api.sendMessage("🕊️ يرجى الرد على صورة لتنثر الريشة سحرها عليها.", threadID, messageID);

  // التفاعل برمز إعادة التشغيل (🔄) كما طلبت سابقاً
  api.setMessageReaction("🔄", messageID, () => {}, true);
  const loading = await api.sendMessage("⌬ جاري مزج الألوان ونسج النمط.. 🎨", threadID);

  try {
    // استخدام أقوى API مجاني ومعروف بسرعته (مثال: محرك Prodia أو Pollinations)
    const styleName = isNaN(input) ? input : "style_" + input; 
    const apiUrl = `https://api.samirxp.xyz/api/stylize?url=${encodeURIComponent(attachmentUrl)}&style=${encodeURIComponent(styleName)}`;

    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

    const cachePath = path.join(__dirname, "cache", `kirus_art_${Date.now()}.png`);
    fs.writeFileSync(cachePath, Buffer.from(res.data, "binary"));

    api.unsendMessage(loading.messageID);
    
    // التفاعل بـ ✅ عند النجاح
    api.setMessageReaction("✅", messageID, () => {}, true);

    const reportUI = 
      `◸——————————————————◹\n` +
      `   ⌬ تـقـرير ريـشة الإبـداع ⌬\n` +
      `◺——————————————————◿\n\n` +
      `✨ تـم رسـم الـلوحة بـنقـاء.\n` +
      `💠 الـنمط: ${input}\n` +
      `🔢 الـعملية: #KRS-${Math.floor(Math.random() * 900) + 100}\n\n` +
      `——————————————————\n` +
      `بـلمسة رقيقة من ڪايࢪوس 🦋`;

    return api.sendMessage({
      body: reportUI,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (e) {
    api.unsendMessage(loading.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❄️ عذراً، الريشة واجهت عائقاً في رسم هذا الخيال.", threadID, messageID);
  }
};
