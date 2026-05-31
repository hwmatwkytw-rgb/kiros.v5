// admin.js - إدارة الأدمن للمطور
module.exports.config = {
  name: "ادمن",
  version: "1.5",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "رفع المطور أو شخص بالرد عليه لأدمن",
  commandCategory: "المطور",
  usages: "ادمن (بالرد أو بدون)",
  cooldowns: 2
};

const devID = "61570782968645";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, messageReply } = event;

  // 1. إذا كان الشخص غير المطور
  if (senderID != devID) {
    return api.sendMessage("تدفع كم ʕᵕ᷄-ᵕ᷅؟", threadID, messageID);
  }

  // 2. حالة الرفع بالرد على رسالة شخص
  if (messageReply && messageReply.senderID) {
    const targetID = messageReply.senderID;
    try {
      await api.changeAdminStatus(threadID, targetID, true);
      api.setMessageReaction("♻️", messageID, () => {}, true);
      return api.sendMessage("ʕᵕ᷄-ᵕ᷅ʔ👑", threadID, messageID);
    } catch (e) {
      return api.sendMessage("❌ فشل الرفع، تأكد أنني أدمن في المجموعة.", threadID, messageID);
    }
  }

  // 3. حالة المطور قال "ادمن" ليرفع نفسه
  try {
    await api.changeAdminStatus(threadID, devID, true);
    api.setMessageReaction("♻️", messageID, () => {}, true);
    return api.sendMessage("ʕᵕ᷄-ᵕ᷅ʔ👑", threadID, messageID);
  } catch (e) {
    return api.sendMessage("❌ فشل الرفع، تأكد أنني أدمن أولاً.", threadID, messageID);
  }
};
