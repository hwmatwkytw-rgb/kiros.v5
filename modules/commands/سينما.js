const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "سينما",
    version: "2.7.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "كشف تفاصيل الأنمي بدقة عالية (KAIRUS ZEN STYLE)",
    commandCategory: "الخدمات والوسائط",
    usages: "[رد على صورة]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, senderID }) {
    const { threadID, messageID, messageReply, type } = event;

    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("╭── • ⚠️ • ──╮\n  يرجى الرد على صورة \n╰───────────╯", threadID, messageID);
    }

    const imageUrl = encodeURIComponent(messageReply.attachments[0].url);
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
        const res = await axios.get(`https://api.trace.moe/search?anilistInfo&url=${imageUrl}`);
        const results = res.data.result;
        const result = results.find(r => r.similarity > 0.85) || results[0];

        if (!result || result.similarity < 0.80) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("╭── • ❌ • ──╮\n تعذر التعرف بدقة \n╰───────────╯", threadID, messageID);
        }

        const anime = result.anilist;
        const similarity = (result.similarity * 100).toFixed(1);
        const timeAt = new Date(result.from * 1000).toISOString().substr(11, 8);

        // الاستايل المنحني مع الرموز الهندسية الرقيقة
        const msg = 
            `╭──── ⚡︎ 𝐊𝐀𝐈𝐑𝐔𝐒 𝐂𝐈𝐍𝐄𝐌𝐀 ────╮\n` +
            `  ◿  ${anime.title.english || anime.title.romaji}\n` +
            `  ◹  ${anime.title.native}\n` +
            `┝───────────────┥\n` +
            `  ⌬ الحلقة ⬘ ${result.episode || "1"}\n` +
            `  ⌬ الوقت ⬘ ${timeAt}\n` +
            `  ⌬ الدقة ⬘ ${similarity}%\n` +
            `┝───────────────┥\n` +
            `  ✧ النوع ⬙ ${anime.genres.slice(0, 2).join(" • ")}\n` +
            `  ✧ التصنيف ⬙ ${anime.isAdult ? "18+ 🔞" : "Public ✅"}\n` +
            `┝───────────────┥\n` +
            `  🪄 رد بـ [ سحر ] لجلب اللقطة\n` +
            `╰────────────────╯`;

        api.setMessageReaction("✅", messageID, () => {}, true);

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                videoUrl: result.video
            });
        }, messageID);

    } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭── • ⚠️ • ──╮\n   خطأ في الاتصال   \n╰───────────╯`, threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { body, threadID, messageID, senderID } = event;

    if (body.toLowerCase() !== "سحر") return;
    if (senderID !== handleReply.author) return;

    api.setMessageReaction("🪄", messageID, () => {}, true);
    const videoPath = path.join(__dirname, 'cache', `${Date.now()}_kairus.mp4`);

    try {
        const response = await axios.get(handleReply.videoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(response.data));

        return api.sendMessage({
            body: `╭── • ✨ 𝐌𝐀𝐆𝐈𝐂 ✨ • ──╮\n    تم استدعاء المشهد\n╰────────────────╯`,
            attachment: fs.createReadStream(videoPath)
        }, threadID, () => {
            if(fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }, messageID);
        
    } catch (e) {
        return api.sendMessage("⚠️ الميزة غير متوفرة حالياً.", threadID, messageID);
    }
};
