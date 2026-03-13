const axios = require('axios');

module.exports.config = {
  name: "كايروس",
  version: "3.6.0",
  hasPermssion: 0,
  credits: "محمد",
  description: "النسخة القوية - AI سوداني قاصف جبهات",
  commandCategory: "ai",
  usages: "كايروس [الكلام]",
  cooldowns: 2
};

if (!global.kairos_chat) global.kairos_chat = {};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");
  
  // المفتاح الخاص بك
  const apiKey = "AIzaSyBp-I3KGcLuqjbkcKXCMIHEbTG8q4lAla4";

  if (!prompt) return api.sendMessage("أكتب حاجه أحشك ʕᵕ᷄-ᵕ᷅ʔ", threadID, messageID);

  if (!global.kairos_chat[senderID]) global.kairos_chat[senderID] = [];
  const userHistory = global.kairos_chat[senderID];

  // تعليمات الشخصية السودانية
  const systemInstruction = "أنت الآن كايروس، بوت سوداني لسانك طويل جدا، ردودك ساخرة وحريفة وقاصفة للجبهات. استخدم اللهجة السودانية (الردم، الحنك، لغة الشوارع). إذا الشخص استفزك ردمه ردم شديد بكلمات مثل يا معرص، يا بيش، يا وهم. أنت لست مساعدا، أنت ملك الردود المسكتة. ردودك دائما قصيرة ومستفزة ولا تستخدم أي إيموجي ملون نهائيا في ردودك.";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const data = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemInstruction + "\n\nالآن رد على هذا الكلام بنفس الأسلوب وبدون إيموجيات ملونة: " + prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && response.data.candidates && response.data.candidates[0].content) {
      let aiReply = response.data.candidates[0].content.parts[0].text;
      
      // تنظيف الرد من أي إيموجي ملون قد يتسلل
      aiReply = aiReply.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

      // حفظ الونسة لسياق المحادثة
      userHistory.push({ role: "user", parts: [{ text: prompt }] });
      userHistory.push({ role: "model", parts: [{ text: aiReply }] });
      if (userHistory.length > 6) userHistory.splice(0, 2);

      return api.sendMessage(aiReply, threadID, messageID);
    } else {
      throw new Error("Invalid Response Structure");
    }

  } catch (error) {
    console.error("Error details:", error.response ? error.response.data : error.message);
    
    let errorMsg = "يا فردة في مشكلة في الـ API بتاعك ده. غالبا المفتاح محظور أو الموديل غلط";
    if (error.response && error.response.status === 400) errorMsg = "المفتاح ده فيهو مشكلة اتأكد منه في AI Studio";
    if (error.response && error.response.status === 403) errorMsg = "المفتاح ده محظور أو صلاحيته انتهت";

    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
