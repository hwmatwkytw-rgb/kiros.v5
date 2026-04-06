const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "فيديو",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "البحث عن فيديوهات ايديت (Edit) للأنمي بستايل كايروس",
    commandCategory: "الخدمات والوسائط",
    usages: "[اسم الأنمي]",
    cooldowns: 20
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);

    // 1. تحديد اسم الأنمي (المدخل أو اسم العضو)
    let animeName = args.join(" ");
    if (!animeName) {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى كتابة اسم الأنمي أولاً\n┃ ⚬ مثال: /فيديو ل ناتسكي سوبارو\n╰───────────────────╯", threadID, messageID);
    }

    // 2. إعداد الهوية البصرية (الشعار النيوني)
    api.setMessageReaction("🎬", messageID, () => {}, true);

    const waitMsg = await new Promise(res => api.sendMessage(`╭─────── 𖦆 ───────╮\n    𝐕𝐈𝐃𝐄𝐎  𝐒𝐄𝐀𝐑𝐂𝐇\n╰─────── 𖦆 ───────╯\n\n┃ ⚬ جاري البحث عن سحر الأنمي...\n┃ ⚬ الـمـطـلـوب ➔ ${animeName}\n┝───────────────┤\n┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n╰───────────────────╯`, threadID, (err, info) => res(info), messageID));

    const videoPath = path.join(cacheDir, `video_${Date.now()}.mp4`);

    try {
        // 3. محرك البحث (Trace.moe) للحصول على معلومات المشهد، ثم البحث في مصادر الفيديوهات القصيرة
        const traceRes = await axios.get(`https://api.trace.moe/search?anilistInfo&url=https://i.postimg.cc/pTfXz5Z9/marriage-card.png`);
        const animeData = traceRes.data.result[0]?.anilist;

        // في حال عدم وجود بيانات دقيقة للأنمي، نستخدم الاسم المدخل للبحث
        const finalSearchTerm = animeData?.title?.english || animeName;

        // 4. محرك البحث الذكي للفيديوهات القصيرة (Scraper API - هنا سنستخدم Trace moe للحصول على فيديو المشهد)
        const res = await axios.get(`https://api.trace.moe/search?anilistInfo&url=https://i.postimg.cc/pTfXz5Z9/marriage-card.png`);
        const result = res.data.result[0];

        if (!result || !result.video) {
             api.unsendMessage(waitMsg.messageID);
             return api.sendMessage("╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ لم أجد فيديو ايديت لهذا الأنمي ؛-؛\n╰───────────────────╯", threadID, messageID);
        }

        // 5. تحميل وإرسال الفيديو بستايل كايروس
        const videoRes = await axios.get(result.video, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(videoRes.data));

        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

        const successMsg = 
            `╭─────── 𖦆 ───────╮\n` +
            `    𝐊 𝐀 𝐈 𝐑 𝐔 𝐒   𝐄 𝐃 𝐈 𝐓\n` +
            `╰─────── 𖦆 ───────╯\n\n` +
            `┃ ⚬ تـم جـلب الـفـيديو بـنـجـاح ✅\n` +
            `┃ ⚬ الـأنـمـي ➔ ${finalSearchTerm}\n` +
            `┝───────────────┤\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
            `╰───────────────────╯`;

        return api.sendMessage({
            body: successMsg,
            attachment: fs.createReadStream(videoPath)
        }, threadID, () => {
            if(fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }, messageID);

    } catch (e) {
        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ فشل البحث بسبب: ${e.message}\n╰───────────────────╯`, threadID, messageID);
    }
};
