const apiManager = require('../../utils/apis');
const formatter = require('../../utils/formatter');

module.exports.config = {
  name: "ترجمة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Manus-Agent",
  description: "الترجمة الفورية بين اللغات (عربي/إنجليزي)",
  commandCategory: "خدمات",
  usages: "[النص]",
  cooldowns: 5,
  dependencies: {
      axios: ""
  }
};

module.exports.run = async function ({ api: bot, event, args }) {
  const { threadID, messageID } = event;
  const text = args.join(" ");

  if (!text) {
    return bot.sendMessage(formatter.formatMessage("يرجى كتابة النص المراد ترجمته.\nمثال: .ترجمة Hello", "INFO"), threadID, messageID);
  }

  try {
    bot.sendMessage(formatter.formatMessage("جاري الترجمة... 🌐", "WAIT"), threadID, async (err, info) => {
      const waitMessageID = info.messageID;
      
      const translated = await apiManager.translateText(text);
      
      if (translated) {
        bot.unsendMessage(waitMessageID);
        return bot.sendMessage(formatter.formatMessage(`النص الأصلي: ${text}\nالترجمة: ${translated}`, "SUCCESS"), threadID, messageID);
      } else {
        bot.unsendMessage(waitMessageID);
        return bot.sendMessage(formatter.formatMessage("عذراً، لم أتمكن من ترجمة النص حالياً.", "ERROR"), threadID, messageID);
      }
    }, messageID);
  } catch (error) {
    return bot.sendMessage(formatter.formatMessage("حدث خطأ تقني أثناء الترجمة.", "ERROR"), threadID, messageID);
  }
};
