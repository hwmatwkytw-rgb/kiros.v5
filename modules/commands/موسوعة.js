const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "موسوعة",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "بحث معلوماتي شامل باللغة العربية",
  commandCategory: "الخدمات",
  usages: "[الموضوع]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("╭── • 📥 • ──╮\n  ماذا تريد أن تتعلم اليوم؟\n╰── • 📥 • ──╯", threadID, messageID);

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    // 1. محاولة جلب البيانات من ويكيبيديا (العربية أولاً)
    let url = `https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    let response;
    
    try {
      response = await axios.get(url);
    } catch (e) {
      // 2. إذا لم يجد بالعربية، يجلب من الإنجليزية لضمان النتيجة
      url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      response = await axios.get(url);
    }

    let { title, extract, thumbnail, content_urls } = response.data;

    // 3. وظيفة الترجمة التلقائية للعربية (إذا كانت النتيجة أجنبية)
    const translate = async (text) => {
      const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return res.data[0].map(item => item[0]).join("");
    };

    // تعريب المحتوى إذا لم يكن عربياً
    let finalTitle = title;
    let finalDescription = extract;

    // فحص إذا كان النص يحتوي على حروف عربية، إذا لا -> ترجمه
    if (!/[\u0600-\u06FF]/.test(finalDescription)) {
      api.sendMessage("⏳ جاري تعريب المعلومات...", threadID, messageID);
      finalTitle = await translate(title);
      finalDescription = await translate(extract);
    }

    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ الـمـوسـوعـة الـذكـيـة ⌋\n` +
                 `╰── • 📚 • ──╯\n\n` +
                 `📌 الـمـوضـوع: ${finalTitle}\n\n` +
                 `📝 الـمـلـخص الـعـربـي:\n${finalDescription}\n\n` +
                 `🔗 الـرابط الأصـلي:\n${content_urls.desktop.page}\n\n` +
                 `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    // 4. معالجة الصورة وإرسالها
    if (thumbnail && thumbnail.source) {
      const imgPath = path.join(__dirname, "cache", `wiki_${Date.now()}.png`);
      const imgRes = await axios.get(thumbnail.source, { responseType: "arraybuffer" });
      await fs.outputFile(imgPath, Buffer.from(imgRes.data, "binary"));

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);
    } else {
      return api.sendMessage(msg, threadID, messageID);
    }

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠️ لم يتم العثور على معلومات كافية حول هذا الموضوع باللغة العربية.", threadID, messageID);
  }
};
