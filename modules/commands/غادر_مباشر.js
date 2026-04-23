const developerID = "61573334176409";

module.exports.config = {
  name: "غادر_مباشر",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "محمد إدريس + Gemini",
  description: "مغادرة البوت فوراً بالكلمات المفتاحية",
  commandCategory: "المطور",
  usages: "كايروس غادر / كايروس اطلع / غادر",
  cooldowns: 2
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const keywords = ["كايروس غادر", "كايروس اطلع", "غادر"];
  const isKeyword = keywords.some(word => body.toLowerCase() === word);

  if (isKeyword) {
    if (senderID === developerID) {
      // تنفيذ المغادرة فوراً للمطور
      await api.sendMessage("البيض البضيفني غير ابوي امو عبة 🗿", threadID);
      
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      }, 1500);
      
    } else {
      // ردود عشوائية لغير المطور
      const responses = [
        "قاعد في بيت امك؟! 🦧",
        "القروب هو حق امك عشان اطلع 🦧",
        "بيت امك هو 🦧"
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      return api.sendMessage(randomReply, threadID, messageID);
    }
  }
};

module.exports.run = async function({}) {
  // شغال عبر handleEvent
};
