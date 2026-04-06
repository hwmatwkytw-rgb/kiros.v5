const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
    name: "رانك",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "عرض بطاقة الرانك الفخمة (KAIRUS ID STYLE)",
    commandCategory: "نظام",
    usages: "[رد أو منشن]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    
    // تحديد الشخص المستهدف (رد، منشن، أو أنت)
    let targetID = type == "message_reply" ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        // 1. جلب معلومات المستخدم وصورته (بنية سينما)
        const userInfo = await api.getUserInfo(targetID);
        const name = userInfo[targetID].name;
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        
        // جلب الصورة كـ Buffer
        const avatarRes = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
        const avatarImg = await Canvas.loadImage(Buffer.from(avatarRes.data));

        // 2. إعداد الكانفاس (تصميم Zen Dark)
        const canvas = Canvas.createCanvas(800, 250);
        const ctx = canvas.getContext('2d');

        // خلفية داكنة متدرجة
        const grad = ctx.createLinearGradient(0, 0, 800, 250);
        grad.addColorStop(0, '#0f0f0f');
        grad.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // زخرفة جانبية بسيطة
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        for(let i=0; i<800; i+=40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i-100, 250); ctx.stroke();
        }

        // 3. رسم الصورة الشخصية دائرية
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, 35, 35, 180, 180);
        ctx.restore();

        // إطار نيون حول الصورة
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(125, 125, 95, 0, Math.PI * 2, true);
        ctx.stroke();

        // 4. كتابة النصوص
        ctx.font = 'bold 45px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillText(name, 250, 90);

        // حساب المستوى (معادلة افتراضية - يمكنك ربطها بـ Database لاحقاً)
        const level = "Level 15"; // مثال
        ctx.font = '25px Arial';
        ctx.fillStyle = '#b0b0b0';
        ctx.fillText(level, 250, 135);

        // 5. شريط الخبرة (Kairus Progress Bar)
        ctx.fillStyle = "#333";
        ctx.roundRect(250, 160, 500, 20, 10);
        ctx.fill();

        ctx.fillStyle = "#00ffcc";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffcc";
        ctx.roundRect(250, 160, 350, 20, 10); // 350 هو نسبة التقدم مثالاً
        ctx.fill();

        // تحويل للـ Cache
        const cachePath = path.join(__dirname, 'cache', `rank_${Date.now()}.png`);
        fs.writeFileSync(cachePath, canvas.toBuffer());

        const msg = 
            `╭─── 𖦆 𝐑𝐀𝐍𝐊 𝐂𝐀𝐑𝐃 𖦆 ───╮\n` +
            `┃ ⚬ تـم اسـتـدعـاء مـلـفـك الـشـخـصـي ✨\n` +
            `┃ ⚬ الـاسـم ➔ ${name}\n` +
            `┃ ⚬ الـحـالـة ➔ نـاشـط\n` +
            `┝───────────────┤\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
            `╰───────────────────╯`;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage(`⚠️ فشل نظام الرانك في استدعاء البيانات.`, threadID, messageID);
    }
};

// وظيفة رسم المستطيلات المنحنية (لدعم الإصدارات القديمة من Canvas)
Canvas.CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
