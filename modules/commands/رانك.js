const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "رانك",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "عرض بطاقة الرانك الخاصة بك",
    commandCategory: "نظام",
    usages: "[رد أو منشن]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    
    let targetID = type == "message_reply" ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const userData = await Users.getData(targetID);
        const name = userData.name || "مستخدم";
        const exp = userData.exp || 1;
        const level = Math.floor(Math.sqrt(1 + (8 * exp) / 125) / 2 - 0.5); // معادلة افتراضية للفل
        
        // مسارات الصور
        const cachePath = path.join(__dirname, 'cache', `rank_${targetID}.png`);
        
        // إنشاء الكانفاس
        const canvas = Canvas.createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // رسم خلفية بسيطة (تقدر تبدلها بصورة)
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // رسم الاسم والفل
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, 250, 100);
        
        ctx.font = '30px Arial';
        ctx.fillText(`Level: ${level}`, 250, 150);

        // شريط الخبرة
        ctx.fillStyle = "#333";
        ctx.fillRect(250, 180, 400, 20);
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(250, 180, 200, 20); // مثال للتقدم

        const buffer = canvas.toBuffer();
        fs.writeFileSync(cachePath, buffer);

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage({
            body: `╭─── 𖦆 𝐑𝐀𝐍𝐊 𝐂𝐀𝐑𝐃 𖦆 ───╮\n┃ ⚬ الـاسـم ➔ ${name}\n┃ ⚬ الـلـفـل ➔ ${level}\n╰───────────────────╯`,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        return api.sendMessage(`⚠️ فشل إنشاء الرانك: ${e.message}`, threadID, messageID);
    }
};
