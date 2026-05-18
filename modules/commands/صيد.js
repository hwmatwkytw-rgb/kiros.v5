const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "صيد",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "الذهاب في رحلة صيد للحصول على المال",
    commandCategory: "الاموال",
    cooldowns: 20,
    envConfig: {
        cooldownTime: 20000 
    }
};

module.exports.onLoad = async () => {
    const dirMaterial = __dirname + `/cache/`;
    const pathImg = dirMaterial + "fishing.jpg";
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(pathImg)) {
        try {
            // رابط مباشر حقيقي لصورة صيد أسماك بجودة ممتازة
            const res = await axios.get("https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=500", { responseType: "arraybuffer" });
            fs.writeFileSync(pathImg, Buffer.from(res.data, "utf-8"));
        } catch (error) {
            console.error("فشل تحميل صورة أمر الصيد: " + error.message);
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
        Math.floor(Math.random() * 6000) + 1000,
        Math.floor(Math.random() * 5500) + 900,
        Math.floor(Math.random() * 7000) + 1200,
        Math.floor(Math.random() * 5000) + 800
    ];

    const locations = ["البحر الأحمر 🌊", "المحيط الأطلسي 🦈", "بحر اليابان 🐋", "الخليج العربي 🐬"];
    const choose = parseInt(body);

    if (isNaN(choose) || choose < 1 || choose > 4) {
        return api.sendMessage("خطأ: اختيار غير صحيح! الرجاء إدخال رقم من 1 إلى 4 فقط.", threadID, messageID);
    }

    // إخفاء رسالة الاختيار لعدم تشويه الشات
    try {
        await api.unsendMessage(handleReply.messageID);
    } catch (err) {
        console.log("فشل حذف رسالة الرد: " + err.message);
    }

    const reward = moneyList[choose - 1];
    const location = locations[choose - 1];

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `         FISHING TRIP 🎣\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› عدت من الصيد في: ${location}\n` +
                `› وبعت صيدك بمبلغ: ${reward}$\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ تم إضافة المال إلى حسابك بنجاح ✅\n` +
                `╯────────── ⊞ ──────────╰`;

    return api.sendMessage(msg, threadID, async () => {
        await Currencies.increaseMoney(senderID, parseInt(reward));
        data.fishTime = Date.now();
        await Currencies.setData(senderID, { data });
    }, messageID);
};

module.exports.run = async ({ event: e, api, Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldownTime = 1200000; // 20 دقيقة
    let data = (await Currencies.getData(senderID)).data || {};

    if (typeof data.fishTime !== "undefined" && cooldownTime - (Date.now() - data.fishTime) > 0) {
        const time = cooldownTime - (Date.now() - data.fishTime);
        const minutes = Math.floor(time / 60000);
        const seconds = ((time % 60000) / 1000).toFixed(0);
        return api.sendMessage(`تنبيه: الأسماك هربت منك! يرجى الانتظار ${minutes} دقيقة و ${seconds} ثانية قبل المحاولة مجدداً.`, threadID, messageID);
    }

    const pathImg = __dirname + `/cache/fishing.jpg`;
    const msg = {
        body: `╮────────── ⎔ ──────────╭\n` +
              `         FISHING LIST 🌊\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `1 ≻ البحر الأحمر 🇸🇦\n` +
              `2 ≻ المحيط الأطلسي 🇺🇸\n` +
              `3 ≻ بحر اليابان 🇯🇵\n` +
              `4 ≻ الخليج العربي 🇰و\n\n` +
              `📌 رد على الرسالة برقم المكان للإبحار!\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `│ بـواسطـة: ڪايࢪوس\n` +
              `╯────────── ⊞ ──────────╰`
    };

    // التحقق من وجود الصورة وإرسالها، أو إرسال النص فقط إذا حدث خطأ
    if (fs.existsSync(pathImg)) {
        msg.attachment = fs.createReadStream(pathImg);
    }

    return api.sendMessage(msg, threadID, (error, info) => {
        if (error) return console.error("خطأ أثناء تشغيل أمر الصيد: " + error.message);
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: senderID,
            messageID: info.messageID
        });
    }, messageID);
};
