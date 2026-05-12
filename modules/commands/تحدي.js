const fs = require("fs-extra");
const path = require("path");

// مسار حفظ بيانات اللاعبين
const dataPath = path.join(__dirname, "cache", "players_xp.json");

module.exports.config = {
  name: "تحدي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Victor",
  description: "لعبة تحدي الأكواد والمنطق للمطورين",
  commandCategory: "ألعاب",
  usages: "",
  cooldowns: 5
};

// وظيفة لجلب بيانات اللاعب
function getPlayerData(uid) {
  if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {});
  let data = fs.readJsonSync(dataPath);
  if (!data[uid]) data[uid] = { xp: 0, level: 1 };
  return data[uid];
}

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, senderID, threadID, messageID } = event;
  let player = getPlayerData(senderID);

  if (body.toLowerCase() === handleReply.answer.toLowerCase()) {
    player.xp += 20;
    if (player.xp >= player.level * 100) {
      player.level++;
      api.sendMessage(`⎔ تـرفـيع مـسـتـوى! ⎔\n🎊 مـبروك لـقـد وصـلـت لـلـمـسـتـوى [ ${player.level} ]`, threadID);
    }
    
    // حفظ البيانات
    let allData = fs.readJsonSync(dataPath);
    allData[senderID] = player;
    fs.writeJsonSync(dataPath, allData);

    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(`✅ إجـابـة عـبـقـريـة يا ${handleReply.authorName}!\n⌬ ربـحـت: +20 XP\n⊞ رصـيدك: ${player.xp} XP`, threadID, messageID);
  } else {
    return api.sendMessage("❌ تـفـكـير خـاطئ.. حـاول مـجدداً أو تـجاهـل الـرسالة.", threadID, messageID);
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  
  const challenges = [
    { q: "ما هي الدالة المستخدمة لطباعة نص في الكونسول بـ JavaScript؟", a: "console.log" },
    { q: "رتب الكلمة البرمجية التالية: ( n u f c t i o n )", a: "function" },
    { q: "اختصار لغة توصيف النص الفائق هو؟", a: "html" },
    { q: "ما هو الرمز المستخدم للتعليقات في CSS؟", a: "/* */" },
    { q: "ما هي الإضافة التي تستخدمها في ترمكس لتشغيل ملفات الجافا سكريبت؟", a: "node" }
  ];

  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  const player = getPlayerData(senderID);
  const userInfo = await api.getUserInfo(senderID);
  const name = userInfo[senderID].name;

  let msg = `╭─── • ⎔ • ───╮\n   تـحـدي الـمـنـطـق\n╰─── • ⎔ • ───╯\n\n`;
  msg += `⌬ الـلاعـب: ${name}\n`;
  msg += `⊞ الـمـسـتـوى: ${player.level}\n`;
  msg += `─── ─── ───\n`;
  msg += `❓ الـسؤال: ${challenge.q}\n`;
  msg += `─── ─── ───\n`;
  msg += `💡 رد عـلى الـرسـالة بـالإجـابـة لـلـفوز بـ XP`;

  return api.sendMessage(msg, threadID, (err, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      answer: challenge.a,
      authorName: name,
      author: senderID
    });
  }, messageID);
};
