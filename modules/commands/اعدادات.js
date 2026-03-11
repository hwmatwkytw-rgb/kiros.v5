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
    
    // الإعدادات الافتراضية (⬜)
    if (!data.antiSettings) {
        data.antiSettings = { antiSpam: false, antiName: false, antiImage: false, antiNickname: false, notifications: true };
    }

    const s = data.antiSettings;
    const menu = `◤━━━━━━━━━━◥\n` +
                 `    ⚙️ *الاعدادات* ⚙️\n` +
                 `◣━━━━━━━━━━◢\n\n` +
                 `◈ ━━━━━━━━━━━ ◈\n` +
                 ` 1. مكافحة الازعاج  ${s.antiSpam ? "▣" : "□"}\n` +
                 ` 2. مكافحة تغيير الاسم  ${s.antiName ? "▣" : "□"}\n` +
                 ` 3. مكافحة تغيير الصورة  ${s.antiImage ? "▣" : "□"}\n` +
                 ` 4. مكافحة تغيير الكنية  ${s.antiNickname ? "▣" : "□"}\n` +
                 ` 5. الاشعارات  ${s.notifications ? "▣" : "□"}\n` +
                 `◈ ━━━━━━━━━━━ ◈\n\n` +
                 `⌲ *الرد بالارقام المطلوبة*\n` +
                 `⌲ مثال: 1 3 5\n` +
                 `⌲ او بالاسطر: 1⇣3⇣5\n\n` +
                 `▰▰▰▰▰▰▰▰▰▰`;

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

    const choices = body.match(/\d+/g);
    if (!choices) return;

    let s = handleReply.settings;
    choices.forEach(num => {
        if (num == "1") s.antiSpam = !s.antiSpam;
        if (num == "2") s.antiName = !s.antiName;
        if (num == "3") s.antiImage = !s.antiImage;
        if (num == "4") s.antiNickname = !s.antiNickname;
        if (num == "5") s.notifications = !s.notifications;
    });

    return api.sendMessage("◈ ━━━━━━━ ◈\n🔔 *تأكيد التغييرات*\n◈ ━━━━━━━ ◈\n\n⟡ تفاعل بــ 👍 على هذه الرسالة\n⟡ لتثبيت الاعدادات الجديدة\n\n▰▰▰▰▰▰▰▰▰▰", threadID, (err, info) => {
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

    if (!isAdmin) {
        if (finalSettings.antiImage || finalSettings.antiNickname) {
            finalSettings.antiImage = false;
            finalSettings.antiNickname = false;
            warning = "\n\n⚠️ *تنبيه:* البوت ليس ادمن\nتم تعطيل حماية (الصورة/الكنية) تلقائياً";
        }
    }

    let data = (await Threads.getData(threadID)).data || {};
    data.antiSettings = finalSettings;
    
    data.snapshot = {
        name: threadInfo.threadName,
        imageSrc: threadInfo.imageSrc,
        nicknames: threadInfo.nicknames
    };

    await Threads.setData(threadID, { data });
    
    const confirmMsg = `◤━━━━━━━━◥\n` +
                      `   ✅ *تم الحفظ*\n` +
                      `◣━━━━━━━━◢\n\n` +
                      `⟡ تم تحديث الاعدادات بنجاح\n` +
                      `${warning}\n\n` +
                      `▰▰▰▰▰▰▰▰▰▰`;
    
    return api.sendMessage(confirmMsg, threadID);
};
