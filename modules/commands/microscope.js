const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "microscope",
  version: "4.0.0",
  hasPermssion: 2,
  credits: "ڪايࢪوس",
  description: "تحليل وتعديل الأكواد مع تقرير التغييرات الذكي",
  commandCategory: "المطور",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const devID = "61581906898524";

  if (senderID !== devID) return;

  const fileName = args[0];
  const commandsPath = path.join(process.cwd(), "modules", "commands");

  if (!fileName) {
    const ui = 
      `◸——————————————————◹\n` +
      `   ⌬ MICROSCOPE ANALYZER ⌬\n` +
      `◺——————————————————◿\n\n` +
      `   ⌗ مـحلل الـنظم الـذكي :\n\n` +
      `  ⊡ microscope [اسم_الملف.js]\n\n` +
      `  ✧ التفاعل: 🔄 (جاري) ⟸ ✅ (تم)\n` +
      `  ✧ التقرير: تفصيلي باللغة العربية\n\n` +
      `——————————————————\n` +
      `  ✧ الـحالة: بانتظار الأوامر 💠`;
    return api.sendMessage(ui, threadID, messageID);
  }

  const filePath = path.join(commandsPath, fileName);
  if (!fs.existsSync(filePath)) return api.sendMessage("🍃 لم أجد هذا الملف في مجلد الأوامر.", threadID, messageID);

  // 1. التفاعل برمز إعادة التشغيل عند بدء العملية
  api.setMessageReaction("🔄", messageID, () => {}, true);
  const loading = await api.sendMessage("⌬ جاري تشريح الكود وتحليل النقاط الضعيفة..", threadID);

  try {
    const originalCode = fs.readFileSync(filePath, "utf-8");
    
    // برومبت مخصص لطلب "تقرير التعديلات" بجانب الكود
    const prompt = `Act as an expert developer. Improve the following code and update its APIs. 
    IMPORTANT: Provide the output in two parts separated by '---DATA---'. 
    Part 1: A brief Arabic summary of what you changed (numbered list). 
    Part 2: The full improved code only.
    Code:\n\n${originalCode}`;
    
    const res = await axios.post(`https://api.samirxp.xyz/api/gemini?q=${encodeURIComponent(prompt)}`);
    const fullRes = res.data.content || res.data.result;
    
    const parts = fullRes.split('---DATA---');
    const arabicReport = parts[0] ? parts[0].trim() : "تم تحسين المنطق العام وتحديث الروابط.";
    let upgradedCode = parts[1] ? parts[1].trim() : fullRes;

    // تنظيف الكود
    upgradedCode = upgradedCode.replace(/```javascript|```/g, "").trim();

    if (upgradedCode.length > 100) { // التأكد من نجاح العملية
      fs.writeFileSync(filePath, upgradedCode);
      
      api.unsendMessage(loading.messageID);
      
      // 2. التفاعل بـ ✅ عند النجاح
      api.setMessageReaction("✅", messageID, () => {}, true);

      // 3. إرسال التقرير النهائي بالاستايل الهندسي
      const reportUI = 
        `◸——————————————————◹\n` +
        `   ⌬ تـقـرير الـتـعديل الـذكي ⌬\n` +
        `◺——————————————————◿\n\n` +
        `📦 الـملف: ${fileName}\n` +
        `🔢 رقـم الـعملية: #MK-${Math.floor(Math.random() * 9000) + 1000}\n\n` +
        `📋 الـتـفـاصـيل :\n${arabicReport}\n\n` +
        `——————————————————\n` +
        `✨ تم تـطبيق الـتعديلات بـنجاح.`;

      return api.sendMessage(reportUI, threadID, messageID);
    }
  } catch (e) {
    api.unsendMessage(loading.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("🍃 عذراً، واجه المجهر عطلاً تقنياً في جلب البيانات.", threadID, messageID);
  }
};
