const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ايدي",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "عرض معلومات الحساب مع الصورة الشخصية",
  commandCategory: "الخدمات",
  usages: "[بالرد أو بدون]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;

  let targetID = senderID;
  if (messageReply) targetID = messageReply.senderID;
  if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];

  try {
    const userInfo = await api.getUserInfo(targetID);
    const user = userInfo[targetID];
    
    // تحديد الجنس بناءً على بيانات الحساب
    let gender;
    if (user.gender === 2) gender = "ذكـر ♂️";
    else if (user.gender === 1) gender = "أنـثى ♀️";
    else gender = "مـخصص 🌈"; // يظهر في حال كان المستخدم مختار إعدادات جنس مخصصة

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarPath = path.join(__dirname, "cache", `avatar_${targetID}.png`);

    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(avatarPath, Buffer.from(response.data, "binary"));

    const caption = `╭── • ڪايࢪوس • ──╮\n` +
                    `  ⌈ مـعـلـومـات الـحـسـاب ⌋\n` +
                    `╰── •  ͡🦋͜   • ──╯\n\n` +
                    `👤 الاسـم: ${user.name}\n` +
                    `🆔 الآيـدي: ${targetID}\n` +
                    `🧬 الـجـنـس: ${gender}\n` +
                    `🔗 الـرابط: facebook.com/${user.vanity || targetID}\n\n` +
                    `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;

    return api.sendMessage({
      body: caption,
      attachment: fs.createReadStream(avatarPath)
    }, threadID, () => {
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }, messageID);

  } catch (err) {
    return api.sendMessage("❌ تعذر جلب معلومات الحساب حالياً.", threadID, messageID);
  }
};
