const apiManager = require('../../utils/apis');
const formatter = require('../../utils/formatter');

module.exports.config = {
  name: "طقس",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Manus-Agent",
  description: "معرفة حالة الطقس الحالية في أي مدينة",
  commandCategory: "خدمات",
  usages: "[المدينة]",
  cooldowns: 5,
  dependencies: {
      axios: ""
  }
};

module.exports.run = async function ({ api: bot, event, args }) {
  const { threadID, messageID } = event;
  const city = args.join(" ");

  if (!city) {
    return bot.sendMessage(formatter.formatMessage("يرجى كتابة اسم المدينة بعد الأمر.\nمثال: .طقس الخرطوم", "INFO"), threadID, messageID);
  }

  try {
    bot.sendMessage(formatter.formatMessage("جاري جلب بيانات الطقس... 🌤️", "WAIT"), threadID, async (err, info) => {
      const waitMessageID = info.messageID;
      
      const weather = await apiManager.getWeather(city);
      
      if (weather) {
        bot.unsendMessage(waitMessageID);
        const weatherInfo = `🌍 المدينة: ${weather.city}, ${weather.country}\n🌡️ درجة الحرارة: ${weather.temp}°C\n🌦️ الحالة: ${weather.description}\n💧 الرطوبة: ${weather.humidity}%`;
        return bot.sendMessage(formatter.formatMessage(weatherInfo, "WEATHER"), threadID, messageID);
      } else {
        bot.unsendMessage(waitMessageID);
        return bot.sendMessage(formatter.formatMessage("عذراً، لم أتمكن من العثور على بيانات الطقس لهذه المدينة.", "ERROR"), threadID, messageID);
      }
    }, messageID);
  } catch (error) {
    return bot.sendMessage(formatter.formatMessage("حدث خطأ تقني أثناء جلب بيانات الطقس.", "ERROR"), threadID, messageID);
  }
};
