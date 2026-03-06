const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const dataPath = __dirname + "/cache/antilink.json";

module.exports.config = {
  name: "antilink",
  version: "2.6",
  hasPermssion: 1, // الأدمن فقط من يستطيع تفعيل/إيقاف الأمر
  credits: "ᎠᎯᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "منع الروابط مع استثناء المطور والأدمن وتفاعل خاص",
  commandCategory: "الحماية",
  usages: "on/off",
  cooldowns: 3,
};

module.exports.run = async function({ api, event, args }) {
  if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {});
  const data = fs.readJsonSync(dataPath);
  const { threadID } = event;

  // التحقق من أن المستخدم أدمن ليستخدم الأمر
  const threadInfo = await api.getThreadInfo(threadID);
  const admins = threadInfo.adminIDs.map(a => a.id);
  if (!admins.includes(event.senderID) && event.senderID !== "61581906898524") {
    return api.sendMessage("هذا الأمر للأدمن فقط يا عب (⌣̀_𓁹)", threadID);
  }

  if (args[0] == "on") {
    data[threadID] = true;
    fs.writeJsonSync(dataPath, data);
    return api.sendMessage("كدا اشيف واحد يلز رابط ʕᵕ᷄-ᵕ᷅ʔ", threadID);
  } 
  if (args[0] == "off") {
    data[threadID] = false;
    fs.writeJsonSync(dataPath, data);
    return api.sendMessage("✅ تم إيقاف نظام مكافحة الروابط.", threadID);
  }
  return api.sendMessage("استخدم: antilink on أو off", threadID);
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, senderID, body, messageID } = event;
  if (!body) return;

  if (!fs.existsSync(dataPath)) return;
  const data = fs.readJsonSync(dataPath);
  if (!data[threadID]) return;

  const linkRegex = /(https?:\/\/|www\.|facebook\.com|me\.me|t\.me|bit\.ly)/i;

  if (linkRegex.test(body)) {
    const developerID = "61581906898524";
    const botID = api.getCurrentUserID();
    const threadInfo = await api.getThreadInfo(threadID);
    const admins = threadInfo.adminIDs.map(a => a.id);

    // 1. إذا كان المطور هو من أرسل الرابط
    if (senderID == developerID) {
      return api.sendMessage("👑\nʕᵕ᷄-ᵕ᷅ʔ", threadID, messageID);
    }

    // 2. استثناء الأدمن والبوت من الحذف والطرد
    if (admins.includes(senderID) || senderID == botID) return;

    // 3. التفاعل مع الرابط بـ ❌ للغرباء
    api.setMessageReaction("❌", messageID, () => {}, true);

    // 4. التحقق من صلاحية البوت (أدمن؟)
    const isBotAdmin = admins.includes(botID);
    if (!isBotAdmin) return;

    // 5. حذف الرسالة
    try {
      api.unsendMessage(messageID);
    } catch (e) {}

    // 6. تنفيذ الطرد مع الصورة والرسالة
    setTimeout(async () => {
      try {
        const imageUrl = "https://i.ibb.co/bg9N9sqb/received-1070178788428323-jpeg.jpg";
        const imagePath = path.join(__dirname, "cache", `kick_${senderID}.jpg`);
        
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

        api.removeUserFromGroup(senderID, threadID, (err) => {
          if (!err) {
            api.sendMessage({
              body: "برا احش الضاف جدك 🦧📿",
              attachment: fs.createReadStream(imagePath)
            }, threadID, () => {
              if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            });
          }
        });
      } catch (err) {
        console.error("خطأ في نظام الانتي لينك:", err);
      }
    }, 1500);
  }
};
