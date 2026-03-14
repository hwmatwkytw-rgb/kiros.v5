const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "طقس",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "الحصول على معلومات الطقس لأي مدينة",
  commandCategory: "خدمات",
  usages: "[اسم المدينة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false
  }
};

module.exports.languages = {
  "ar": {
    "loading": "جاري البحث عن الطقس...",
    "error": "عذراً، حدث خطأ في الحصول على بيانات الطقس",
    "noInput": "يرجى إدخال اسم المدينة",
    "notFound": "لم يتم العثور على المدينة",
    "success": "تم الحصول على بيانات الطقس"
  },
  "en": {
    "loading": "Searching for weather...",
    "error": "Sorry, there was an error getting weather data",
    "noInput": "Please enter a city name",
    "notFound": "City not found",
    "success": "Weather data retrieved"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const city = args.join(" ");

  if (!city) {
    return api.sendMessage(
      formatter.error(getText("noInput")),
      threadID,
      messageID
    );
  }

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: process.env.OPEN_WEATHER_API || 'c4ef85b93982d6627681b056e24bd438',
        units: 'metric',
        lang: 'ar'
      },
      timeout: 10000
    });

    const data = response.data;
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    const clouds = data.clouds;

    // Get weather emoji
    const weatherEmoji = getWeatherEmoji(weather.main);

    const formattedResponse = `
${formatter.header('معلومات الطقس')}
${formatter.emojis.location || '📍'} المدينة: ${formatter.bold(data.name)}, ${data.sys.country}
${weatherEmoji} الحالة: ${weather.description}

${formatter.section('درجات الحرارة')}
🌡️ الحالية: ${main.temp}°C
🔥 الحد الأقصى: ${main.temp_max}°C
❄️ الحد الأدنى: ${main.temp_min}°C
🤔 الشعور: ${main.feels_like}°C

${formatter.section('تفاصيل إضافية')}
💧 الرطوبة: ${main.humidity}%
🌪️ سرعة الرياح: ${wind.speed} م/ث
☁️ الغيوم: ${clouds.all}%
🔽 الضغط: ${main.pressure} hPa

${formatter.borders.simple}
⏰ آخر تحديث: ${new Date().toLocaleString('ar-SA')}
    `;

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('Weather Error:', error);
    api.unsendMessage(loadingMsg.messageID);

    let errorMsg = getText("error");
    if (error.response?.status === 404) {
      errorMsg = getText("notFound");
    }

    return api.sendMessage(
      formatter.error(errorMsg, error.message),
      threadID,
      messageID
    );
  }
};

function getWeatherEmoji(weatherType) {
  const weatherMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '💨',
    'Haze': '🌫️',
    'Dust': '🌪️',
    'Fog': '🌫️',
    'Sand': '🌪️',
    'Ash': '🌋',
    'Squall': '🌪️',
    'Tornado': '🌪️'
  };
  return weatherMap[weatherType] || '🌤️';
}

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events
};
