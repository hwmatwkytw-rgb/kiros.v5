const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "اقتراح",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "اقتراح عشوائي (انمي، مانجا، أفلام، انيمشن) مع تصنيفات دقيقة",
  commandCategory: "الخدمات",
  cooldowns: 8
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  api.setMessageReaction("🎲", messageID, () => {}, true);

  try {
    // مصفوفة الأنواع: انمي، مانجا، فيلم انمي، انيمشن عالمي
    const types = ["anime", "manga", "movie", "animation"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    let data, categoryName, imgUrl;

    // دالة الترجمة التلقائية
    const translate = async (text) => {
        if (!text) return "غير متوفر";
        try {
            const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
            return tRes.data[0].map(item => item[0]).join("");
        } catch { return text; }
    };

    const waitMsg = await api.sendMessage("🔍 جاري اختيار عمل مميز ذو تقييم عالٍ...", threadID);

    if (randomType === "animation") {
        // جلب انيمشن عالمي عبر API خارجي للأفلام (TMDB كمثال أو بحث مخصص)
        const movieRes = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=303901fd582d96695279b900ec6456f4&with_genres=16&page=${Math.floor(Math.random() * 50) + 1}`);
        const movie = movieRes.data.results[Math.floor(Math.random() * movieRes.data.results.length)];
        categoryName = "إنـيـمـشـن عـالـمـي (Disney/Pixar)";
        data = {
            title: movie.title,
            score: movie.vote_average,
            synopsis: movie.overview,
            genres: "عائلي، مغامرة، خيال" // تصنيف افتراضي للانيمشن
        };
        imgUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    } else {
        // جلب انمي أو مانجا عشوائي من Jikan
        const endpoint = `https://api.jikan.moe/v4/random/${randomType === "movie" ? "anime" : randomType}`;
        const res = await axios.get(endpoint);
        const item = res.data.data;
        
        categoryName = randomType === "anime" ? "إنـمـي تـلـفـزيـونـي" : (randomType === "manga" ? "مـانـجـا يـابـانـيـة" : "فـيـلـم إنـمـي");
        data = {
            title: item.title,
            score: item.score || "غير مقيم",
            synopsis: item.synopsis,
            genres: item.genres.map(g => g.name).join(", ")
        };
        imgUrl = item.images.jpg.large_image_url;
    }

    const genresAr = await translate(data.genres);
    const synopsisAr = await translate(data.synopsis);

    const msg = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ اقـتـراح الـيـوم ⌋\n` +
                 `╰── • 🎭 • ──╯\n\n` +
                 `🎬 الـفـئة: ${categoryName}\n` +
                 `🔹 الاسـم: ${data.title}\n` +
                 `⭐ الـتـقـيـيـم: ${data.score}\n` +
                 `🏷️ الـتـصـنيـف: ${genresAr}\n\n` +
                 `📖 الـقـصـة (بالعربية):\n${synopsisAr.substring(0, 500)}...\n\n` +
                 `«— اطلب [اقتراح] لـعمل آخـر —»\n` +
                 `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    const cachePath = path.join(__dirname, "cache", `suggest_${Date.now()}.jpg`);
    const imageRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(cachePath, Buffer.from(imageRes.data, "binary"));

    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("✨", messageID, () => {}, true);

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ تعذر جلب اقتراح حالياً، جرب مرة أخرى.", threadID, messageID);
  }
};
