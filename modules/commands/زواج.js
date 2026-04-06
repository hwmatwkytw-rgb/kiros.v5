const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
    name: "زواج",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "إصدار عقد زواج عبر الرد أو المنشن (KAIRUS STYLE)",
    commandCategory: "ترفيه",
    usages: "[رد على رسالة أو منشن شخص]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply, type, mentions } = event;

    let id1 = senderID; // الطرف الأول هو أنت دائماً
    let id2;

    // 1. تحديد الطرف الثاني (إما عبر الرد أو عبر المنشن)
    if (type === "message_reply") {
        id2 = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        id2 = Object.keys(mentions)[0];
    } else {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى الرد على رسالة الشخص\n┃ ⚬ أو منشن شخص لإتمام الزواج\n╰───────────────────╯", threadID, messageID);
    }

    // منع الزواج من النفس (اختياري)
    if (id1 == id2) return api.sendMessage("┃ ⚬ لا يمكنك عقد قرانك على نفسك!", threadID, messageID);

    api.setMessageReaction("💍", messageID, () => {}, true);

    try {
        // جلب الأسماء
        const info1 = await api.getUserInfo(id1);
        const info2 = await api.getUserInfo(id2);
        const name1 = info1[id1].name;
        const name2 = info2[id2].name;

        // الروابط
        const avatarUrl1 = `https://graph.facebook.com/${id1}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatarUrl2 = `https://graph.facebook.com/${id2}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const templateUrl = "https://i.postimg.cc/pTfXz5Z9/marriage-card.png";

        // التحميل (بنية سينما)
        const [res1, res2, resTemp] = await Promise.all([
            axios.get(avatarUrl1, { responseType: 'arraybuffer' }),
            axios.get(avatarUrl2, { responseType: 'arraybuffer' }),
            axios.get(templateUrl, { responseType: 'arraybuffer' })
        ]);

        const avatar1 = await Canvas.loadImage(Buffer.from(res1.data));
        const avatar2 = await Canvas.loadImage(Buffer.from(res2.data));
        const template = await Canvas.loadImage(Buffer.from(resTemp.data));

        const canvas = Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

        const drawAvatar = (image, x, y, size) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(image, x, y, size, size);
            ctx.restore();
            ctx.strokeStyle = '#ff66b2';
            ctx.lineWidth = 10;
            ctx.stroke();
        };

        drawAvatar(avatar1, 150, 140, 290); 
        drawAvatar(avatar2, 770, 140, 290); 

        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 15;
        
        ctx.fillText(name1, 295, 520);
        ctx.fillText(name2, 915, 520);

        const cachePath = path.join(__dirname, 'cache', `marry_${Date.now()}.png`);
        fs.writeFileSync(cachePath, canvas.toBuffer());

        const msg = 
            `╭─── 𖦆 𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄 𖦆 ───╮\n` +
            `┃ ⚬ تـم عـقـد الـقـران بـنـجـاح ✅\n` +
            `┃ ⚬ الـزوج ➔ ${name1}\n` +
            `┃ ⚬ الـزوجة ➔ ${name2}\n` +
            `┝───────────────┤\n` +
            `┃ ﴿ وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ﴾\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
            `╰───────────────────╯`;

        api.setMessageReaction("💖", messageID, () => {}, true);

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ فشل نظام الزواج حالياً\n╰───────────────────╯", threadID, messageID);
    }
};
