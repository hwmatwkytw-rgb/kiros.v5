const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = {
  config: {
    name: "ai",
    version: "1.2.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "الذكاء الاصطناعي - جيميناي فلاش",
    commandCategory: "الذكاء الاصطناعي",
    usages: "[النص]",
    cooldowns: 5,
    dependencies: {
      "@google/generative-ai": ""
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage("╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭\n      ERROR : NO INPUT\n╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰\n  ◈ يرجى إدخال نص للتحدث مع الذكاء الاصطناعي\n╮───────────────────╭", threadID, messageID);

    try {
      // استخدام مفتاحك الذي استخرجناه
      const genAI = new GoogleGenerativeAI("AIzaSyBp-I3KGcLuqjbkcKXCMIHEbTG8q4lAla4");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // تنسيق الرد بنفس ستايل joinNoti الخاص بك
      const msg = `╮───────┈◈ ⦗ ✧ ⦘ ◈┈───────╭
      AI RESPONSE SYSTEM
╯───────┈◈ ⦗ ✧ ⦘ ◈┈───────╰
${text}
╮───────────────────╭
  " العقل هو السلاح الأقوى.. استخدمه بحكمة "
╯───────────────────╰`;

      return api.sendMessage(msg, threadID, messageID);
      
    } catch (error) {
      console.error(error);
      return api.sendMessage("╮───────┈◈ ⦗ ⚠️ ⦘ ◈┈───────╭\n      CONNECTION ERROR\n╯───────┈◈ ⦗ ⚠️ ⦘ ◈┈───────╰\n  ◈ حدث خطأ في خوادم الذكاء الاصطناعي", threadID, messageID);
    }
  }
};
