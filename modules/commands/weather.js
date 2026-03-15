const axios = require("axios");

module.exports.config = {
    name: "طقس",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "Dante Sparda",
    description: "بجيب ليك حالة الطقس في أي مدينة في العالم",
    commandCategory: "الأدوات",
    usages: "[اسم المدينة]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    
    // سحب مفتاح الـ API من الإعدادات العالمية
    const apiKey = global.config.weather?.OPEN_WEATHER || "YOUR_API_KEY_HERE";

    if (!args[0]) {
        return api.sendMessage("يا حبيبنا اكتب اسم المدينة بعد الأمر، مثال: طقس الخرطوم", threadID, messageID);
    }

    const city = args.join(" ");

    try {
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=ar`);
        
        const { main, weather, wind, sys, name } = res.data;
        const temp = Math.round(main.temp);
        const feelsLike = Math.round(main.feels_like);
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed;
        const country = sys.country;

        let advice = "الجو رايق.. استمتع بي يومك! ✨";
        if (temp > 35) advice = "الجو سخانة نار.. كتر من الموية! 🔥🥤";
        if (temp < 15) advice = "الجو برد شديد.. اتلفلف كويس! ❄️🧣";

        const message = `┌─── • [ 🌤️ طقس ${name} ] • ───┐\n\n` +
                        `─ الدولة: ${country}\n` +
                        `─ الحالة: ${description}\n` +
                        `─ الحرارة: ${temp}°C\n` +
                        `─ الإحساس: ${feelsLike}°C\n` +
                        `─ الرطوبة: ${humidity}%\n` +
                        `─ الرياح: ${windSpeed} م/ث\n\n` +
                        `⚡: ${advice}\n\n` +
                        `└──────────────────────────┘`;

        return api.sendMessage(message, threadID, messageID);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return api.sendMessage("المدينة دي ما لقيتها، تأكد من الاسم وراسلني تاني.", threadID, messageID);
        }
        console.error(err);
        return api.sendMessage("حدث خطأ تقني في جلب البيانات.", threadID, messageID);
    }
};
