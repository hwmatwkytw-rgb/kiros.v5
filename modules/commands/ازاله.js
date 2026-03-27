module.exports.config = {
    name: "ازاله",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "إزالة خلفية الصورة",
    commandCategory: "وسائط",
    cooldowns: 10
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length == 0) {
        return api.sendMessage("📌 رد على صورة أولاً", threadID, messageID);
    }

    const axios = require("axios");
    const fs = require("fs");

    const imageUrl = messageReply.attachments[0].url;

    try {
        api.sendMessage("⏳ جاري إزالة الخلفية...", threadID, messageID);

        const response = await axios({
            method: "POST",
            url: "https://api.remove.bg/v1.0/removebg",
            data: {
                image_url: imageUrl,
                size: "auto"
            },
            headers: {
                "X-Api-Key": "CAej3wDWWGaX2k7yUBydCG64"
            },
            responseType: "arraybuffer"
        });

        const path = __dirname + "/nobg.png";
        fs.writeFileSync(path, response.data, "binary");

        return api.sendMessage({
            attachment: fs.createReadStream(path),
            body: "🧼 تم إزالة الخلفية بنجاح!"
        }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
        console.log(err);
        return api.sendMessage("❌ حدث خطأ أثناء إزالة الخلفية", threadID, messageID);
    }
};
