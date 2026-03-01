const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "antiEvents",
    eventType: ["log:thread-name", "log:thread-icon", "log:user-nickname", "log:unsubscribe"],
    version: "1.5.0",
    credits: "Gemini AI",
    description: "نظام حماية تلقائي متكامل"
};

module.exports.run = async function ({ event, api, Threads }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    const botID = api.getCurrentUserID();
    
    const thread = await Threads.getData(threadID);
    if (!thread || !thread.data || !thread.data.antiSettings) return;

    const settings = thread.data.antiSettings;
    const snapshot = thread.data.snapshot || {};

    // 🛡️ [1] مـكافـحـة الـخـروج
    if (logMessageType === "log:unsubscribe") {
        const leftID = logMessageData.leftParticipantId;
        if (leftID == botID) return;

        if (settings.antiOut) {
            try {
                await api.addUserToGroup(leftID, threadID);
                setTimeout(() => {
                    api.removeUserFromGroup(leftID, threadID);
                    api.sendMessage("مارق وين يعب (҂𓁹‿𓁹)⁦", threadID);
                }, 1500);
            } catch (e) {
                api.sendMessage("بي وشك •-•", threadID);
            }
        } else {
            api.sendMessage("كانت جارية (҂𓁹‿𓁹)⁦", threadID);
        }
        return;
    }

    // تجاهل التغييرات التي يقوم بها البوت نفسه
    if (author == botID) return;

    // 🖼️ [2] حـمـايـة الـصـورة (تركيز عالي على الاستعادة)
    if (logMessageType === "log:thread-icon" && settings.antiImage) {
        if (snapshot.imageSrc) {
            const cachePath = path.join(__dirname, "cache", `restore_${threadID}.png`);
            try {
                // التأكد من وجود مجلد الكاش
                if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

                const response = await axios.get(snapshot.imageSrc, { responseType: "arraybuffer" });
                fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));
                
                api.changeGroupImage(fs.createReadStream(cachePath), threadID, (err) => {
                    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
                    if (!err) api.sendMessage("[Anti-Image] تـم صـد تـغيير الـصورة واسـتعادتها.", threadID);
                });
            } catch (e) {
                console.error("خطأ في استعادة الصورة:", e);
            }
        }
    }

    // 📝 [3] حـمـايـة الاسـم
    if (logMessageType === "log:thread-name" && settings.antiName) {
        if (logMessageData.name !== snapshot.name) {
            api.setTitle(snapshot.name, threadID, () => {
                api.sendMessage("[Anti-Name] مـمنوع تـغيير اسـم الـمجموعة.", threadID);
            });
        }
    }

    // 👤 [4] حـمـايـة الـكـنـيـة
    if (logMessageType === "log:user-nickname" && settings.antiNickname) {
        const targetID = logMessageData.participant_id;
        const oldNick = (snapshot.nicknames && snapshot.nicknames[targetID]) ? snapshot.nicknames[targetID] : "";
        
        api.changeNickname(oldNick, threadID, targetID, () => {
            api.sendMessage("[Anti-Nickname] تـم إلـغاء تـغيير الـكنية.", threadID);
        });
    }
};
