module.exports.config = {
    name: "antiEvents",
    eventType: ["log:thread-name", "log:thread-icon", "log:user-nickname"],
    version: "1.2.0",
    credits: "Gemini AI",
    description: "نظام استعادة البيانات التلقائي"
};

module.exports.run = async function ({ event, api, Threads }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    if (author == botID) return;

    const thread = await Threads.getData(threadID);
    if (!thread || !thread.data.antiSettings || !thread.data.snapshot) return;

    const settings = thread.data.antiSettings;
    const snapshot = thread.data.snapshot;

    // 1. حماية الاسم
    if (logMessageType === "log:thread-name" && settings.antiName) {
        if (logMessageData.name !== snapshot.name) {
            api.setTitle(snapshot.name, threadID);
            api.sendMessage(`[Anti-out] التغيير غير مسموح به لذالك تمت اعادة الاسم لحالتها الاصلية`, threadID);
        }
    }

    // 2. حماية الصورة
    if (logMessageType === "log:thread-icon" && settings.antiImage) {
        const axios = require("axios");
        const fs = require("fs");
        const path = __dirname + `/cache/recovery_${threadID}.png`;
        
        try {
            const res = await axios.get(snapshot.imageSrc, { responseType: "arraybuffer" });
            fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
            api.changeGroupImage(fs.createReadStream(path), threadID, () => {
                if (fs.existsSync(path)) fs.unlinkSync(path);
            });
            api.sendMessage(`[Anti-out] التغيير غير مسموح به لذالك تمت اعادة الصورة لحالتها الاصلية`, threadID);
        } catch (e) { console.error("خطأ في استعادة الصورة:", e); }
    }

    // 3. حماية الكنية
    if (logMessageType === "log:user-nickname" && settings.antiNickname) {
        const targetID = logMessageData.participant_id;
        const oldNick = snapshot.nicknames[targetID] || ""; // إرجاعها فارغة إذا لم تكن هناك كنية أصلاً
        
        api.changeNickname(oldNick, threadID, targetID);
        api.sendMessage(`[Anti-out] التغيير غير مسموح به لذالك تمت اعادة الكنية لحالتها الاصلية`, threadID);
    }
};
