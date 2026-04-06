const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "زواج",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "إصدار عقد زواج فخم مع دمج الصور في الكاش",
    commandCategory: "ترفيه",
    usages: "[@منشن1 @منشن2]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, mentions } = event;
    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length < 2) {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى منشن شخصين لإتمام الزواج\n┃ ⚬ مثال: /زواج @فلان @فلانة\n╰───────────────────╯", threadID, messageID);
    }

    const id1 = mentionIDs[0];
    const id2 = mentionIDs[1];

    api.setMessageReaction("⌛", messageID, () => {}, true);

    // استخدام مجلد الكاش الموجود عندك
    const cachePath = path.join(__dirname, 'cache', `marriage_${id1}_${id2}.png`);
    const templatePath = path.join(__dirname, 'cache', 'marriage_template.png');

    try {
        const name1 = await Users.getNameUser(id1);
        const name2 = await Users.getNameUser(id2);
        
        const avatarUrl1 = `https://graph.facebook.com/${id1}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarUrl2 = `https://graph.facebook.com/${id2}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        // إذا القالب مش موجود في الكاش، نحمله من رابط خارجي لضمان التشغيل
        if (!fs.existsSync(templatePath)) {
            const res = await axios.get("https://i.postimg.cc/pTfXz5Z9/marriage-card.png", { responseType: 'arraybuffer' });
            fs.writeFileSync(templatePath, Buffer.from(res.data));
        }

        const [avatar1, avatar2, template] = await Promise.all([
            Canvas.loadImage(avatarUrl1),
            Canvas.loadImage(avatarUrl2),
            Canvas.loadImage(templatePath)
        ]);

        const canvas = Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

        // رسم الصور الشخصية دائرية
        const drawAvatar = (image, x, y, size) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(image, x, y, size, size);
            ctx.restore();
            
            // إطار نيون منحني
            ctx.strokeStyle = '#ffb3ba';
            ctx.lineWidth = 8;
            ctx.stroke();
        };

        drawAvatar(avatar1, 160, 150, 280); // موقع الزوج الأول
        drawAvatar(avatar2, 760, 150, 280); // موقع الزوج الثاني

        // كتابة الأسماء بستايل كايروس
        ctx.font = 'bold 45px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff66b2';
        ctx.shadowBlur = 10;
        
        ctx.fillText(name1, 300, 500);
        ctx.fillText(name2, 900, 500);
        
        ctx.shadowBlur = 0;

        const buffer = canvas.toBuffer();
        fs.writeFileSync(cachePath, buffer);

        api.setMessageReaction("💖", messageID, () => {}, true);
        
        const loveMsg = 
            `╭─── 𖦆 𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄 𖦆 ───╮\n` +
            `┃ ⚬ تـم عـقـد الـقـران بـنـجـاح ✅\n` +
            `┃ ⚬ الـزوج ➔ ${name1}\n` +
            `┃ ⚬ الـزوجة ➔ ${name2}\n` +
            `┝───────────────┤\n` +
            `┃ ﴿ وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ﴾\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
            `╰───────────────────╯`;

        return api.sendMessage({
            body: loveMsg,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
            if(fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);

    } catch (e) {
        console.error(e);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ فشل بسبب: ${e.message}\n╰───────────────────╯`, threadID, messageID);
    }
};
