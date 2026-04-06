const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "زواج",
    version: "3.3.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "إنشاء عقد زواج بصورة مدمجة",
    commandCategory: "ترفيه",
    usages: "[@شخص] أو الرد على شخص",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, mentions, messageReply, senderID } = event;

    let id1 = senderID; // صاحب الأمر
    let id2;

    const mentionIDs = Object.keys(mentions);

    if (mentionIDs.length >= 1) {
        id2 = mentionIDs[0];
    } else if (messageReply) {
        id2 = messageReply.senderID;
    } else {
        return api.sendMessage(
`╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮
┃ ⚬ منشن شخص أو رد على رسالته
╰───────────────────╯`,
        threadID, messageID);
    }

    // منع الزواج من نفسك 😂
    if (id1 === id2) {
        return api.sendMessage(
`╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮
┃ ⚬ لا يمكنك الزواج من نفسك
╰───────────────────╯`,
        threadID, messageID);
    }

    api.setMessageReaction("💍", messageID, () => {}, true);

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imgPath = path.join(cacheDir, `marriage_${Date.now()}.png`);

    try {
        const name1 = await Users.getNameUser(id1);
        const name2 = await Users.getNameUser(id2);

        const avatar1 = `https://graph.facebook.com/${id1}/picture?type=large`;
        const avatar2 = `https://graph.facebook.com/${id2}/picture?type=large`;

        const templateUrl = "https://i.postimg.cc/pTfXz5Z9/marriage-card.png";

        const [img1, img2, template] = await Promise.all([
            Canvas.loadImage(avatar1),
            Canvas.loadImage(avatar2),
            Canvas.loadImage(templateUrl)
        ]);

        const canvas = Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(template, 0, 0);

        const drawAvatar = (img, x) => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, 250, 140, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x - 140, 110, 280, 280);
            ctx.restore();
        };

        drawAvatar(img1, 300);
        drawAvatar(img2, 900);

        ctx.font = "bold 40px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";

        ctx.fillText(name1, 300, 520);
        ctx.fillText(name2, 900, 520);

        fs.writeFileSync(imgPath, canvas.toBuffer());

        api.setMessageReaction("💖", messageID, () => {}, true);

        const msg =
`╭─────── 𖦆 ───────╮
     𝐌𝐀𝐑𝐑𝐈𝐀𝐆𝐄
╰─────── 𖦆 ───────╯

┃ ⚬ تم عقد القران بنجاح
┃ ⚬ ${name1} ❤ ${name2}

╰───────────────────╯`;

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(imgPath)
        }, threadID, () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }, messageID);

    } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);

        return api.sendMessage(
`╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮
┃ ⚬ ${e.message}
╰───────────────────╯`,
        threadID, messageID);
    }
};
