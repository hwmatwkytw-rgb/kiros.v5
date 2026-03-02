const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe"],
  version: "1.0.6",
  credits: "النسخة الأصلية",
  description: "إشعار انضمام"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const developerID = "61581906898524"; 

  if (logMessageType === "log:subscribe") {
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      if (author !== developerID) return;
      api.changeNickname(`[ / ] • ${global.config.BOTNAME || "BOT"}`, threadID, api.getCurrentUserID());
      
      const botMsg = `╭──〔  تم الاتصال 🔵 بنجاح 〕──
│
│ ↫اسم البوت   ⤹  KYROS ❘ BOT ⇊
│
│ ↫الاصدار     : 〘3.7.0〙
│
│ ↫عدد الاوامر:  〘126〙
│
│ ↫البادئة : 〘${global.config.PREFIX}〙
│
│ ↫⇨ المطور: ڪولو سـان 
│
│ ↫🤍 اللهم صل وسلم على نبينا محمد ﷺ
╰──────────────`;
      return api.sendMessage(botMsg, threadID);
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const nameArray = logMessageData.addedParticipants.map(i => i.fullName);
      const mentions = logMessageData.addedParticipants.map(i => ({ tag: i.fullName, id: i.userFbId }));
      const authorData = await Users.getData(author);
      const adderName = authorData?.name || "رابط الدعوة";
      
      const time = moment.tz("Africa/Khartoum").format("hh:mm A • DD/MM/YYYY");
      
      const msg = `◆━━━━━▣ ✿ ▣━━━━━━◆
❏ أهلاً بـك يا  | ${nameArray.join(", ")}
❏ في مجموعة | ${threadInfo.threadName}
❏ بواسطة     | ${adderName}
❏ الاعــضــــاء | ${threadInfo.participantIDs.length}
❏ الـوقــــت   | ${time}
❏ كُن عابراً لطيفاً.. إن لم تنفع فلا تضر 🍂🤍
◆━━━━━▣ ✿ ▣━━━━━━◆`;
      return api.sendMessage({ body: msg, mentions }, threadID);
    } catch (e) {}
  }
};
