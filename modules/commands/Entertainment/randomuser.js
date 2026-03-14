const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "شخص",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "الحصول على بيانات شخص عشوائي",
  commandCategory: "ترفيه",
  usages: "",
  cooldowns: 3,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري البحث عن شخص عشوائي...",
    "error": "عذراً، حدث خطأ في الحصول على البيانات",
    "success": "شخص عشوائي",
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "location": "الموقع",
    "gender": "الجنس",
    "nationality": "الجنسية"
  },
  "en": {
    "loading": "Getting a random person...",
    "error": "Sorry, there was an error getting data",
    "success": "Random Person",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "location": "Location",
    "gender": "Gender",
    "nationality": "Nationality"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    const response = await axios.get('https://randomuser.me/api/', {
      timeout: 10000
    });

    const user = response.data.results[0];

    let formattedResponse = `${formatter.header(getText("success"))}\n`;
    formattedResponse += `${formatter.emojis.user} ${getText("name")}: ${formatter.bold(user.name.first + ' ' + user.name.last)}\n`;
    formattedResponse += `${formatter.emojis.message} ${getText("email")}: ${user.email}\n`;
    formattedResponse += `${formatter.emojis.phone || '📞'} ${getText("phone")}: ${user.phone}\n`;
    formattedResponse += `${formatter.emojis.location || '📍'} ${getText("location")}: ${user.location.city}, ${user.location.country}\n`;
    formattedResponse += `${formatter.emojis.user} ${getText("gender")}: ${user.gender === 'male' ? 'ذكر' : 'أنثى'}\n`;
    formattedResponse += `${formatter.emojis.flag || '🏳️'} ${getText("nationality")}: ${user.nat}\n`;
    formattedResponse += `\n${formatter.borders.simple}`;
    formattedResponse += `\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    api.unsendMessage(loadingMsg.messageID);
    
    return api.sendMessage({
      body: formattedResponse,
      attachment: await getImageAttachment(user.picture.large)
    }, threadID, messageID);

  } catch (error) {
    console.error('Random User Error:', error);
    api.unsendMessage(loadingMsg.messageID);
    
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
};

async function getImageAttachment(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'stream'
    });
    return response.data;
  } catch (error) {
    console.error('Error getting image:', error);
    return null;
  }
}

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events
};
