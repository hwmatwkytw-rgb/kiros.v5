const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "موسوعة",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "بحث معلوماتي شامل باللغة العربية (استايل كايروس)",
  commandCategory: "الخدمات",
  usages: "[الموضوع]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ ماذا تريد أن تتعلم اليوم؟ ○\n╯────────────── 🝓", threadID, messageID);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    // محاولة جلب البيانات من ويكيبيديا العربية
    let url = `https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    let response;

    try {
      response = await axios.get(url);
    } catch (e) {
      // إذا فشل، البحث في الإنجليزية
      url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      response = await axios.get(url);
    }

    const data = response.data;
    let title = data.title;
    let description = data.extract;

    // وظيفة الترجمة إذا كان المحتوى غير عربي
    const translateText = async (text) => {
      const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return res.data[0].map(item => item[0]).join("");
    };

    // فحص اللغة والترجمة عند الحاجة
    if (!/[\u0600-\u06FF]/.test(description)) {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      title = await translateText(title);
      description = await translateText(description);
    }

    const report = `╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖶 𝖨 𝖪 𝖨\n╯─────── 🝓 ───────╰\n\n│ ⌑ الموضوع : ${title}\n\n│ ⌑ الملخص :\n│ ${description.substring(0, 500)}...\n\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    api.setMessageReaction("✅", messageID, () => {}, true);

    // معالجة الصورة المرفقة
    if (data.thumbnail && data.thumbnail.source) {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const imgPath = path.join(cacheDir, `wiki_${Date.now()}.png`);
      const imgRes = await axios.get(data.thumbnail.source, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

      return api.sendMessage({
        body: report,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);
    } else {
      return api.sendMessage(report, threadID, messageID);
    }

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ لم يتم العثور على معلومات كافية ○\n╯────────────── 🝓", threadID, messageID);
  }
};
