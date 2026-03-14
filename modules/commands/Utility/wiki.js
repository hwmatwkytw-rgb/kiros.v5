const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "ويكي",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "البحث عن معلومات على ويكيبيديا",
  commandCategory: "خدمات",
  usages: "[الموضوع]",
  cooldowns: 5,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري البحث على ويكيبيديا...",
    "error": "عذراً، حدث خطأ في البحث",
    "noInput": "يرجى إدخال موضوع للبحث عنه",
    "notFound": "لم يتم العثور على نتائج",
    "success": "نتائج البحث",
    "title": "العنوان",
    "description": "الوصف",
    "results": "النتائج"
  },
  "en": {
    "loading": "Searching Wikipedia...",
    "error": "Sorry, there was an error searching",
    "noInput": "Please enter a topic to search",
    "notFound": "No results found",
    "success": "Search Results",
    "title": "Title",
    "description": "Description",
    "results": "Results"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
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
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        srlimit: 5
      },
      timeout: 10000
    });

    const results = response.data.query.search;

    if (results.length === 0) {
      api.unsendMessage(loadingMsg.messageID);
      return api.sendMessage(
        formatter.warning(getText("notFound")),
        threadID,
        messageID
      );
    }

    let formattedResponse = `${formatter.header(getText("success"))}\n`;
    formattedResponse += `${formatter.section(getText("results"), `تم العثور على ${results.length} نتائج`)}\n\n`;

    results.forEach((result, index) => {
      formattedResponse += `${index + 1}️⃣ ${formatter.bold(result.title)}\n`;
      formattedResponse += `${result.snippet.substring(0, 150)}...\n`;
      formattedResponse += `${formatter.borders.dash}\n\n`;
    });

    formattedResponse += `${formatter.borders.simple}`;
    formattedResponse += `\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('Wikipedia Error:', error);
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
