const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "مانجا",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "البحث عن المانجا مع ترجمة القصة للعربية",
  commandCategory: "الخدمات",
  usages: "[اسم المانجا بالانجليزي]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("╭── • 📥 • ──╮\n اكتب اسم المانجا بالإنجليزية\n╰── • 📥 • ──╯", threadID, messageID);

  api.setMessageReaction("📚", messageID, () => {}, true);

  try {
    const res = await axios.get(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=1`);
    if (!res.data.data[0]) return api.sendMessage("⚠️ لم يتم العثور على نتائج.", threadID, messageID);

    const manga = res.data.data[0];
    const synopsisEn = manga.synopsis || "No description available.";
    
    // ترجمة القصة للعربية
    const translateRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(synopsisEn)}`);
    const synopsisAr = translateRes.data[0].map(item => item[0]).join("");

    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ تـفـاصـيـل الـمـانـجـا ⌋\n` +
                 `╰── • 📖 • ──╯\n\n` +
                 `📑 الاسـم: ${manga.title}\n` +
                 `⭐ الـتـقـيـيـم: ${manga.score || "غير مقيم"}\n` +
                 `💠 الـحـالـة: ${manga.status}\n` +
                 `📚 الـفـصـول: ${manga.chapters || "مستمرة"}\n` +
                 `🎨 الـمؤلف: ${manga.authors[0]?.name || "غير معروف"}\n\n` +
                 `📖 الـقـصة (بالعربية):\n${synopsisAr.substring(0, 500)}...\n\n` +
                 `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    const imgPath = path.join(__dirname, "cache", `manga_${Date.now()}.jpg`);
    const imgRes = await axios.get(manga.images.jpg.large_image_url, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => fs.unlinkSync(imgPath), messageID);

  } catch (err) {
    return api.sendMessage("❌ حدث خطأ أثناء جلب وترجمة البيانات.", threadID, messageID);
  }
};
