const apiManager = require('../../utils/apis');
const formatter = require('../../utils/formatter');

module.exports.config = {
  name: "ذكاء",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Manus-Agent",
  description: "الدردشة مع الذكاء الاصطناعي GPT-4 (مطور)",
  commandCategory: "ذكاء",
  usages: "[السؤال]",
  cooldowns: 5,
  dependencies: {
      axios: ""
  }
};

module.exports.run = async function ({ api: bot, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return bot.sendMessage(formatter.formatMessage("يرجى كتابة سؤالك بعد الأمر.\nمثال: .ذكاء من أنت؟", "INFO"), threadID, messageID);
  }

  try {
    bot.sendMessage(formatter.formatMessage("جاري التفكير... 🧠", "WAIT"), threadID, async (err, info) => {
      const waitMessageID = info.messageID;
      
      const response = await apiManager.getGPTResponse(prompt);
      
      if (response) {
        bot.unsendMessage(waitMessageID);
        return bot.sendMessage(formatter.formatMessage(response, "AI"), threadID, messageID);
      } else {
        bot.unsendMessage(waitMessageID);
        return bot.sendMessage(formatter.formatMessage("عذراً، لم أتمكن من الحصول على رد حالياً. حاول مرة أخرى لاحقاً.", "ERROR"), threadID, messageID);
      }
    }, messageID);
  } catch (error) {
    return bot.sendMessage(formatter.formatMessage("حدث خطأ تقني أثناء معالجة طلبك.", "ERROR"), threadID, messageID);
  }
};
