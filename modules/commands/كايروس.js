const axios = require('axios');

module.exports.config = {
  name: "كايروس",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "محمد",
  description: "بوت ذكاء اصطناعي بسوداني حريف وقاصف جبهات",
  commandCategory: "ai",
  usages: "كايروس [الكلام]",
  cooldowns: 2
};

// مخزن مؤقت للمحادثات عشان "يستمر في الونسة"
if (!global.kairos_chat) global.kairos_chat = {};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  const apiKey = "AIzaSyBp-I3KGcLuqjbkcKXCMIHEbTG8q4lAla4";

  if (!prompt) return api.sendMessage("أكتب حاجة يا أصلة، ولا جاي تعاين لي بس؟", threadID, messageID);

  // تجهيز سياق المحادثة (عشان يرد على الرد)
  if (!global.kairos_chat[senderID]) global.kairos_chat[senderID] = [];
  const userHistory = global.kairos_chat[senderID];

  // تعليمات الشخصية (السيستم برومبت)
  const systemInstruction = "أنت الآن 'كايروس'، بوت سوداني لسانك طويل، ردودك تقيلة دم، ساخرة جداً، وتستخدم اللهجة السودانية الدارجة (الحتات الصعبة). أنت لست مساعداً لطيفاً، بل شخص يتونس ببرود ويشتم بذكاء إذا لزم الأمر (معرص بالمعنى السوداني الساخر). إذا الشخص سألك سؤال غبي قصف جبهته فوراً. ردودك قصيرة، قوية، وجامدة من الآخر.";

  try {
    // إرسال طلب لـ Gemini API (أو Google AI)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await axios.post(url, {
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] }, // تعليمات الشخصية
        ...userHistory, // تاريخ المحادثة السابقة
        { role: "user", parts: [{ text: prompt }] } // السؤال الجديد
      ]
    });

    const aiReply = response.data.candidates[0].content.parts[0].text;

    // حفظ المحادثة في الذاكرة (آخر 4 ردود عشان ما يثقل السيرفر)
    userHistory.push({ role: "user", parts: [{ text: prompt }] });
    userHistory.push({ role: "model", parts: [{ text: aiReply }] });
    if (userHistory.length > 8) userHistory.splice(0, 2);

    return api.sendMessage(aiReply, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("السيرفر كجّن يا فردة، أو المفتاح ده انتهى. جرب بعد شوية.", threadID, messageID);
  }
};
