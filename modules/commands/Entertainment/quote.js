const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "اقتباس",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "الحصول على اقتباس ملهم عشوائي",
  commandCategory: "ترفيه",
  usages: "[نوع الاقتباس]",
  cooldowns: 3,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري البحث عن اقتباس...",
    "error": "عذراً، حدث خطأ في الحصول على الاقتباس",
    "success": "اقتباس ملهم لك! ✨",
    "quote": "الاقتباس",
    "author": "المؤلف",
    "tags": "الوسوم"
  },
  "en": {
    "loading": "Getting an inspiring quote...",
    "error": "Sorry, there was an error getting the quote",
    "success": "An inspiring quote for you! ✨",
    "quote": "Quote",
    "author": "Author",
    "tags": "Tags"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    const response = await axios.get('https://api.quotable.io/random', {
      timeout: 10000
    });

    const quoteData = response.data;

    let formattedResponse = `${formatter.header(getText("success"))}\n`;
    formattedResponse += `${formatter.section(getText("quote"), `"${quoteData.content}"`)}\n`;
    formattedResponse += `${formatter.emojis.user} ${getText("author")}: ${formatter.bold(quoteData.author)}\n`;
    
    if (quoteData.tags && quoteData.tags.length > 0) {
      formattedResponse += `${formatter.emojis.tag || '🏷️'} ${getText("tags")}: ${quoteData.tags.join(', ')}\n`;
    }

    formattedResponse += `\n${formatter.borders.simple}`;
    formattedResponse += `\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('Quote Error:', error);
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
