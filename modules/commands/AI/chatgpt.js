const axios = require('axios');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "ذكاء",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "محادثة ذكية مع الذكاء الاصطناعي (GPT-4)",
  commandCategory: "ذكاء اصطناعي",
  usages: "[السؤال أو الطلب]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false
  }
};

module.exports.languages = {
  "ar": {
    "loading": "جاري معالجة طلبك...",
    "error": "عذراً، حدث خطأ في الاتصال بـ AI",
    "noInput": "يرجى إدخال سؤال أو طلب",
    "apiError": "خطأ في API: ",
    "success": "تم الحصول على الإجابة"
  },
  "en": {
    "loading": "Processing your request...",
    "error": "Sorry, there was an error connecting to AI",
    "noInput": "Please enter a question or request",
    "apiError": "API Error: ",
    "success": "Got the answer"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID, senderID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      formatter.error(getText("noInput")),
      threadID,
      messageID
    );
  }

  // Show loading message
  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي ومفيد. تجيب باللغة العربية بشكل واضح وموجز.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const answer = response.data.choices[0].message.content;

    // Format response
    const formattedResponse = `
${formatter.header('الذكاء الاصطناعي')}
${formatter.section('السؤال', query)}
${formatter.section('الإجابة', answer)}
${formatter.borders.simple}
👤 تم الرد بواسطة: AI Assistant
⏰ الوقت: ${new Date().toLocaleString('ar-SA')}
    `;

    // Delete loading message and send response
    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(formattedResponse, threadID, messageID);

  } catch (error) {
    console.error('AI Error:', error);
    
    const errorMsg = error.response?.status === 401 
      ? formatter.error("خطأ في المصادقة - تحقق من API Key")
      : error.response?.status === 429
      ? formatter.error("تم تجاوز حد الطلبات - حاول لاحقاً")
      : formatter.error(getText("error"), error.message);

    api.unsendMessage(loadingMsg.messageID);
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events like typing indicators
};
