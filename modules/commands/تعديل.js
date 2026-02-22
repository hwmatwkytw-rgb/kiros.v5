const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

module.exports.config = {
    name: "تعديل",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "تعديل الصور باحترافية (رد على صورة)",
    commandCategory: "الصور",
    usages: "[رد على صورة]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, messageReply } = event;

    // التأكد من أن المستخدم رد على صورة
    if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("⚠️ | عذراً، يجب عليك الرد على (صورة) لتتمكن من تعديلها.", threadID, messageID);
    }

    const imgURL = messageReply.attachments[0].url;
    
    const menu = `╭─── • 🔧 • ───╮\n` +
                 `  ⌈ مُحرر الـصـور الـمُطور ⌋\n` +
                 `╰─── • 🔧 • ───╯\n\n` +
                 `1. [✨] تعلية الجودة (Ultra HD)\n` +
                 `2. [🎬] فلتر سينمائي (Cinematic)\n` +
                 `3. [📜] فلتر عتيق (Sepia/Old)\n` +
                 `4. [🌗] أبيض وأسود (B&W)\n` +
                 `5. [🌀] تعتيم الخلفية (Blur)\n` +
                 `6. [⭕] قص دائري (Circle)\n` +
                 `7. [🎨] تحسين الألوان (Vibrant)\n\n` +
                 `«— رد بـ رقـم الـتعديـل —»`;

    return api.sendMessage(menu, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            imgURL: imgURL
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, body, senderID, messageID } = event;
    if (senderID != handleReply.author) return;

    const path = __dirname + `/cache/edit_${senderID}_${Date.now()}.png`;
    const choice = body.trim();
    
    // التحقق من أن المجلد موجود
    if (!fs.existsSync(__dirname + '/cache')) fs.mkdirSync(__dirname + '/cache');

    api.sendMessage("⏳ | جاري معالجة صورتك فنيًا...", threadID, messageID);

    try {
        if (choice === "1") {
            // تعلية الجودة عبر API خارجي (Upscale)
            const res = await axios.get(`https://api.vamsi.tk/upscale?url=${encodeURIComponent(handleReply.imgURL)}`, { responseType: 'arraybuffer' });
            fs.writeFileSync(path, Buffer.from(res.data, 'binary'));
        } 
        else {
            const image = await loadImage(handleReply.imgURL);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            switch (choice) {
                case "2": // سينمائي (تعديل التباين والأزرق)
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] *= 1.1;     // Red
                        data[i + 2] *= 1.3; // Blue
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;

                case "3": // عتيق (Sepia)
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

                case "5": // تشويش (Blur)
                    ctx.globalAlpha = 0.5;
                    for (let n = -3; n <= 3; n++) ctx.drawImage(canvas, n, n);
                    ctx.globalAlpha = 1.0;
                    break;

                case "6": // قص دائري
                    const size = Math.min(canvas.width, canvas.height);
                    const c2 = createCanvas(size, size);
                    const ctx2 = c2.getContext('2d');
                    ctx2.beginPath();
                    ctx2.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                    ctx2.clip();
                    ctx2.drawImage(image, (size - image.width) / 2, (size - image.height) / 2);
                    fs.writeFileSync(path, c2.toBuffer());
                    break;

                case "7": // تحسين ألوان (Vibrant)
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = Math.min(255, data[i] * 1.2);
                        data[i+1] = Math.min(255, data[i+1] * 1.2);
                        data[i+2] = Math.min(255, data[i+2] * 1.2);
                    }
                    ctx.putImageData(imgData, 0, 0);
                    break;

                default:
                    return api.sendMessage("❌ | اختيار غير صائب، يرجى اختيار رقم من القائمة.", threadID, messageID);
            }
            if (choice !== "6") fs.writeFileSync(path, canvas.toBuffer());
        }

        return api.sendMessage({
            body: "✨ | إليك الصورة بعد التعديل الفني:",
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
        console.error(err);
        return api.sendMessage("❌ | فشلت المعالجة، قد يكون الرابط منتهي الصلاحية أو المكتبة غير مثبتة.", threadID, messageID);
    }
};
