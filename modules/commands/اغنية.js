const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
    return base.data.api;
};

module.exports.config = {
    name: "اغنية",
    version: "2.6.5",
    aliases: ["موسيقى", "play", "song"],
    credits: "DANTE SPARDA",
    hasPermssion: 0,
    description: "البحث عن الأغاني وتحميلها من يوتيوب وإرسالها كريكورد",
    commandCategory: "الوسائط",
    cooldowns: 5
};

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
        return api.sendMessage("يرجى كتابة اسم الأغنية أو وضع رابط صحيح.", threadID, messageID);
    }

    try {
        const apiUrl = await baseApiUrl();

        if (checkurl.test(args[0])) {
            const videoID = args[0].match(checkurl)[1];
            
            try {
                await api.setMessageReaction("⏳", messageID, () => {}, true);
            } catch (err) {}

            const pathVideo = path.join(__dirname, "cache", `music_${messageID}.mp3`);
            try {
                const { data } = await axios.get(`${apiUrl}/ytDl3?link=${videoID}&format=mp3`);
                await getStream(data.downloadLink, pathVideo);
                
                return api.sendMessage({ 
                    body: musicUI("تم الـتـحميل", `• العنوان: ${data.title}`), 
                    attachment: fs.createReadStream(pathVideo),
                    isAudio: true
                }, threadID, () => {
                    if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                }, messageID);
            } catch (e) {
                if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
                return api.sendMessage("حدثت مشكلة أثناء تحميل الرابط المباشر.", threadID, messageID);
            }
        }

        let keyWord = args.join(" ");
        try {
            const result = (await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, 7);
            if (result.length == 0) {
                return api.sendMessage("لم نجد أي نتائج تطابق هذا البحث.", threadID, messageID);
            }

            let msg = "";
            let attachments = [];

            for (let index = 0; index < result.length; index++) {
                const item = result[index];
                msg += `${index + 1} ◂ ${item.title}\n◦ الوقت: ${item.time}\n\n`;
                
                if (item.thumbnail) {
                    const attach = await getUrlStream(item.thumbnail);
                    if (attach) attachments.push(attach);
                }
            }

            api.sendMessage({
                body: musicUI("نتائج البحث", msg + "• قم بالرد على الرسالة برقم المقدار المطلوب للاستماع"),
                attachment: attachments
            }, threadID, (err, nextInfo) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: nextInfo.messageID,
                    author: senderID,
                    result
                });
            }, messageID);

        } catch (e) {
            return api.sendMessage("حدثت مشكلة أثناء جلب نتائج البحث من يوتيوب.", threadID, messageID);
        }

    } catch (e) {
        return api.sendMessage("الخادم الرئيسي لا يستجيب في الوقت الحالي.", threadID, messageID);
    }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
    const { threadID, messageID, body, senderID } = event;
    if (String(senderID) !== String(handleReply.author)) return;

    try {
        const choice = parseInt(body);
        if (isNaN(choice) || choice > handleReply.result.length || choice <= 0) return;

        const infoChoice = handleReply.result[choice - 1];
        
        try {
            await api.setMessageReaction("⏳", messageID, () => {}, true);
        } catch (err) {}

        try {
            await api.unsendMessage(handleReply.messageID);
        } catch (err) {}

        const pathVideo = path.join(__dirname, "cache", `music_${messageID}.mp3`);
        try {
            const apiUrl = await baseApiUrl();
            const { data } = await axios.get(`${apiUrl}/ytDl3?link=${infoChoice.id}&format=mp3`);
            
            await getStream(data.downloadLink, pathVideo);
            
            return api.sendMessage({
                body: musicUI("جاهز", `• العنوان: ${data.title}\n• الجودة: ${data.quality || 'عالية'}`),
                attachment: fs.createReadStream(pathVideo),
                isAudio: true
            }, threadID, () => {
                if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
            }, messageID);
        } catch (e) {
            if (fs.existsSync(pathVideo)) fs.unlinkSync(pathVideo);
            return api.sendMessage("حجم الملف الصوتي كبير جداً أو أن الرابط معطل.", threadID, messageID);
        }

    } catch (error) {
        return api.sendMessage("تعذر إتمام عملية معالجة الرد والتحميل.", threadID, messageID);
    }
};

async function getStream(url, pathName) {
    const dir = path.dirname(pathName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(pathName, Buffer.from(res.data));
    return true;
}

async function getUrlStream(url) {
    try {
        const res = await axios.get(url, { responseType: "stream" });
        return res.data;
    } catch (e) {
        return null;
    }
}
