const fbDownloader = require('fb-downloader-scrapper');
const axios = require('axios');

module.exports.config = {
    name: "تحميل",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "تحميل فيديوهات فيسبوك بجودة عالية",
    commandCategory: "Media",
    usages: "[رابط الفيديو]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const url = args.join(" "); // لضمان قراءة الرابط بالكامل

    if (!url) return api.sendMessage("⚠️ أرسل رابط الفيديو بعد كلمة تحميل.", threadID, messageID);

    const waitMsg = await api.sendMessage("⏳ جاري معالجة الفيديو من فيسبوك...", threadID);

    try {
        // استخدام المكتبة التي ثبتها بنجاح
        const result = await fbDownloader(url);
        const videoUrl = result.hd || result.sd;

        if (!videoUrl) {
            return api.sendMessage("❌ لم يتم العثور على روابط تحميل. تأكد أن الفيديو 'عام'.", threadID, messageID);
        }

        // جلب الفيديو كـ Stream لضمان إرساله كملف وليس كرابط فقط
        const videoStream = await axios.get(videoUrl, { responseType: 'stream' });

        const msg = {
            body: `✅ تم التحميل بنجاح\n\n📺 الجودة: ${result.hd ? 'HD' : 'SD'}\n👤 المطور: ${module.exports.config.credits}`,
            attachment: videoStream.data
        };

        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage(msg, threadID, messageID);

    } catch (error) {
        console.error(error);
        api.unsendMessage(waitMsg.messageID);
        return api.sendMessage("❌ حدث خطأ أثناء التحميل، قد يكون الفيديو خاص أو الرابط غير صالح.", threadID, messageID);
    }
};
