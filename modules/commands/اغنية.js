const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
    return base.data.api;
};

module.exports.config = {
    name: "اغنية",
    version: "2.6.0",
    aliases: ["موسيقى", "play", "song"],
    credits: "DANTE SPARDA",
    hasPermssion: 0,
    description: "البحث عن الأغاني وتحميلها من يوتيوب وإرسالها كريكورد",
    commandCategory: "الوسائط",
    cooldowns: 5
};

// الاستايل الهندسي الموحد
const musicUI = (title, details) => `
╭────── ◦ ◯ ◦ ──────╮
   الـنـظـام الـمـوسـيـقـي
╰────── ◦ ◯ ◦ ──────╯
⊞ الـحـالـة: ${title}

${details}

◦ ────── ◦
⎔ تـشـغـيـل الـوسـائط
◦ ────── ◦`.trim();

module.exports.run = async function({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

    if (!args[0]) {
        return api.sendMessage(musicUI("تـنـبـيـه", "• يرجى كتابة اسم الأغنية أو وضع رابط صحيح"), threadID, messageID);
    }

    try {
        const apiUrl = await baseApiUrl();

        // 1. التعامل مع الروابط المباشرة
        if (checkurl.test(args[0])) {
            const videoID = args[0].match(checkurl)[1];
            
            try {
                await api.setMessageReaction("⏳", messageID, () => {}, true);
            } catch (err) {}

            api.sendMessage(musicUI("جـارِ الـتـحميل", "• يرجى الانتظار، نعتمد جلب المقطع الصوتي من السيرفر"), threadID, async (err, info) => {
                const pathVideo = path.join(__dirname, "cache", `music_${messageID}.mp3`);
                try {
                    const { data } = await axios.get(`${apiUrl}/ytDl3?link=${videoID}&format=mp3`);
                    const stream = await getStream(data.downloadLink, pathVideo);
                    
                    await api.unsendMessage(info.messageID);
                    return api.sendMessage({ 
                        body: musicUI("تم الـتـحميل", `• العنوان: ${data.title}`), 
                        attachment: stream,
                        isAudio: true // إرسال كريكورد صوتي
                    }, threadID, () => {
                        if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                    }, messageID);
                } catch (e) {
                    if (info?.messageID) await api.unsendMessage(info.messageID);
                    if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                    return api.sendMessage(musicUI("خطأ", "• فشل تحميل الرابط، قد يكون المقطع غير متاح حالياً"), threadID, messageID);
                }
            }, messageID);
            return;
        }

        // 2. البحث عن الأغاني بالاسم (عرض 7 نتائج)
        let keyWord = args.join(" ");
        api.sendMessage(musicUI("جـارِ الـبـحـث", `• يتم الفحص والبحث عن: ${keyWord}`), threadID, async (err, info) => {
            try {
                const result = (await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, 7);
                if (result.length == 0) {
                    await api.unsendMessage(info.messageID);
                    return api.sendMessage(musicUI("نتيجة صفرية", "• لم نجد أي نتائج تطابق هذا البحث"), threadID, messageID);
                }

                let msg = "";
                let thumbnails = [];
                const cacheFiles = [];

                for (let index = 0; index < result.length; index++) {
                    const item = result[index];
                    msg += `${index + 1} ◂ ${item.title}\n◦ الوقت: ${item.time}\n\n`;
                    
                    const thumbPath = path.join(__dirname, "cache", `thumb_${messageID}_${index}.jpg`);
                    thumbnails.push(getThumbnailStream(item.thumbnail, thumbPath));
                    cacheFiles.push(thumbPath);
                }

                const attachments = await Promise.all(thumbnails);
                await api.unsendMessage(info.messageID);

                api.sendMessage({
                    body: musicUI("نتائج البحث", msg + "• قم بالرد على الرسالة برقم المقدار المطلوب للاستماع"),
                    attachment: attachments
                }, threadID, (err, nextInfo) => {
                    cacheFiles.forEach(file => { if (fs.existsSync(file)) fs.unlinkSync(file); });

                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: nextInfo.messageID,
                        author: senderID,
                        result
                    });
                }, messageID);

            } catch (e) {
                if (info?.messageID) await api.unsendMessage(info.messageID);
                return api.sendMessage(musicUI("خطأ", "• حدثت مشكلة أثناء جلب نتائج البحث من اليوتيوب"), threadID, messageID);
            }
        }, messageID);

    } catch (e) {
        return api.sendMessage(musicUI("خطأ فني", "• الخادم الرئيسي لا يستجيب في الوقت الحالي"), threadID, messageID);
    }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
    const { threadID, messageID, body, senderID } = event;
    if (String(senderID) !== String(handleReply.author)) return;

    try {
        const choice = parseInt(body);
        if (isNaN(choice) || choice > handleReply.result.length || choice <= 0) return;

        const infoChoice = handleReply.result[choice - 1];
        
        // التفاعل فوراً برمز الساعة الرملية عند استقبال الرقم الصحيح من المستخدم
        try {
            await api.setMessageReaction("⏳", messageID, () => {}, true);
        } catch (err) {}

        await api.unsendMessage(handleReply.messageID);

        api.sendMessage(musicUI("جـارِ الـمـعالجة", "• يتم الآن سحب الملف الصوتي وتحويله برمجياً"), threadID, async (err, waitInfo) => {
            const pathVideo = path.join(__dirname, "cache", `music_${messageID}.mp3`);
            try {
                const apiUrl = await baseApiUrl();
                const { data } = await axios.get(`${apiUrl}/ytDl3?link=${infoChoice.id}&format=mp3`);
                const stream = await getStream(data.downloadLink, pathVideo);
                
                await api.unsendMessage(waitInfo.messageID);
                return api.sendMessage({
                    body: musicUI("جاهز", `• العنوان: ${data.title}\n• الجودة: ${data.quality || 'عالية'}`),
                    attachment: stream,
                    isAudio: true // تحويل الملف برمجياً ليظهر كريكورد داخل المحادثة
                }, threadID, () => {
                    if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                }, messageID);
            } catch (e) {
                if (waitInfo?.messageID) await api.unsendMessage(waitInfo.messageID);
                if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                return api.sendMessage(musicUI("فشل", "• حجم الملف الصوتي كبير جداً أو أن السيرفر واجه مشكلة"), threadID, messageID);
            }
        }, messageID);

    } catch (error) {
        return api.sendMessage(musicUI("خطأ", "• تعذر إتمام عملية معالجة الرد والتحميل"), threadID, messageID);
    }
};

async function getStream(url, pathName) {
    const dir = path.dirname(pathName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(pathName, Buffer.from(res.data));
    return fs.createReadStream(pathName);
}

async function getThumbnailStream(url, pathName) {
    const dir = path.dirname(pathName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(pathName, Buffer.from(res.data));
    return fs.createReadStream(pathName);
}
