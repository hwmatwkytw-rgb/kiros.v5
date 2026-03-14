const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "ترجمة",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "ترجمة النصوص بين اللغات المختلفة",
  commandCategory: "خدمات",
  usages: "[اللغة المستهدفة] [النص]",
  cooldowns: 5,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري الترجمة...",
    "error": "عذراً، حدث خطأ في الترجمة",
    "noInput": "يرجى إدخال النص المراد ترجمته",
    "invalidLanguage": "لغة غير صحيحة",
    "success": "تمت الترجمة بنجاح",
    "original": "النص الأصلي",
    "translated": "النص المترجم",
    "language": "اللغة",
    "from": "من",
    "to": "إلى"
  },
  "en": {
    "loading": "Translating...",
    "error": "Sorry, there was an error in translation",
    "noInput": "Please enter text to translate",
    "invalidLanguage": "Invalid language",
    "success": "Translation completed successfully",
    "original": "Original Text",
    "translated": "Translated Text",
    "language": "Language",
    "from": "From",
    "to": "To"
  }
};

const languageCodes = {
  'ar': 'Arabic',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'es': 'Spanish',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'tr': 'Turkish',
  'hi': 'Hindi'
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;

  if (args.length < 2) {
    return api.sendMessage(
      formatter.error(getText("noInput"), 
        `الاستخدام: ترجمة [اللغة] [النص]\nمثال: ترجمة en مرحبا بك`),
      threadID,
      messageID
    );
  }

  const targetLang = args[0].toLowerCase();
  const text = args.slice(1).join(" ");

  if (!languageCodes[targetLang]) {
    return api.sendMessage(
      formatter.error(getText("invalidLanguage"), 
        `اللغات المدعومة: ${Object.keys(languageCodes).join(', ')}`),
      threadID,
      messageID
    );
  }

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `en|${targetLang}`
      },
      timeout: 10000
    });

    if (response.data.responseStatus !== 200) {
      throw new Error('خطأ في الترجمة');
    }

    const translatedText = response.data.responseData.translatedText;

    let formattedResponse = `${formatter.header(getText("success"))}\n`;
    formattedResponse += `${formatter.section(getText("original"), text)}\n`;
    formattedResponse += `${formatter.section(getText("translated"), translatedText)}\n`;
    formattedResponse += `${formatter.emojis.arrow_right} ${getText("from")}: English\n`;
    formattedResponse += `${formatter.emojis.arrow_left} ${getText("to")}: ${languageCodes[targetLang]}\n`;
    formattedResponse += `\n${formatter.borders.simple}`;
    formattedResponse += `\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('Translation Error:', error);
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
