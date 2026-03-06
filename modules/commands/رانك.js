const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "رانك",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "توليد بطاقة مستوى احترافية صامتة عند الخطأ",
  commandCategory: "الألعاب",
  usages: "رانك",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const cachePath = path.join(__dirname, "cache", `rank_${senderID}.png`);

  try {
    const data = await Currencies.getData(senderID);
    const exp = data.exp || 0; 
    const level = Math.floor(exp / 50) + 1;
    const rank = data.rank || "N/A"; 
    const nextLevelExp = level * 150;
    const userName = await Users.getNameUser(senderID);

    const canvas = createCanvas(900, 250);
    const ctx = canvas.getContext("2d");

    // الخلفية الأساسية (رمادي داكن)
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // زاوية هندسية (رمادي فاتح)
    ctx.fillStyle = "#3d3d3d";
    ctx.beginPath();
    ctx.moveTo(450, 0);
    ctx.lineTo(900, 0);
    ctx.lineTo(900, 250);
    ctx.lineTo(650, 250);
    ctx.fill();

    // الصورة الشخصية دائرية
    const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;
    const avatarImg = await loadImage(avatarURL);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 125, 90, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, 40, 35, 180, 180);
    ctx.restore();

    // النصوص (أبيض)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText(userName, 260, 80);

    ctx.font = "30px sans-serif";
    ctx.fillText(`Rank ${rank}`, 260, 130);
    ctx.fillText(`Lv.${level}`, 260, 175);
    ctx.fillText(`${exp}/${nextLevelExp}`, 700, 175);

    // شريط التقدم
    const barX = 260;
    const barY = 195;
    const barW = 600;
    const barH = 30;
    const progress = Math.min(exp / nextLevelExp, 1);

    // خلفية الشريط
    ctx.fillStyle = "#555555";
    ctx.fillRect(barX, barY, barW, barH);

    // اللون الفعلي للتقدم (أبيض)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(barX, barY, barW * progress, barH);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(cachePath, buffer);

    return api.sendMessage({
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (e) {
    // التفاعل بـ ❌ فقط عند حدوث أي خطأ دون إرسال رسائل
    return api.setMessageReaction("❌", messageID, () => {}, true);
  }
};
