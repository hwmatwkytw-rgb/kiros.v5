const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "كهف",
    version: "1.0.5",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "العمل في الكهوف للحصول على المال بتنسيق هندسي",
    commandCategory: "الاموال",
    cooldowns: 20, // تم ضبط التبريد ليكون منطقياً (20 ثانية)
    envConfig: {
        cooldownTime: 20000 
    }
};

module.exports.onLoad = async () => {
    const dirMaterial = __dirname + `/cache/`;
    const pathImg = dirMaterial + "cave.jpg";
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(pathImg)) {
        const res = await axios.get("https://i.postimg.cc/N0D5CTrg/Picsart-22-07-11-15-11-59-573.png", { responseType: "arraybuffer" });
        fs.writeFileSync(pathImg, Buffer.from(res.data, "utf-8"));
    }
};

module.exports.handleReply = async ({ event: e, api, handleReply, Currencies }) => {
    const { threadID, messageID, senderID, body } = e;
    if (handleReply.author != senderID) return api.sendMessage("╮── ⎔\n│ اكعد راحة هذا مو شغلك! ✋\n╯────────────⊞", threadID, messageID);

    let data = (await Currencies.getData(senderID)).data || {};
    const moneyList = [
        Math.floor(Math.random() * 5000) + 900,
        Math.floor(Math.random() * 5000) + 800,
        Math.floor(Math.random() * 5000) + 700,
        Math.floor(Math.random() * 5000) + 600,
        Math.floor(Math.random() * 5000) + 500,
        Math.floor(Math.random() * 5000) + 400
    ];

    const countries = ["فيتنام", "الصين", "اليابان", "تايلاند", "الولايات المتحدة", "كمبوديا"];
    const choose = parseInt(body);

    if (isNaN(choose) || choose < 1 || choose > 6) 
        return api.sendMessage("╮── ⎔\n│ الرجاء اختيار رقم بين 1 و 6 فقط!\n╯────────────⊞", threadID, messageID);

    api.unsendMessage(handleReply.messageID);
    const reward = moneyList[choose - 1];
    const country = countries[choose - 1];

    const msg = `╮────────── ⎔ ──────────╭\n` +
                `         CAVE WORK ⛏️\n` +
                `╯────────── ⎔ ──────────╰\n\n` +
                `› اشتغلت في كهوف دولة: ${country}\n` +
                `› وحصلت على مبلغ: ${reward}$\n\n` +
                `╮────────── ⊞ ──────────╭\n` +
                `│ تم إضافة المال إلى حسابك بنجاح ✅\n` +
                `╯────────── ⊞ ──────────╰`;

    return api.sendMessage(msg, threadID, async () => {
        await Currencies.increaseMoney(senderID, parseInt(reward));
        data.work2Time = Date.now();
        await Currencies.setData(senderID, { data });
    }, messageID);
};

module.exports.run = async ({ event: e, api, Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldownTime = 1800000; // مثال: نصف ساعة تبريد (30 دقيقة)
    let data = (await Currencies.getData(senderID)).data || {};

    if (typeof data.work2Time !== "undefined" && cooldownTime - (Date.now() - data.work2Time) > 0) {
        const time = cooldownTime - (Date.now() - data.work2Time);
        const minutes = Math.floor(time / 60000);
        const seconds = ((time % 60000) / 1000).toFixed(0);
        return api.sendMessage(`╮── ⎔\n│ ارتاح شوية يا وحش! 💤\n│ ارجع ورا: ${minutes} دقيقة و ${seconds} ثانية.\n╯────────────⊞`, threadID, messageID);
    }

    const msg = {
        body: `╮────────── ⎔ ──────────╭\n` +
              `         CAVE LIST ⛰️\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `1 ≻ فيتنام 🇻🇳\n` +
              `2 ≻ الصين 🇨🇳\n` +
              `3 ≻ اليابان 🇯🇵\n` +
              `4 ≻ تايلاند 🇹🇭\n` +
              `5 ≻ الولايات المتحدة 🇺🇸\n` +
              `6 ≻ كمبوديا 🇰🇭\n\n` +
              `📌 رد على الرسالة برقم الدولة للعمل!\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `│ بـواسطـة: ڪايࢪوس\n` +
              `╯────────── ⊞ ──────────╰`,
        attachment: fs.createReadStream(__dirname + `/cache/cave.jpg`)
    };

    return api.sendMessage(msg, threadID, (error, info) => {
        global.client.handleReply.push({
            type: "choosee",
            name: this.config.name,
            author: senderID,
            messageID: info.messageID
        });
    }, messageID);
};
