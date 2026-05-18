const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "نقيب",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "التنقيب عن الآثار والكنوز القديمة لربح المال",
    commandCategory: "الاموال",
    cooldowns: 20,
    envConfig: {
        cooldownTime: 20000 
    }
};

module.exports.onLoad = async () => {
    const dirMaterial = __dirname + `/cache/`;
    const pathImg = dirMaterial + "dig.jpg";
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(pathImg)) {
        try {
            // رابط مباشر حقيقي لصورة آثار وتنقيب قديمة بجودة عالية
            const res = await axios.get("https://images.unsplash.com/photo-1599733589046-10c005739ef9?w=500", { responseType: "arraybuffer" });
            fs.writeFileSync(pathImg, Buffer.from(res.data, "utf-8"));
        } catch (error) {
            console.error("فشل تحميل صورة أمر التنقيب: " + error.message);
        }
    }
};

module.exports.handleReply = async ({ event: e, api, handleReply, Currencies }) => {
    const { threadID, messageID, senderID, body } = e;
    
    if (handleReply.author != senderID) {
        return api.sendMessage("خطأ: هذا الأمر ليس لك! يرجى استخدام الأمر بنفسك.", threadID, messageID);
    }

    let data = (await Currencies.getData(senderID)).data || {};
    const moneyList = [
        Math.floor(Math.random() * 8000) + 1500,
        Math.floor(Math.random() * 9000) + 2000,
        Math.floor(Math.random() * 7500) + 1000
    ];

    const items = ["قناع فرعوني ذهبي 👑", "سيف ساموراي أثري ⚔️", "مخطوطة بابلية قديمة 📜"];
    const choose = parseInt(body);

    if (isNaN(choose) || choose < 1 || choose > 3) {
        return api.sendMessage("خطأ: اختيار غير صحيح! الرجاء إدخال رقم من 1 إلى 3 فقط.", threadID, messageID);
    }

    try {
        await api.unsendMessage(handleReply.messageID);
    } catch (err) {
        console.log("فشل حذف رسالة الرد: " + err.message);
    }

    const reward = moneyList[choose - 1];
    const item = items[choose - 1];

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `        DIGGING RESULTS 🏺\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› وجدت أثناء التنقيب: ${item}\n` +
                `› وبعته للمتحف بمبلغ: ${reward}$\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ تم إضافة المال إلى حسابك بنجاح ✅\n` +
                `╯────────── ⊞ ──────────╰`;

    return api.sendMessage(msg, threadID, async () => {
        await Currencies.increaseMoney(senderID, parseInt(reward));
        data.digTime = Date.now();
        await Currencies.setData(senderID, { data });
    }, messageID);
};

module.exports.run = async ({ event: e, api, Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldownTime = 3600000; // ساعة كاملة
    let data = (await Currencies.getData(senderID)).data || {};

    if (typeof data.digTime !== "undefined" && cooldownTime - (Date.now() - data.digTime) > 0) {
        const time = cooldownTime - (Date.now() - data.digTime);
        const minutes = Math.floor(time / 60000);
        const seconds = ((time % 60000) / 1000).toFixed(0);
        return api.sendMessage(`تنبيه: أدوات التنقيب مكسورة ومستهلكة! يرجى الانتظار ${minutes} دقيقة و ${seconds} ثانية حتى تجهز المعدات.`, threadID, messageID);
    }

    const pathImg = __dirname + `/cache/dig.jpg`;
    const msg = {
        body: `╮────────── ⎔ ──────────╭\n` +
              `         DIGGING LIST 🧭\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `1 ≻ الأهرامات (مصر) 🇪🇬\n` +
              `2 ≻ معابد كيوتو (اليابان) 🇯🇵\n` +
              `3 ≻ بابل الأثرية (العراق) 🇮🇶\n\n` +
              `📌 رد على الرسالة برقم موقع الحفر!\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `│ بـواسطـة: ڪايࢪوس\n` +
              `╯────────── ⊞ ──────────╰`
    };

    if (fs.existsSync(pathImg)) {
        msg.attachment = fs.createReadStream(pathImg);
    }

    return api.sendMessage(msg, threadID, (error, info) => {
        if (error) return console.error("خطأ أثناء تشغيل أمر التنقيب: " + error.message);
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: senderID,
            messageID: info.messageID
        });
    }, messageID);
};
