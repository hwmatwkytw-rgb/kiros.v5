module.exports.config = {
    name: "رفع",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "رفع صورة وتحويلها إلى رابط مباشر",
    commandCategory: "أدوات",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;

    // التأكد أن المستخدم رد على صورة
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length == 0) {
        return api.sendMessage("📌 رد على صورة عشان أرفعها وأحولها لرابط مباشر", threadID, messageID);
    }

    try {
        const attachment = messageReply.attachments[0];

        // التأكد أنها صورة
        if (attachment.type !== "photo") {
            return api.sendMessage("❌ لازم ترد على صورة فقط", threadID, messageID);
        }

        const imageUrl = attachment.url;

        // رفع الصورة إلى Catbox (رابط مباشر)
        const axios = require("axios");
        const res = await axios.get("https://catbox.moe/user/api.php", {
            params: {
                reqtype: "urlupload",
                url: imageUrl
            }
        });

        const directLink = res.data;

        return api.sendMessage(
            `🖼️ تم رفع الصورة بنجاح!\n\n🔗 الرابط المباشر:\n${directLink}`,
            threadID,
            messageID
        );

    } catch (error) {
        console.log(error);
        return api.sendMessage("❌ حدث خطأ أثناء رفع الصورة", threadID, messageID);
    }
};
