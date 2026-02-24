const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اخبار",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "عرض تفاصيل ومعلومات شاملة عن أي انمي",
  commandCategory: "الخدمات",
  usages: "[اسم الانمي بالإنجليزية]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const animeName = args.join(" ");

  if (!animeName) {
    return api.sendMessage("╭── • 📥 • ──╮\n يرجى كتابة اسم الانمي\n╰── • 📥 • ──╯\nمثال: اخبار Naruto", threadID, messageID);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    // جلب البيانات من Jikan API (قاعدة بيانات MyAnimeList)
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`);
    
    if (!res.data.data || res.data.data.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠️ لم يتم العثور على انمي بهذا الاسم. تأكد من كتابته بشكل صحيح بالإنجليزية.", threadID, messageID);
    }

    const anime = res.data.data[0];
    const title = anime.title;
    const title_jp = anime.title_japanese || "غير متوفر";
    const score = anime.score || "غير مقيم";
    const status = anime.status === "Finished Airing" ? "منتهي" : "مستمر";
    const episodes = anime.episodes || "غير محدد";
    const year = anime.year || "غير معروف";
    const rating = anime.rating || "غير محدد";
    const type = anime.type || "TV";
    const synopsis = anime.synopsis ? anime.synopsis : "لا يوجد وصف متوفر.";
    const imageUrl = anime.images.jpg.large_image_url;

    // تنسيق الرسالة بستايل "ڪايࢪوس"
    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ تـفـاصـيـل الإنـمـي ⌋\n` +
                 `╰── • ⛩️ • ──╯\n\n` +
                 `🇯🇵 الاسـم: ${title}\n` +
                 `🎌 باليابانية: ${title_jp}\n` +
                 `⭐ الـتـقـيـيـم: ${score}\n` +
                 `🎞️ الـنـوع: ${type}\n` +
                 `📅 سـنـة الإنـتـاج: ${year}\n` +
                 `🔢 الـحـلـقـات: ${episodes}\n` +
                 `💠 الـحـالـة: ${status}\n` +
                 `🔞 الـفـئـة: ${rating}\n\n` +
                 `📖 الـقـصـة:\n${synopsis.substring(0, 400)}...\n\n` +
                 `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    const cachePath = path.join(__dirname, "cache", `anime_${Date.now()}.jpg`);
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(imageRes.data, "binary"));

    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ حدث خطأ أثناء جلب التفاصيل من السيرفر.", threadID, messageID);
  }
};
