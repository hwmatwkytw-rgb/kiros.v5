module.exports.config = {
    name: "اعدادات",
    version: "2.8.0",
    hasPermssion: 1,
    credits: "النسخة الأصلية",
    description: "نظام حماية وإعدادات المجموعة",
    commandCategory: "الادمن",
    usages: "[الأرقام]",
    cooldowns: 2,
};

function getMenuText(s) {
    return `╭── • إعـدادات الـدردشـة\n` +
           `│ 1 ⊸ [${s.antiOut ? "✅" : "❌"}] مـكافـحـة الـخـروج\n` +
           `│ 2 ⊸ [${s.antiName ? "✅" : "❌"}] مـكافـحـة الاسـم\n` +
           `│ 3 ⊸ [${s.antiImage ? "✅" : "❌"}] مـكافـحـة الـصورة\n` +
           `│ 4 ⊸ [${s.antiNickname ? "✅" : "❌"}] مـكافـحـة الـكـنية\n` +
           `│ 5 ⊸ [${s.notify ? "🔔" : "🔕"}] الإشـعـارات\n` +
           `╰── •`;
}

module.exports.run = async function ({ api, event, Threads }) {
    const { threadID, messageID, senderID } = event;

    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(i => i.id == senderID);
    
    if (!isAdmin) {
        return api.sendMessage("⚠️ | عذراً، هذا الأمر مخصص لمشرفي المجموعة فقط.", threadID, messageID);
    }

    let data = (await Threads.getData(threadID)).data || {};
    
    if (!data.antiSettings) {
        data.antiSettings = { antiOut: false, antiName: false, antiImage: false, antiNickname: false, notify: false };
    }

    const s = data.antiSettings;
    const menu = getMenuText(s) + "\nرُد بـأرقـام الـخـيارات لـتغيير حـالـتـها";

    return api.sendMessage(menu, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            settings: s
        });
    }, messageID);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, body, senderID, messageID } = event;
    if (senderID != handleReply.author) return;

    const choices = body.match(/\d+/g);
    if (!choices) return;

    let s = handleReply.settings;
    choices.forEach(num => {
        if (num == "1") s.antiOut = !s.antiOut;
        if (num == "2") s.antiName = !s.antiName;
        if (num == "3") s.antiImage = !s.antiImage;
        if (num == "4") s.antiNickname = !s.antiNickname;
        if (num == "5") s.notify = !s.notify;
    });

    const updatedMenu = getMenuText(s);
    const finalMsg = `${updatedMenu}\n\n╭── • تـأكـيد\n│ تـفاعل بـ 👍 لـحفظ وحـماية حـالة الـمجموعة الآن\n╰── •`;

    api.unsendMessage(handleReply.messageID);

    return api.sendMessage(finalMsg, threadID, (err, info) => {
        global.client.handleReaction.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            newSettings: s
        });
    });
};

module.exports.handleReaction = async function ({ api, event, handleReaction, Threads }) {
    const { threadID, reaction, userID } = event;
    if (userID != handleReaction.author || reaction != "👍") return;

    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const isBotAdmin = threadInfo.adminIDs.some(i => i.id == botID);
    
    let finalSettings = handleReaction.newSettings;
    let warnings = [];

    if (!isBotAdmin) {
        if (finalSettings.antiOut) { finalSettings.antiOut = false; warnings.push("الخروج"); }
        if (finalSettings.antiImage) { finalSettings.antiImage = false; warnings.push("الصورة"); }
        if (finalSettings.antiNickname) { finalSettings.antiNickname = false; warnings.push("الكنية"); }
    }

    let data = (await Threads.getData(threadID)).data || {};
    data.antiSettings = finalSettings;
    
    data.snapshot = {
        name: threadInfo.threadName,
        imageSrc: threadInfo.imageSrc,
        nicknames: threadInfo.nicknames
    };

    await Threads.setData(threadID, { data });
    
    api.unsendMessage(handleReaction.messageID);

    let msg = `╭── • نـجـاح\n│ تـم تـحديث الإعـدادات وأخـذ لـقطة لـلحماية`;
    if (warnings.length > 0) {
        msg += `\n│ ⚠️ تـنبيه: تـم تـعطيل (${warnings.join("-")}) لأن الـبوت لـيس مـشرفاً`;
    }
    msg += `\n╰── •`;

    return api.sendMessage(msg, threadID);
};
