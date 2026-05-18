const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "رفع",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "رفع الوسائط المرفقة والحصول على رابط مباشر",
    commandCategory: "أدوات",
    cooldowns: 1
};

module.exports.run = async ({ api, event: e }) => {
    const { threadID, messageID, messageReply: reply } = e;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return api.sendMessage("يرجى الرد على صورة أو فيديو أولاً.", threadID, messageID);
    }

    try {
        // جلب عنوان الـ API الخاص بالرفع
        const apis = await axios.get("https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json");
        const Shaon = apis.data.imgur;

        const links = [];

        for (const attachment of reply.attachments) {
            const url = encodeURIComponent(attachment.url);
            const upload = await axios.get(`${Shaon}/imgur?link=${url}`);
            
            if (upload.data?.uploaded?.image) {
                links.push(upload.data.uploaded.image);
            }
        }

        if (links.length === 0) {
            return api.sendMessage("فشل رفع الملفات، تأكد من صلاحية المرفقات.", threadID, messageID);
        }

        // إرسال الروابط الناتجة فقط مباشرة
        return api.sendMessage(links.join("\n"), threadID, messageID);

    } catch (error) {
        console.error("خطأ في أمر رفع: " + error.message);
        return api.sendMessage("حدث خطأ أثناء محاولة رفع الملف.", threadID, messageID);
    }
};
