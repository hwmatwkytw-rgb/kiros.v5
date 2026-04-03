const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');

module.exports.config = {
    name: "رفع",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Dante Sparda",
    description: "رفع الصور لسيرفر كايروس الخاص",
    commandCategory: "utility",
    usages: "رد على صورة بـ رفع",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    if (!messageReply || !messageReply.attachments[0]) return api.sendMessage("يرجى الرد على صورة!", threadID, messageID);

    const url = messageReply.attachments[0].url;
    const path = __dirname + `/cache/upload_${Date.now()}.jpg`;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path, Buffer.from(response.data));

        const form = new FormData();
        form.append('image', fs.createReadStream(path));

        const res = await axios.post('https://kiros-api-22.onrender.com/api/upload', form, {
            headers: form.getHeaders()
        });

        api.sendMessage(`✅ تم الرفع بنجاح!\n🔗 الرابط: ${res.data.url}`, threadID, () => fs.unlinkSync(path), messageID);
    } catch (e) {
        api.sendMessage("❌ فشل الرفع للسيرفر الشخصي.", threadID, messageID);
    }
};
