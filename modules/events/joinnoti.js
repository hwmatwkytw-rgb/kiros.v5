const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "1.5.0",
  credits: "DANTE SPARDA",
  description: "تحديث نهائي للاستايلات ونظام الحماية",
  dependencies: {
    "fs-extra": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const developerID = "61581906898524"; 

  if (logMessageType === "log:subscribe") {
    // 1. إشعار انضمام البوت للمجموعة
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      if (author !== developerID) return;
      
      const botName = global.config.BOTNAME || "KYROS BOT";
      const totalCommands = global.client.commands.size;
      const prefix = global.config.PREFIX;
      
      api.changeNickname(`[ ${prefix} ] • ${botName}`, threadID, api.getCurrentUserID());
      
      const botMsg = `╭─── • ◈ • ───╮
   sʏsᴛᴇᴍ ʟᴏᴀᴅᴇᴅ
╰─── • ◈ • ───╯
 ◦ الـنـظـام ⌁ ${botName}
 ◦ الإصـدار ⌁ 3.7.0
 ◦ الأوامـر ⌁ ${totalCommands}
 ◦ الـبـادئـة ⌁ [ ${prefix} ]
 ◦ الـحـالـة ⌁ Active
  ──────────
 " اللهم صلِ وسلم على نبينا محمد "`;
      
      return api.sendMessage(botMsg, threadID);
    }

    // 2. إشعار انضمام الأعضاء الجدد
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const nameArray = logMessageData.addedParticipants.map(i => i.fullName);
      const mentions = logMessageData.addedParticipants.map(i => ({ tag: i.fullName, id: i.userFbId }));
      const authorData = await Users.getData(author);
      const adderName = authorData?.name || "رابط الدعوة";
      
      const time = moment.tz("Africa/Khartoum").format("hh:mm A • DD/MM/YYYY");
      
      const msg = `╭─── • ◈ • ───╮
  ᴡᴇʟᴄᴏᴍᴇ sᴛᴀᴛɪᴏɴ
╰─── • ◈ • ───╯
 ◦ الـعـضـو ⌁ ${nameArray.join(", ")}
 ◦ الـقـروب ⌁ ${threadInfo.threadName}
 ◦ الـمُـضيف ⌁ ${adderName}
 ◦ الـتـرتـيب ⌁ ${threadInfo.participantIDs.length}
 ◦ الـتـوقـيت ⌁ ${time}
  ──────────
 " أهلاً بك.. أنرت عوالمنا بحضورك "`;
      return api.sendMessage({ body: msg, mentions }, threadID);
    } catch (e) {}
  }

  // نظام الحماية وإشعار المغادرة (تعديل جملة الطرد والتاق)
  if (logMessageType === "log:unsubscribe") {
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID == api.getCurrentUserID()) return;

    // في حال تم طرد العضو (المغادر ليس هو الفاعل)
    if (author != leftID) {
        const authorData = await Users.getData(author);
        const authorName = authorData?.name || "المسؤول";
        
        return api.sendMessage({
          body: `@${authorName} اها لقيت البان دا كيف 🗿`,
          mentions: [{ tag: authorName, id: author }]
        }, threadID);
    }

    // محاولة إعادة الإضافة التلقائية لمن غادر بنفسه
    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage("احشك واحش البضيفك زاتو 🦧📿", threadID);
      } else {
        return api.sendMessage("لديك كرامة جميلة 🐸✨", threadID);
      }
    });
  }
};
