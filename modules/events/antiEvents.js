module.exports.config = {
    name: "antiEvents",
    eventType: ["log:thread-name", "log:thread-icon", "log:user-nickname", "log:thread-call", "message"],
    version: "2.0.0",
    credits: "Gemini AI",
    description: "نظام استعادة البيانات التلقائي ومكافحة الازعاج"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const { threadID, logMessageType, logMessageData, author, body, messageID, senderID } = event;
    const botID = api.getCurrentUserID();
    if (author == botID || senderID == botID) return;

    const thread = await Threads.getData(threadID);
    if (!thread || !thread.data.antiSettings) return;

    const settings = thread.data.antiSettings;
    const snapshot = thread.data.snapshot || {};
    const sendNotification = settings.notifications === true;

    // ========== نظام مكافحة الازعاج ==========
    if (settings.antiSpam && event.type === "message" && senderID !== botID) {
        const userData = await Users.getData(senderID) || {};
        
        if (!thread.data.spamTracking) thread.data.spamTracking = {};
        if (!thread.data.spamTracking[senderID]) {
            thread.data.spamTracking[senderID] = {
                count: 0,
                lastReset: Date.now(),
                lastMessage: "",
                duplicateCount: 0,
                warnings: 0
            };
        }

        const now = Date.now();
        const userTrack = thread.data.spamTracking[senderID];
        
        if (now - userTrack.lastReset > 5000) {
            userTrack.count = 0;
            userTrack.lastReset = now;
            userTrack.duplicateCount = 0;
        }

        userTrack.count++;
        
        if (body === userTrack.lastMessage) {
            userTrack.duplicateCount++;
        } else {
            userTrack.duplicateCount = 0;
        }
        userTrack.lastMessage = body;

        const isSpam = userTrack.count > 5 || userTrack.duplicateCount > 3;
        
        if (isSpam) {
            userTrack.warnings++;
            
            api.deleteMessage(messageID, (err) => {});

            if (userTrack.warnings === 1) {
                if (sendNotification) api.sendMessage(senderID + "\n[ANTI SPAM] توقف عن الازعاج! (تحذير 1/3)", threadID);
            } else if (userTrack.warnings === 2) {
                if (sendNotification) api.sendMessage(senderID + "\n[ANTI SPAM] تحذير اخير قبل الطرد (2/3)", threadID);
            } else if (userTrack.warnings >= 3) {
                api.removeUserFromGroup(senderID, threadID, (err) => {
                    if (!err) {
                        if (sendNotification) api.sendMessage(senderID + "\n[ANTI SPAM] تم طرد العضو بسبب الازعاج المستمر", threadID);
                        delete thread.data.spamTracking[senderID];
                    }
                });
            }
            
            await Threads.setData(threadID, { data: thread.data });
            return;
        }
        
        await Threads.setData(threadID, { data: thread.data });
    }

    // ========== حماية الصورة ==========
    if (logMessageType === "log:thread-icon" && settings.antiImage) {
        if (!snapshot || !snapshot.imageSrc) {
            return;
        }

        try {
            const axios = require("axios");
            const fs = require("fs-extra");
            const path = __dirname + `/cache/recovery_img_${threadID}_${Date.now()}.jpg`;
            
            const response = await axios({
                method: 'get',
                url: snapshot.imageSrc,
                responseType: 'stream',
                timeout: 10000
            });

            const writer = fs.createWriteStream(path);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            if (fs.existsSync(path) && fs.statSync(path).size > 0) {
                api.changeGroupImage(fs.createReadStream(path), threadID, (err) => {
                    if (!err) {
                        if (sendNotification) api.sendMessage("[ANTI OUT] التغيير غير مسموح به لذالك تمت اعادة الصورة لحالتها الاصلية", threadID);
                    }
                    
                    if (fs.existsSync(path)) {
                        fs.unlinkSync(path);
                    }
                });
            }
            
        } catch (e) {}
    }

    // ========== حماية الاسم ==========
    if (logMessageType === "log:thread-name" && settings.antiName) {
        if (snapshot && snapshot.name && logMessageData.name !== snapshot.name) {
            api.setTitle(snapshot.name, threadID, (err) => {
                if (!err) {
                    if (sendNotification) api.sendMessage("[ANTI OUT] التغيير غير مسموح به لذالك تمت اعادة الاسم لحالتها الاصلية", threadID);
                }
            });
        }
    }

    // ========== حماية الكنية ==========
    if (logMessageType === "log:user-nickname" && settings.antiNickname) {
        const targetID = logMessageData.participant_id;
        if (snapshot && snapshot.nicknames && snapshot.nicknames[targetID] !== undefined) {
            const oldNick = snapshot.nicknames[targetID] || "";
            api.changeNickname(oldNick, threadID, targetID, (err) => {
                if (!err) {
                    if (sendNotification) api.sendMessage("[ANTI OUT] التغيير غير مسموح به لذالك تمت اعادة الكنية لحالتها الاصلية", threadID);
                }
            });
        }
    }

    await Threads.setData(threadID, { data: thread.data });
};
