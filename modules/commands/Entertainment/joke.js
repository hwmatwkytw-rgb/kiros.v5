const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "نكتة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "الحصول على نكتة عشوائية مضحكة",
  commandCategory: "ترفيه",
  usages: "[نوع النكتة]",
  cooldowns: 3,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري البحث عن نكتة مضحكة...",
    "error": "عذراً، حدث خطأ في الحصول على النكتة",
    "success": "هنا نكتة لك! 😂",
    "setup": "المقدمة",
    "punchline": "النهاية",
    "joke": "النكتة"
  },
  "en": {
    "loading": "Getting a funny joke...",
    "error": "Sorry, there was an error getting the joke",
    "success": "Here's a joke for you! 😂",
    "setup": "Setup",
    "punchline": "Punchline",
    "joke": "Joke"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke', {
      timeout: 10000
    });

    const jokeData = response.data;

    let formattedResponse = `${formatter.header(getText("success"))}\n`;

    if (jokeData.setup && jokeData.punchline) {
      // Two-part joke
      formattedResponse += `${formatter.section(getText("setup"), jokeData.setup)}\n`;
      formattedResponse += `${formatter.section(getText("punchline"), jokeData.punchline)}\n`;
    } else if (jokeData.joke) {
      // Single-line joke
      formattedResponse += `${formatter.section(getText("joke"), jokeData.joke)}\n`;
    }

    formattedResponse += `\n${formatter.borders.simple}`;
    formattedResponse += `\n${formatter.emojis.laugh || '😂'} النوع: ${jokeData.type || 'عام'}`;
    formattedResponse += `\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('Joke Error:', error);
    api.unsendMessage(loadingMsg.messageID);
    
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
};

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events
};
