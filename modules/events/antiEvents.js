const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "antiEvents",
    eventType: ["log:thread-name", "log:thread-icon", "log:user-nickname", "log:unsubscribe"],
    version: "1.6.4",
    credits: "النسخة الأصلية",
    description: "نظام حماية"
};

module.exports.run = async function ({ event, api, Threads }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    
    const threadData = await Threads.getData(threadID);
    if (!threadData || !threadData.data || !threadData.data.antiSettings) return;

    const settings = threadData.data.antiSettings;
    const snapshot = threadData.data.snapshot || {};
    
    const shouldNotify = settings.notify;

    // 🛡️ [1] مـكافـحـة الـخـروج
    if (logMessageType === "log:unsubscribe") {
        const leftID = logMessageData.leftParticipantId;
        
        if (leftID == botID) return;

        if (settings.antiOut) {
            try {
                // إعادة العضو
                await api.addUserToGroup(leftID, threadID);
                
                // تم حذف جزء الطرد هنا والاكتفاء بإعادة العضو
                if (shouldNotify) {
                    api.sendMessage("مارق وين يعب (҂𓁹‿𓁹)⁦", threadID);
                }
                
            } catch (e) {
                // في حال فشل الإضافة
                if (shouldNotify) {
                    api.sendMessage("بي وشك 🦧📿", threadID);
                }
                console.error("خطأ في مكافحة الخروج:", e);
            }
        } else {
            // في حال عدم تفعيل الحماية
            if (shouldNotify) {
                api.sendMessage("كانت عبة 🦧📿", threadID);
            }
        }
        return;
    }

    if (author == botID) return;

    // 🖼️ [2] حـمـايـة الـصـورة
    if (logMessageType === "log:thread-icon" && settings.antiImage) {
        if (snapshot.imageSrc) {
            const cachePath = path.join(__dirname, "cache", `restore_${threadID}.png`);
            try {
                if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

                const response = await axios.get(snapshot.imageSrc, { responseType: "arraybuffer" });
                fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));
                
                api.changeGroupImage(fs.createReadStream(cachePath), threadID, (err) => {
                    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                    if (!err && shouldNotify) {
                        api.sendMessage("[Anti-Image] تـغيير الـصورة غير مسموح به، لذالك تمت اعادة الصورة لحالتها الاصلية.", threadID);
                    }
                });
            } catch (e) {}
        }
    }

    // 📝 [3] حـمـايـة الاسـم
    if (logMessageType === "log:thread-name" && settings.antiName) {
        if (logMessageData.name !== snapshot.name) {
            api.setTitle(snapshot.name, threadID, (err) => {
                if (!err && shouldNotify) {
                    api.sendMessage("[Anti-Name] تـغيير الاسم غير مسموح به، لذالك تمت اعادة الاسم لحالتها الاصلية.", threadID);
                }
            });
        }
    }

    // 👤 [4] حـمـايـة الـكـنـيـة
    if (logMessageType === "log:user-nickname" && settings.antiNickname) {
        const targetID = logMessageData.participant_id;
        const oldNick = (snapshot.nicknames && snapshot.nicknames[targetID]) ? snapshot.nicknames[targetID] : "";
        
        api.changeNickname(oldNick, threadID, targetID, (err) => {
            if (!err && shouldNotify) {
                api.sendMessage("[Anti-Nickname] تـغيير الكنية غير مسموح به، لذالك تمت اعادة الكنية لحالتها الاصلية.", threadID);
            }
        });
    }
};
