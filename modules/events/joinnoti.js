module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "1.0.6",
  credits: "Mirai Team | تعديل: ᎠᎯᏁᎢᎬ  ᏚᎮᎯᏒᎠᎯ",
  description: "إشعار انضمام ومغادرة - حماية المطور والرد على الطرد والهروب",
  dependencies: {
    "fs-extra": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const developerID = "61581906898524"; 

  // ====== 🟦 انضمام (البوت أو الأعضاء) ======
  if (logMessageType === "log:subscribe") {
    // حالة انضمام البوت نفسه
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      if (author !== developerID) return;
      api.changeNickname(`[ / ] • ${global.config.BOTNAME || "KYROS BOT"}`, threadID, api.getCurrentUserID());
      
      const botMsg = `╭──〔  تم الاتصال 🔵 بنجاح 〕──
│
│ ↫اسم البوت   ⤹  𝑲𝒀𝑹𝑶𝑺 ❘  𝑩𝑶𝑻 ⇊
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

    // حالة ترحيب الأعضاء الجدد
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const nameArray = logMessageData.addedParticipants.map(i => i.fullName);
      const mentions = logMessageData.addedParticipants.map(i => ({ tag: i.fullName, id: i.userFbId }));
      const authorData = await Users.getData(author);
      const adderName = authorData?.name || "رابط الدعوة";
      
      // صيغة الوقت 12 ساعة
      const time = require("moment-timezone").tz("Africa/Khartoum").format("hh:mm A • DD/MM/YYYY");
      
      const msg = `◆━━━━━▣ ✿ ▣━━━━━━◆
❏ أهلاً بـك يا  | ${nameArray.join(", ")}
❏ في مجموعة | ${threadInfo.threadName}
❏ بواسطة     | ${adderName}
❏ الاعــضــــاء | ${threadInfo.participantIDs.length}
❏ الـوقــــت   | ${time}
❏ كُن عابراً لطيفاً.. إن لم تنفع فلا تضر 🍂🤍
◆━━━━━▣ ✿ ▣━━━━━━◆`;
      return api.sendMessage({ body: msg, mentions }, threadID);
    } catch (e) { console.log(e); }
  }

  // ====== 🟥 مغادرة (هروب أم طرد؟) ======
  if (logMessageType === "log:unsubscribe") {
    const leftID = logMessageData.leftParticipantFbId;
    
    if (leftID == api.getCurrentUserID()) return;

    if (author != leftID) {
        return api.sendMessage("العب بلع بانكاي في جلحاتو 🐸", threadID);
    }

    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage("احش كرامتك زاتو •-•", threadID);
      } else {
        return api.sendMessage("مارق وين يحب 🐸؟", threadID);
      }
    });
  }
};
