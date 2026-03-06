const fs = require("fs-extra");
const path = require("path");

const pathData = path.join(__dirname, "cache", "points.json");

module.exports.config = {
  name: "تفاعل",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "نظام نقاط وتفاعل متكامل (10 نقاط لكل رسالة)",
  commandCategory: "المجموعة",
  usages: "تفاعل",
  cooldowns: 5
};

// وظيفة تسجيل النقاط مع كل رسالة
module.exports.handleEvent = async function ({ event }) {
  const { threadID, senderID } = event;
  if (!fs.existsSync(pathData)) fs.writeJsonSync(pathData, {});
  
  let data = fs.readJsonSync(pathData);
  if (!data[threadID]) data[threadID] = {};
  if (!data[threadID][senderID]) data[threadID][senderID] = { points: 0, level: 1 };

  // إضافة 10 نقاط لكل رسالة
  data[threadID][senderID].points += 10;

  // نظام مستويات بسيط (كل 500 نقطة يرتفع مستوى)
  data[threadID][senderID].level = Math.floor(data[threadID][senderID].points / 500) + 1;

  fs.writeJsonSync(pathData, data);
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID } = event;

  try {
    if (!fs.existsSync(pathData)) return api.sendMessage("⚠️ لا توجد بيانات تفاعل بعد، ابدأوا بالدردشة!", threadID, messageID);
    
    const data = fs.readJsonSync(pathData);
    if (!data[threadID]) return api.sendMessage("⚠️ لا يوجد تفاعل مسجل في هذه المجموعة.", threadID, messageID);

    let threadData = data[threadID];
    let topMembers = [];

    for (const id in threadData) {
      const name = await Users.getNameUser(id);
      topMembers.push({
        name: name,
        points: threadData[id].points,
        level: threadData[id].level
      });
    }

    // ترتيب الأعضاء حسب النقاط
    topMembers.sort((a, b) => b.points - a.points);
    const top5 = topMembers.slice(0, 5);

    const medals = ["🥇", "🥈", "🥉", "🏅", "🎖"];
    let msg = "╭── • ڪايࢪوس • ──╮\n  ⌈ لـوحـة الـتـفـاعـل ⌋\n╰── •  ͡🦋͜   • ──╯\n\n";

    top5.forEach((u, i) => {
      msg += `${medals[i]} ${u.name}\n`;
      msg += `📊 نـقـاط: ${u.points} | 📈 مـسـتـوى: ${u.level}\n\n`;
    });

    msg += `『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`;
    
    api.sendMessage(msg, threadID, messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ حصل خطأ أثناء معالجة البيانات.", threadID, messageID);
  }
};
