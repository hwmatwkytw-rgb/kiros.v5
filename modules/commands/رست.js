const fs = require("fs-extra");
const { exec } = require("child_process");

module.exports.config = {
  name: "رست",
  version: "2.0.0",
  hasPermssion: 2, // مخصص للمطور كايࢪوس فقط
  credits: "ڪايࢪوس",
  description: "إعادة تشغيل النظام أو تحديث الأوامر برقة",
  commandCategory: "المطور",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const devID = "61581906898524";

  // حماية المطور كايࢪوس
  if (senderID !== devID) {
    return api.sendMessage("✨ عذراً، هذا الركن مخصص للمطور كايࢪوس فقط.", threadID, messageID);
  }

  // التفاعل بإيموجي إعادة التشغيل كما طلبت
  api.setMessageReaction("🔄", messageID, () => {}, true);

  // الحالة الأولى: تحديث الأوامر والملفات فقط (بدون إغلاق البوت)
  if (args[0] === "تحديث") {
    api.sendMessage("🍃 جاري تحديث ملفات النظام والأوامر بكل هدوء..", threadID, messageID);
    
    // هنا نقوم بمسح "كاش" الأوامر وإعادة تحميلها (تعتمد على هيكلة بوتك)
    // بشكل عام في Render، يفضل الـ Restart الكامل، لكن هذا الخيار للسرعة
    return exec("npm run build", (err) => { 
       if (err) return api.sendMessage("❌ فشل التحديث السريع.", threadID);
       api.sendMessage("✅ تم تحديث الأوامر بنجاح.", threadID);
    });
  }

  // الحالة الافتراضية: إعادة التشغيل الكامل (Restart)
  await api.sendMessage("🦋 جاري إعادة تشغيل الإمبراطورية.. سأعود إليك خلال لحظات.", threadID, messageID);

  // إيقاف العملية (التي ستقوم Render بإعادة تشغيلها تلقائياً)
  process.exit(1);
};
