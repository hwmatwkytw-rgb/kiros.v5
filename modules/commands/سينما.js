const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "سينما",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "كشف تفاصيل الأنمي من الصورة + سحر الفيديو (KAIRUS STYLE)",
    commandCategory: "الخدمات والوسائط",
    usages: "[رد على صورة]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, type, senderID } = event;

    // 1. التحقق من الرد على صورة
    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى الرد على صورة أنمي أولاً\n╰───────────────────╯", threadID, messageID);
    }

    const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
    api.setMessageReaction("🎬", messageID, () => {}, true);

    try {
        // البحث عبر محرك trace.moe مع جلب بيانات Anilist
        const res = await axios.get(`https://api.trace.moe/search?anilistInfo&url=${imageUrl}`);
        const result = res.data.result[0];

        if (!result) return api.sendMessage("╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ لم أجد هذا المشهد في أرشيفي\n╰───────────────────╯", threadID, messageID);

        const anime = result.anilist;
        const similarity = (result.similarity * 100).toFixed(1);
        const timeAt = new Date(result.from * 1000).toISOString().substr(11, 8);

        // تنسيق كايروس المنحني (KAIRUS ZEN STYLE)
        const msg = 
            `╭─────── 𖦆 ───────╮\n` +
            `    𝐊 𝐀 𝐈 𝐑 𝐔 𝐒   𝐂 𝐈 𝐍 𝐄 𝐌 𝐀\n` +
            `╰─────── 𖦆 ───────╯\n\n` +
            `╭── ▽ 「 مـعـلـومـات الـمـشـهـد 」\n` +
            `┃ ⚬ الـاسـم ➔ ${anime.title.english || anime.title.romaji}\n` +
            `┃ ⚬ الأصـل ➔ ${anime.title.native}\n` +
            `┃ ⚬ الـحـالـة ➔ ${anime.status}\n` +
            `┃ ⚬ الـحـلـقات ➔ ${anime.episodes || "؟"}\n` +
            `┃ ⚬ الـتـوقـيـت ➔ ${timeAt}\n` +
            `┃ ⚬ الـدقـة ➔ ${similarity}%\n` +
            `╰────────────── 🝓\n\n` +
            `╭── ▽ 「 الـتـصـنـيـف والـنـوع 」\n` +
            `┃ ⚬ الـنـوع ➔ 📺 مسلسل أنمي\n` +
            `┃ ⚬ الـفـئة ➔ ${anime.isAdult ? "18+ 🔞" : "لـلـكـل ✅"}\n` +
            `┃ ⚬ الـجـانرا ➔ ${anime.genres.slice(0, 3).join(" • ")}\n` +
            `╰────────────── 🝓\n\n` +
            `🪄 | رد بـ "سحر" لـاستـخـراج الـلـقـطة\n` +
            `┝───────────────┤\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
            `╰───────────────────╯`;

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                videoUrl: result.video // رابط الفيديو الخام من API
            });
        }, messageID);

    } catch (e) {
        return api.sendMessage(`╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ فشل الاتصال بالمحرك الرئيسي\n╰───────────────────╯`, threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { body, threadID, messageID, senderID } = event;

    if (body.toLowerCase() !== "سحر") return;
    if (senderID !== handleReply.author) return; // لضمان الخصوصية

    api.setMessageReaction("🪄", messageID, () => {}, true);
    
    // استخدام مجلد الكاش الخاص بك
    const videoPath = path.join(__dirname, 'cache', `magic_${Date.now()}.mp4`);

    try {
        const response = await axios.get(handleReply.videoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(response.data));

        return api.sendMessage({
            body: `╭─── 𖦆 𝐌𝐀𝐆𝐈𝐂 𝐕𝐈𝐃𝐄𝐎 𖦆 ───╮\n┃ ⚬ تـم اسـتـدعـاء الـلـقـطة بـنـجاح ✨\n╰───────────────────╯`,
            attachment: fs.createReadStream(videoPath)
        }, threadID, () => {
            if(fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }, messageID);
        
    } catch (e) {
        return api.sendMessage("⚠️ عذراً، سحر الفيديو غير متاح لهذا المشهد حالياً.", threadID, messageID);
    }
};
