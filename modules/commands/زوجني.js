const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "زوجني",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "اختيار شريك عشوائي من المجموعة",
  commandCategory: "ترفيه",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users, Currencies }) {
    const { threadID, messageID, senderID, participantIDs } = event;
    const cachePath1 = __dirname + "/cache/p1.png";
    const cachePath2 = __dirname + "/cache/p2.png";

    try {
        // التحقق من الرصيد (المهر)
        let data = await Currencies.getData(senderID);
        let money = data.money;
        const mahar = 2000; // المهر المطلوب

        if (money < mahar) {
            return api.sendMessage(`يا زول إنت فلسان عديل كدة.. امشي أشتغل جيب الـ ${mahar} مهر وتعال لينا 🐸🍷`, threadID, messageID);
        }

        // اختيار شخص عشوائي غير المرسل
        let list = participantIDs.filter(id => id !== senderID);
        if (list.length === 0) return api.sendMessage("المجموعة دي فاضية كدة مالها؟ ما لقيت ليك زول!", threadID, messageID);
        
        let targetID = list[Math.floor(Math.random() * list.length)];

        // جلب البيانات
        let senderInfo = await Users.getData(senderID);
        let targetInfo = await Users.getData(targetID);
        
        let senderName = senderInfo.name;
        let targetName = targetInfo.name;
        let lovePercent = Math.floor(Math.random() * 101);

        // جلب الصور (بدون توكن لتقليل الأخطاء)
        let getP1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(cachePath1, Buffer.from(getP1, "utf-8"));

        let getP2 = (await axios.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(cachePath2, Buffer.from(getP2, "utf-8"));

        // خصم المبلغ (رسوم المأذون)
        await Currencies.setData(senderID, { money: money - 700 });

        let msg = {
            body: `┌──── • [ 💍 زواج عشوائي ] • ────┐\n\nأبشروا بالخير يا جماعة.. عندنا عرسان هنا 😌🍷\n\n─ ${senderName} 💓 ${targetName}\n─ نسبة الريد: ${lovePercent}%\n\nمبروك عليكم، وبيت مال وعيال يا فراد! 🕺✨\n\n└───────────────────────────┘`,
            mentions: [
                { tag: senderName, id: senderID },
                { tag: targetName, id: targetID }
            ],
            attachment: [
                fs.createReadStream(cachePath1),
                fs.createReadStream(cachePath2)
            ]
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(cachePath1)) fs.unlinkSync(cachePath1);
            if (fs.existsSync(cachePath2)) fs.unlinkSync(cachePath2);
        }, messageID);

    } catch (e) {
        console.log(e);
        return api.sendMessage("حصلت مشكلة في المأذون، جرب شوية كدة!", threadID, messageID);
    }
};
