module.exports.config = {
  name: "لاست",
  version: "2.5.0",
  hasPermssion: 2,
  credits: "Gemini",
  description: "عرض المجموعات بنمط بصري انسيابي",
  commandCategory: "المطور",
  usages: "[الرقم]",
  cooldowns: 3
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { senderID, body, threadID, messageID } = event;
  const developerID = "61573334176409";

  if (String(senderID) !== developerID) return;

  const index = parseInt(body);
  if (isNaN(index) || index <= 0 || index > handleReply.groupList.length) {
    return api.sendMessage("╮ ✕ يرجى إرسال رقم صحيح من القائمة.", threadID, messageID);
  }

  const groupExit = handleReply.groupList[index - 1];
  
  api.removeUserFromGroup(api.getCurrentUserID(), groupExit.threadID, (err) => {
    if (err) return api.sendMessage(`╮ ✕ تعذر الخروج من: ${groupExit.name}`, threadID, messageID);
    return api.sendMessage(`╮ ◸ تـمَّ الإجـراء ◿\n│\n╰ ⊸ غادرتُ المجموعة: ${groupExit.name}`, threadID, messageID);
  });
};

module.exports.run = async function({ api, event }) {
  const developerID = "61573334176409";
  if (String(event.senderID) !== developerID) {
    return api.sendMessage("╮ ⚠️ الوصول مقتصر للمطور.", event.threadID);
  }

  try {
    const list = await api.getThreadList(100, null, ["INBOX"]);
    const groupList = list.filter(group => group.isGroup && group.isSubscribed);
    
    let msg = `╭─── ◸ 𝙻𝙰𝚂𝚃 𝙻𝙸𝚂𝚃 ◿ ───╮\n│\n`;
    
    groupList.forEach((group, index) => {
      const num = (index + 1).toString().padStart(2, '0');
      msg += `  ${num} ⊸ ${group.name}\n`;
      msg += `  ╰ 𝙸𝙳: [ ${group.threadID} ]\n\n`;
    });

    msg += `── ◸ 𝚂𝚄𝙼𝙼𝙰𝚁𝚈 ◿ ──\n`;
    msg += `│ ✦ المجموعات: ${groupList.length}\n`;
    msg += `│ ✦ للـخـروج: رد برقم المجموعة\n`;
    msg += `╰─────────────────╯`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        groupList: groupList
      });
    }, event.messageID);
    
  } catch (error) {
    return api.sendMessage("╮ ✕ حدث خطأ في جلب البيانات.", event.threadID);
  }
};
