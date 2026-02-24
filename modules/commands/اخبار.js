const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اخبار",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تفاصيل الانمي مع منصات العرض باللغة العربية",
  commandCategory: "الخدمات",
  usages: "[اسم الانمي بالإنجليزية]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");

  if (!animeName) {
    return api.sendMessage("╭── • 📥 • ──╮\n يرجى كتابة اسم الانمي\n╰── • 📥 • ──╯", threadID, messageID);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    // جلب البيانات الأساسية ومنصات العرض
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠️ لم يتم العثور على انمي بهذا الاسم.", threadID, messageID);
    }

    const anime = res.data.data[0];
    const animeID = anime.mal_id;

    // جلب منصات العرض (Streaming)
    let streamingRes;
    try {
        streamingRes = await axios.get(`https://api.jikan.moe/v4/anime/${animeID}/streaming`);
    } catch (e) { streamingRes = { data: { data: [] } }; }

    // دالة الترجمة
    const translate = async (text) => {
        try {
            const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
            return tRes.data[0].map(item => item[0]).join("");
        } catch { return text; }
    };

    const waitMsg = await api.sendMessage("⏳ جاري سحب البيانات والتعريب...", threadID);

    // معالجة البيانات
    const title = anime.title;
    const score = anime.score || "غير مقيم";
    const status = anime.status === "Finished Airing" ? "منتهي" : "مستمر";
    const episodes = anime.episodes || "غير محدد";
    const genresEn = anime.genres.map(g => g.name).join(", ");
    const platformsEn = streamingRes.data.data.map(s => s.name).join(", ") || "غير متوفرة حالياً";

    const genresAr = await translate(genresEn);
    const platformsAr = await translate(platformsEn);
    const synopsisAr = await translate(anime.synopsis || "لا يوجد وصف.");
    const ratingAr = await translate(anime.rating || "غير محدد");

    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ مـعـلـومـات الإنـمـي ⌋\n` +
                 `╰── • ⛩️ • ──╯\n\n` +
                 `🔹 الاسـم: ${title}\n` +
                 `🔹 الـتـقـيـيـم: ⭐ ${score}\n` +
                 `🔹 الـنـوع: ${anime.type || "TV"}\n` +
                 `🔹 الـحـالـة: ${status}\n` +
                 `🔹 الـحـلـقـات: ${episodes}\n` +
                 `🔹 الـتـصـنيـف: ${genresAr}\n` +
                 `🔹 الـفـئـة: ${ratingAr}\n\n` +
                 `📺 مـنـصـات الـعـرض:\n╰── • ${platformsAr}\n\n` +
                 `📖 الـقـصـة:\n${synopsisAr.substring(0, 500)}...\n\n` +
                 `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    const cachePath = path.join(__dirname, "cache", `anime_${Date.now()}.jpg`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });

    const imageUrl = anime.images.jpg.large_image_url;
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(imageRes.data, "binary"));

    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("✨", messageID, () => {}, true);

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ فشل جلب المعلومات.", threadID, messageID);
  }
};
