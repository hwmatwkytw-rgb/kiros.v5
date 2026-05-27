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
      const botName = global.config.BOTNAME || "KYROS BOT";
      const totalCommands = global.client.commands.size;
      const prefix = global.config.PREFIX;
      
      api.changeNickname(`[ ${prefix} ] • ${botName}`, threadID, api.getCurrentUserID());
      
      const botMsg = `﷽\n« أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ »\n\n╭─── • ◈ • ───╮\n   sʏsᴛᴇᴍ ʟᴏᴀᴅᴇᴅ\n╰─── • ◈ • ───╯\n ◦ الـنـظـام ⌁ ${botName}\n ◦ الإصـدار ⌁ 3.7.0\n ◦ الأوامـر ⌁ ${totalCommands}\n ◦ الـبـادئـة ⌁ [ ${prefix} ]\n ◦ الـحـالـة ⌁ Active\n  ──────────\n " اللهم صلِ وسلم على نبينا محمد "`;
      
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
      
      const msg = `╭─── • ◈ • ───╮\n  ᴡᴇʟᴄᴏᴍᴇ sᴛᴀᴛɪᴏɴ\n╰─── • ◈ • ───╯\n ◦ الـعـضـو ⌁ ${nameArray.join(", ")}\n ◦ الـقـروب ⌁ ${threadInfo.threadName}\n ◦ الـمُـضيف ⌁ ${adderName}\n ◦ الـتـرتـيب ⌁ ${threadInfo.participantIDs.length}\n ◦ الـتـوقـيت ⌁ ${time}\n  ──────────\n " أهلاً بك.. أنرت عوالمنا بحضورك "`;
      return api.sendMessage({ body: msg, mentions }, threadID);
    } catch (e) {
      console.log(e);
    }
  }

  // نظام الحماية وإشعار المغادرة
  if (logMessageType === "log:unsubscribe") {
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID == api.getCurrentUserID()) return;

    if (author != leftID) {
        const expelledData = await Users.getData(leftID);
        const expelledName = expelledData?.name || "العضو";
        
        return api.sendMessage({
          body: `@${expelledName} اها لقيت البان دا كيف 🗿`,
          mentions: [{ tag: expelledName, id: leftID }]
        }, threadID);
    }

    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage("احشك واحش البضيفك زاتو 🦧📿", threadID);
      } else {
        return api.sendMessage("لديك كرامة جميلة 🐸✨", threadID);
      }
    });
  }
};
