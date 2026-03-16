module.exports.config = {
  name: "فلم",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "معلومات الأفلام والأنمي مع تفاعلات ذكية",
  commandCategory: "افلام",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require("fs-extra");
  const request = require("request");
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("╮── ⎔\n│ اكتب اسم الفلم أو الأنمي للبحث عنه! 🎬\n╯────────────⊞", threadID, messageID);

  try {
    // 1. تفاعل البحث
    api.setMessageReaction("🔍", messageID, () => {}, true);

    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(query)}`);
    const data = res.data;

    if (data.error || !data.title) throw new Error("Not Found");

    // دالة ترجمة بسيطة ومباشرة
    const translate = async (text) => {
      try {
        const tr = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
        return tr.data[0][0][0];
      } catch { return text; }
    };

    const [arTitle, arPlot, arGenres] = await Promise.all([
      translate(data.title),
      translate(data.plot),
      translate(data.genres)
    ]);

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `         MOVIE INFO 🎬\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› الاسم: ${arTitle}\n` +
                `› السنة: ${data.year}\n` +
                `› المدة: ${data.runtime}\n` +
                `› التصنيف: ${arGenres}\n` +
                `› المخرج: ${data.director}\n` +
                `› التقييم: ⭐ ${data.rating}\n` +
                `› الأرباح: 💰 ${data.boxoffice}\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ القصة بالعربي:\n│ ${arPlot}\n` +
                `╯────────── ⊞ ──────────╰\n` +
                `│ بـواسطـة: ڪايࢪوس`;

    const path = __dirname + `/cache/poster_${Date.now()}.png`;
    
    const callback = () => {
      // 2. تفاعل النجاح عند الإرسال
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(path)).on("close", callback);

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ⎔\n│ لم يتم العثور على نتائج، تأكد من الاسم! ⚠️\n╯────────────⊞", threadID, messageID);
  }
}
