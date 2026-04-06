const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "نسبة_الحب",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "KIRO + DANTE",
  description: "حساب نسبة الحب بأسلوب فاخر",
  commandCategory: "تفاعل",
  usages: "[@شخص] أو الرد على رسالة",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let id1 = senderID;
  let id2;

  const mentionIDs = Object.keys(mentions);

  if (mentionIDs.length >= 1) {
    id2 = mentionIDs[0];
  } else if (messageReply) {
    id2 = messageReply.senderID;
  } else {
    return api.sendMessage(
`╭─── 𖦆 𝐋𝐎𝐕𝐄 𖦆 ───╮
┃ ⚬ منشن شخص أو رد على رسالته
╰───────────────────╯`,
      threadID, messageID
    );
  }

  if (id1 === id2) {
    return api.sendMessage("لا يمكنك حساب الحب مع نفسك", threadID, messageID);
  }

  api.setMessageReaction("💞", messageID, () => {}, true);

  const cacheDir = path.join(__dirname, 'cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const imgPath = path.join(cacheDir, `love_${Date.now()}.png`);

  try {
    const name1 = await Users.getNameUser(id1);
    const name2 = await Users.getNameUser(id2);

    const av1 = `https://graph.facebook.com/${id1}/picture?type=large`;
    const av2 = `https://graph.facebook.com/${id2}/picture?type=large`;

    const love = Math.floor(Math.random() * 101);

    let status = "";
    if (love <= 20) status = "صداقة";
    else if (love <= 40) status = "إعجاب";
    else if (love <= 60) status = "بداية حب";
    else if (love <= 80) status = "حب قوي";
    else status = "ارتباط قريب";

    // إنشاء الكانفاس
    const canvas = Canvas.createCanvas(1000, 500);
    const ctx = canvas.getContext("2d");

    // خلفية ناعمة
    ctx.fillStyle = "#1e1e2f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الصور
    const [img1, img2] = await Promise.all([
      Canvas.loadImage(av1),
      Canvas.loadImage(av2)
    ]);

    const drawAvatar = (img, x) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, 250, 120, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x - 120, 130, 240, 240);
      ctx.restore();
    };

    drawAvatar(img1, 250);
    drawAvatar(img2, 750);

    // قلب في المنتصف
    ctx.font = "bold 80px sans-serif";
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.fillText("❤", 500, 270);

    // الأسماء
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name1, 250, 420);
    ctx.fillText(name2, 750, 420);

    // نسبة الحب
    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = "#ffccd5";
    ctx.fillText(`${love}%`, 500, 100);

    fs.writeFileSync(imgPath, canvas.toBuffer());

    const msg =
`╭─────── 𖦆 ───────╮
      𝐋𝐎𝐕𝐄 𝐌𝐄𝐓𝐄𝐑
╰─────── 𖦆 ───────╯

┃ ⚬ ${name1} ❤ ${name2}
┃ ⚬ النسبة ➔ ${love}%
┃ ⚬ الحالة ➔ ${status}

╰───────────────────╯`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(imgPath)
    }, threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, messageID);

  } catch (e) {
    return api.sendMessage("حدث خطأ أثناء حساب الحب", threadID, messageID);
  }
};
