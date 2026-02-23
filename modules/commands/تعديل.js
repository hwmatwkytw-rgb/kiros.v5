const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.config = {
    name: "تعديل",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "ڪايࢪوس",
    description: "محرر صور احترافي (رد على صورة)",
    commandCategory: "الصور",
    usages: "[رد على صورة]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, messageReply, senderID } = event;

    // التحقق من الرد على صورة
    if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("╭── • 📥 • ──╮\n  يرجى الرد على صورة\n╰── • 📥 • ──╯", threadID, messageID);
    }

    const imgURL = messageReply.attachments[0].url;
    
    const menu = `╭── • ڪايࢪوس • ──╮\n` +
                 `  ⌈ مُحرر الـصـور الـفـني ⌋\n` +
                 `╰── • 🎨 • ──╯\n\n` +
                 `1. [✨] تعلية الجودة (HD)\n` +
                 `2. [🎬] فلتر سينمائي\n` +
                 `3. [📜] فلتر عتيق (قديم)\n` +
                 `4. [🌗] أبيض وأسود\n` +
                 `5. [🌀] تشويش (Blur)\n` +
                 `6. [⭕] قص دائري\n` +
                 `7. [🎨] تحسين الألوان\n\n` +
                 `* رد على الرسالة برقم التعديل المطلوب`;

    return api.sendMessage(menu, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            imgURL: imgURL
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID != handleReply.author) return;

    const choice = body.trim();
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const filePath = path.join(cacheDir, `edit_${Date.now()}.png`);
    
    api.unsendMessage(handleReply.messageID);
    api.sendMessage("⏳ جاري معالجة الصورة فنيًا...", threadID, messageID);

    try {
        if (choice === "1") {
            // تعلية الجودة عبر API
            const res = await axios.get(`https://api.vamsi.tk/upscale?url=${encodeURIComponent(handleReply.imgURL)}`, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, Buffer.from(res.data, 'binary'));
        } 
        else {
            const image = await loadImage(handleReply.imgURL);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            switch (choice) {
                case "2": // سينمائي
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] *= 1.1; data[i + 2] *= 1.3;
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;
                case "3": // عتيق
                    for (let i = 0; i < data.length; i += 4) {
                        let r = data[i], g = data[i+1], b = data[i+2];
                        data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
                        data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
                        data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;
                case "4": // أبيض وأسود
                    for (let i = 0; i < data.length; i += 4) {
                        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        data[i] = data[i + 1] = data[i + 2] = avg;
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;
                case "5": // Blur
                    ctx.globalAlpha = 0.5;
                    for (let n = -3; n <= 3; n++) ctx.drawImage(canvas, n, n);
                    ctx.globalAlpha = 1.0;
                    break;
                case "6": // دائري
                    const size = Math.min(canvas.width, canvas.height);
                    const c2 = createCanvas(size, size);
                    const ctx2 = c2.getContext('2d');
                    ctx2.beginPath(); ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                    ctx2.clip(); ctx2.drawImage(image, (size - image.width) / 2, (size - image.height) / 2);
                    fs.writeFileSync(filePath, c2.toBuffer());
                    break;
                case "7": // تحسين ألوان
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] *= 1.2; data[i+1] *= 1.2; data[i+2] *= 1.2;
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;
                default: return api.sendMessage("❌ رقم غير صحيح.", threadID, messageID);
            }
            if (choice !== "6") fs.writeFileSync(filePath, canvas.toBuffer());
        }

        api.sendMessage({
            body: "✨ تم التعديل بواسطة ڪايࢪوس",
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage("❌ حدث خطأ في المعالجة.", threadID, messageID);
    }
};
