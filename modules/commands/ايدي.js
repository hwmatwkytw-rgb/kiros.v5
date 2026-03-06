const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ايدي",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "عرض بيانات الحساب بنمط هندسي موحد",
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
    
    let gender = "غير محدد";
    if (user.gender == 2) gender = "ذكـر";
    else if (user.gender == 1) gender = "أنـثى";

    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatarPath = path.join(__dirname, "cache", `avatar_${targetID}.png`);

    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(avatarPath, Buffer.from(response.data, "binary"));

    let msg = `─── • ⌈ ⚝ ⌋ • ───\n`;
    msg += `⚝ الاسـم: ${user.name}\n`;
    msg += `⚝ الآيـدي: ${targetID}\n`;
    msg += `⚝ الـجـنس: ${gender}\n`;
    msg += `⚝ الـرابط: fb.com/${targetID}\n`;
    msg += `─── • ⌈ ⚝ ⌋ • ───\n`;
    msg += `[ ⚙︎ ڪايࢪوس ]`;

    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(avatarPath)
    }, threadID, () => {
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }, messageID);

  } catch (err) {
    return api.sendMessage("── • ⌈ ⚝ ⌋ • ──\nحدث خطأ في جلب البيانات\n── • ⌈ ⚝ ⌋ • ──", threadID, messageID);
  }
};
