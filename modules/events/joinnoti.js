const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "1.1.2",
  credits: "DANTE SPARDA",
  description: "إشعار انضمام ومغادرة باستايل هندسي رقمي",
  dependencies: {
    "fs-extra": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const developerID = "61581906898524"; 

  if (logMessageType === "log:subscribe") {
    // إشعار انضمام البوت للمجموعة
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      if (author !== developerID) return;
      
      const botName = global.config.BOTNAME || "KYROS BOT";
      const totalCommands = global.client.commands.size;
      const prefix = global.config.PREFIX;
      
      api.changeNickname(`[ ${prefix} ] • ${botName}`, threadID, api.getCurrentUserID());
      
      const botMsg = `╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭
     CONNECTION ESTABLISHED
╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰
  ⋄ الاسـم : ${botName}
  ⋄ الإصـدار : 3.7.0
  ⋄ الأوامـر : ${totalCommands}
  ⋄ الـبادئـة : [ ${prefix} ]
╮───────────────────╭
  " اللهم صلِ وسلم على نبينا محمد "
╯───────────────────╰`;
      
      return api.sendMessage(botMsg, threadID);
    }

    // إشعار انضمام الأعضاء الجدد
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const nameArray = logMessageData.addedParticipants.map(i => i.fullName);
      const mentions = logMessageData.addedParticipants.map(i => ({ tag: i.fullName, id: i.userFbId }));
      const authorData = await Users.getData(author);
      const adderName = authorData?.name || "رابط الدعوة";
      
      const time = moment.tz("Africa/Khartoum").format("hh:mm A • DD/MM/YYYY");
      
      const msg = `╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭
      WELCOME TO OUR WORLD
╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰
  ◈ الـعـضـو : ${nameArray.join(", ")}
  ◈ الـقـروب : ${threadInfo.threadName}
  ◈ الـمُـضـيف : ${adderName}
  ◈ الـعـدد   : ${threadInfo.participantIDs.length}
  ◈ الـتـوقـيت : ${time}
╮───────────────────╭
  " كُن عابراً لطيفاً.. تترك أثراً جميلاً "
╯───────────────────╰`;
      return api.sendMessage({ body: msg, mentions }, threadID);
    } catch (e) {}
  }

  // نظام الحماية وإشعار المغادرة
  if (logMessageType === "log:unsubscribe") {
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID == api.getCurrentUserID()) return;

    if (author != leftID) {
        return api.sendMessage("العب بلع بانكاي في جلحاتو 🐸", threadID);
    }

    // محاولة إعادة الإضافة التلقائية
    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage("احشك واحش البضيفك زاتو 🦧📿", threadID);
      } else {
        return api.sendMessage("لديك كرامة جميلة 🐸✨", threadID);
      }
    });
  }
};
