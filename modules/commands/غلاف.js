const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "غلاف",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "صنع غلاف شخصي بشعار كـايروس ودانتي",
    commandCategory: "تخصيص",
    usages: "[الاسم الذي تريده]",
    cooldowns: 30
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    
    // 1. تحديد الاسم (إما المدخل أو اسم المستخدم)
    let name = args.join(" ");
    if (!name) {
        name = await Users.getNameUser(senderID);
    }

    api.setMessageReaction("🎨", messageID, () => {}, true);

    const cachePath = path.join(__dirname, 'cache', `cover_${senderID}.png`);
    const templatePath = path.join(__dirname, 'cache', 'cover_template.png');

    try {
        // 2. تحميل قالب الغلاف الفخم (KAIRUS BRANDING)
        if (!fs.existsSync(templatePath)) {
            const res = await axios.get("https://i.postimg.cc/pTfXz5Z9/marriage-card.png", { responseType: 'arraybuffer' });
            fs.writeFileSync(templatePath, Buffer.from(res.data));
        }

        const template = await Canvas.loadImage(templatePath);
        const canvas = Canvas.createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        // رسم الخلفية السيبرانية
        ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

        // إضافة طبقة مظلمة خفيفة للتركيز على الاسم
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. كتابة الاسم بستايل النيون الفاخر
        ctx.textAlign = 'center';
        
        // تأثير الظل (Glow)
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 90px Arial'; // يفضل استخدام خطوط Custom إذا كان السيرفر يدعمها
        ctx.fillText(name.toUpperCase(), canvas.width / 2, (canvas.height / 2) + 20);

        // 4. إضافة شعارات الهوية البصرية
        ctx.shadowBlur = 10;
        ctx.font = '35px Arial';
        ctx.fillStyle = '#ff00ff'; // أرجواني نيون
        ctx.fillText("𖦆 𝐊 𝐀 𝐈 𝐑 𝐔 𝐒   𝐎 𝐒 𖦹", canvas.width / 2, (canvas.height / 2) + 90);

        // توقيع المطور (Brand Signature)
        ctx.font = '25px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText("𝐃𝐄𝐒𝐈𝐆𝐍𝐄𝐃 𝐁𝐘 𝐃𝐀𝐍𝐓𝐄 𝐒𝐏𝐀𝐑𝐃𝐀", canvas.width / 2, canvas.height - 50);

        // إضافة خطوط Zen Curves إضافية بالرسم
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, canvas.height / 2);
        ctx.lineTo(300, canvas.height / 2);
        ctx.moveTo(canvas.width - 100, canvas.height / 2);
        ctx.lineTo(canvas.width - 300, canvas.height / 2);
        ctx.stroke();

        const buffer = canvas.toBuffer();
        fs.writeFileSync(cachePath, buffer);

        const msg = `╭─────── 𖦆 ───────╮\n    𝐂𝐔𝐒𝐓𝐎𝐌  𝐂𝐎𝐕𝐄𝐑  𝐀𝐑𝐓\n╰─────── 𖦆 ───────╯\n\n┃ ⚬ تـم تـصـمـيم غـلافـك الـخـاص ✅\n┃ ⚬ الـاسـم ➔ ${name}\n┝───────────────┤\n┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n╰───────────────────╯`;

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage(`⚠️ فشل التصميم: ${e.message}`, threadID, messageID);
    }
};
