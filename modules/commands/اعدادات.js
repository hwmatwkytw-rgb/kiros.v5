module.exports.config = {
    name: "اعدادات",
    version: "2.5.0",
    hasPermssion: 1,
    credits: "Gemini AI",
    description: "نظام حماية وإعدادات المجموعة",
    commandCategory: "الادمن",
    usages: "[رد بالأرقام]",
    cooldowns: 2,
};

module.exports.run = async function ({ api, event, Threads }) {
    const { threadID, messageID } = event;
    let data = (await Threads.getData(threadID)).data || {};
    
    // الإعدادات الافتراضية (❌)
    if (!data.antiSettings) {
        data.antiSettings = { antiSpam: false, antiName: false, antiImage: false, antiNickname: false, notify: false };
    }

    const s = data.antiSettings;
    const menu = `╭─────────────╮\n` +
                 `  ⌈ اعـدادات الـمـجـموعـة ⌋\n` +
                 `╰─────────────╯\n\n` +
                 `1. [${s.antiSpam ? "✅" : "❌"}] مكافحة الازعاج\n` +
                 `2. [${s.antiName ? "✅" : "❌"}] مكافحة تغيير الاسم\n` +
                 `3. [${s.antiImage ? "✅" : "❌"}] مكافحة تغيير الصورة\n` +
                 `4. [${s.antiNickname ? "✅" : "❌"}] مكافحة تغيير الكنية\n` +
                 `5. [${s.notify ? "✅" : "❌"}] اخطار احداث المجموعة\n\n` +
                 `«— رد بـ أرقام الإعدادات —»\n` +
                 `💡 يمكنك كتابة الأرقام عمودياً:\n` +
                 `1\n2\n4`;

    return api.sendMessage(menu, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            settings: s
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, body, senderID, messageID } = event;
    if (senderID != handleReply.author) return;

    const choices = body.match(/\d+/g); // استخراج كل الأرقام من الرسالة
    if (!choices) return;

    let s = handleReply.settings;
    choices.forEach(num => {
        if (num == "1") s.antiSpam = !s.antiSpam;
        if (num == "2") s.antiName = !s.antiName;
        if (num == "3") s.antiImage = !s.antiImage;
        if (num == "4") s.antiNickname = !s.antiNickname;
        if (num == "5") s.notify = !s.notify;
    });

    return api.sendMessage("⚠️ تفاعل بـ 👍 على هذه الرسالة لتأكيد التغييرات وأخذ نسخة من حالة المجموعة.", threadID, (err, info) => {
        global.client.handleReaction.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            newSettings: s
        });
    }, messageID);
};

module.exports.handleReaction = async function ({ api, event, handleReaction, Threads }) {
    const { threadID, reaction, userID } = event;
    if (userID != handleReaction.author || reaction != "👍") return;

    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const isAdmin = threadInfo.adminIDs.some(i => i.id == botID);
    
    let finalSettings = handleReaction.newSettings;
    let warning = "";

    // فحص صلاحية الإدمن للبوت
    if (!isAdmin) {
        if (finalSettings.antiImage || finalSettings.antiNickname) {
            finalSettings.antiImage = false;
            finalSettings.antiNickname = false;
            warning = "\n\n⚠️ تنبيه: البوت ليس إدمن، تم تعطيل حماية (الصورة/الكنية) تلقائياً.";
        }
    }

    let data = (await Threads.getData(threadID)).data || {};
    data.antiSettings = finalSettings;
    
    // حفظ اللقطة (Snapshot)
    data.snapshot = {
        name: threadInfo.threadName,
        imageSrc: threadInfo.imageSrc,
        nicknames: threadInfo.nicknames
    };

    await Threads.setData(threadID, { data });
    return api.sendMessage(`✅ [Anti-out] تم حفظ الإعدادات بنجاح!${warning}`, threadID);
};
