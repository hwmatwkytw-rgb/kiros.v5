const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
    name: "تيك",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Dante Sparda",
    description: "تحميل فيديوهات تيك توك بدون علامة مائية",
    commandCategory: "الوسائط",
    usages: "[رابط الفيديو]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const url = args[0];

    if (!url) return api.sendMessage("يا حبيبنا حط رابط الفيديو بعد الأمر!", threadID, messageID);

    try {
        api.sendMessage("جاري التحميل.. أبقى قريّب ⏳", threadID, messageID);

        const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const data = res.data.data;
        const videoUrl = data.play; // الفيديو بدون علامة مائية
        const title = data.title || "فيديو تيك توك";

        const path = __dirname + `/cache/tiktok.mp4`;
        const getVid = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(getVid, "utf-8"));

        const msg = `╮───────∙⋆⋅ ※ ⋅⋆∙───────╭\n` +
                        `       تـيـك تـوك 🎬\n` +
                        `╯───────∙⋆⋅ ※ ⋅⋆∙───────╰\n\n` +
                        `🔹 الـوصـف : ${title}\n\n` +
                        `╮───────∙⋆⋅ ※ ⋅⋆∙───────◈\n` +
                        `│ تـم الـتـحـمـيـل بـنـجـاح ✅\n` +
                        `╯───────∙⋆⋅ ※ ⋅⋆∙───────◈`;

        return api.sendMessage({ body: msg, attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID);

    } catch (err) {
        return api.sendMessage("حصلت مشكلة في التحميل، تأكد من الرابط!", threadID, messageID);
    }
};
