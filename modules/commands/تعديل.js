const Jimp = require('jimp');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "تعديل",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "نظام معالجة الصور المتقدم مع تفاعلات تلقائية",
    commandCategory: "أدوات الصور",
    usages: "[رد على صورة بكلمة تعديل]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;

    // التحقق من الرد على صورة
    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("┌──── • ⚠️ • ────┐\n│ يرجى الرد على صورة │\n└──────────────┘", threadID, messageID);
    }

    const menu = 
        `┌───〔 📄 𝐌𝐄𝐍𝐔 〕───┐\n` +
        `│ [1] • تمويه (Blur)\n` +
        `│ [2] • كتابة نص (Text)\n` +
        `│ [3] • أبيض وأسود (Gray)\n` +
        `│ [4] • كلاسيكي (Sepia)\n` +
        `│ [5] • عكس الألوان (Invert)\n` +
        `├──────────────────\n` +
        `│ رد بالرقم المطلوب │\n` +
        `└──────────────────┘`;

    return api.sendMessage(menu, threadID, (err, info) => {
        global.client.handleReply.push({
            step: "choose_option",
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            imageUrl: messageReply.attachments[0].url
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (handleReply.author !== senderID) return;

    // تفاعل الانتظار فور استلام الرد
    api.setMessageReaction("⌛", messageID, () => {}, true);

    const cachePath = path.join(__dirname, 'cache', `edit_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, 'cache'));

    try {
        // المرحلة الأولى: اختيار الوظيفة من القائمة
        if (handleReply.step === "choose_option") {
            const image = await Jimp.read(handleReply.imageUrl);
            
            switch (body) {
                case "1": // تمويه
                    image.blur(10);
                    return sendProcessedImage(api, threadID, messageID, image, cachePath);
                
                case "2": // الانتقال لمرحلة الكتابة
                    api.unsendMessage(handleReply.messageID);
                    return api.sendMessage("┌──── • 📝 • ────┐\n│ أرسل النص المطلوب │\n└──────────────┘", threadID, (err, info) => {
                        global.client.handleReply.push({
                            step: "write_text",
                            name: this.config.name,
                            messageID: info.messageID,
                            author: senderID,
                            imageUrl: handleReply.imageUrl // تمرير الرابط للمرحلة القادمة
                        });
                    }, messageID);

                case "3": image.greyscale(); break;
                case "4": image.sepia(); break;
                case "5": image.invert(); break;
                default: 
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    return api.sendMessage("⚠️ رقم غير صالح من القائمة", threadID, messageID);
            }
            return sendProcessedImage(api, threadID, messageID, image, cachePath);
        }

        // المرحلة الثانية: تنفيذ الكتابة بعد استلام النص
        if (handleReply.step === "write_text") {
            const image = await Jimp.read(handleReply.imageUrl);
            const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            
            // الكتابة في أعلى اليسار مع إزاحة بسيطة
            image.print(font, 30, 30, body);
            
            return sendProcessedImage(api, threadID, messageID, image, cachePath);
        }

    } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("┌── [ ⚠️ ERROR ] ──┐\n│ فشل في المعالجة │\n└────────────────┘", threadID, messageID);
    }
};

// دالة مساعدة لإرسال الصورة النهائية مع التفاعل والتوثيق
async function sendProcessedImage(api, threadID, messageID, image, cachePath) {
    await image.writeAsync(cachePath);
    
    // تفاعل النجاح
    api.setMessageReaction("✅", messageID, () => {}, true);

    return api.sendMessage({
        body: `┌─── • 🛠️ 𝐃𝐎𝐍𝐄 • ───┐\n│ تمت المعالجة بنجاح │\n├──────────────────\n│ ⚙︎ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠\n└──────────────────┘`,
        attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
}
