const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_KEY = "66e0cfbb-62b8-4829-90c7-c78cacc72ae2";
const API_URL = "https://kaiz-apis.gleeze.com/api/gemini-pro";

module.exports.config = {
    name: "جيمي",
    version: "2.1.5",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "معالجة النصوص وتحليل الصور باستخدام ذكاء جيميني",
    commandCategory: "الوسائط",
    cooldowns: 5,
    aliases: ["gemini", "gmn", "ai"]
};

module.exports.run = async function ({ api, event: e, args }) {
    const { threadID: tid, messageID: mid, senderID: uid, messageReply: reply } = e;
    const cacheDir = path.join(__dirname, "cache");
    let imageUrl = null;

    // 1. التقاط الصورة من الرد إن وجدت
    if (reply && reply.attachments && reply.attachments.length > 0) {
        const imgAtt = reply.attachments.find(a => 
            a.type === "photo" || a.type === "animated_image" || a.type === "sticker"
        );
        if (imgAtt) {
            imageUrl = imgAtt.playbackUrl || imgAtt.url || imgAtt.largePreviewUrl || imgAtt.previewUrl;
        }
    }

    // 2. التقاط الصورة المرفقة مباشرة بالرسالة إن لم تكن في الرد
    if (!imageUrl && e.attachments && e.attachments.length > 0) {
        const imgAtt = e.attachments.find(a => 
            a.type === "photo" || a.type === "animated_image" || a.type === "sticker"
        );
        if (imgAtt) {
            imageUrl = imgAtt.playbackUrl || imgAtt.url || imgAtt.largePreviewUrl || imgAtt.previewUrl;
        }
    }

    const textQuery = args.join(" ").trim();

    if (!textQuery && !imageUrl) {
        return api.sendMessage("يرجى كتابة سؤال أو الرد على صورة لتشغيل الأمر.", tid, mid);
    }

    // وضع تفاعل الانتظار لبدء المعالجة برمجياً
    try {
        await api.setMessageReaction("⏳", mid, () => {}, true);
    } catch (err) {}

    try {
        const res = await axios.get(API_URL, {
            params: {
                ask: textQuery || "describe image",
                uid: String(uid),
                image: imageUrl,
                apikey: API_KEY
            },
            timeout: 60000
        });

        const replyText = res.data.response || res.data.reply || null;
        const generatedImage = res.data.image || res.data.imageUrl || res.data.output || null;

        // إزالة التفاعل فور استقبال البيانات من السيرفر
        try {
            await api.setMessageReaction("", mid, () => {}, true);
        } catch (err) {}

        // الاحتمال الأول: رجوع ملف ميديا (صورة معالجة أو مولدة)
        if (generatedImage) {
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            const imgPath = path.join(cacheDir, `gemini_${mid}.jpg`);

            const imgRes = await axios.get(generatedImage, { responseType: "arraybuffer", timeout: 60000 });
            fs.writeFileSync(imgPath, Buffer.from(imgRes.data));

            return api.sendMessage({
                body: replyText || "تم معالجة وتوليد الميديا المرفقة.",
                attachment: fs.createReadStream(imgPath)
            }, tid, () => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }, mid);
        }

        // الاحتمال الثاني: رد نصي مباشر
        if (!replyText) {
            return api.sendMessage("لم يتم استلام أي رد نصي متاح من الخادم.", tid, mid);
        }

        return api.sendMessage(replyText, tid, mid);

    } catch (err) {
        console.error("خطأ في أمر جيمي: " + err.message);
        try {
            await api.setMessageReaction("❌", mid, () => {}, true);
        } catch (e) {}
        return api.sendMessage("فشل الاتصال بسيرفر المعالجة الرئيسي.", tid, mid);
    }
};
