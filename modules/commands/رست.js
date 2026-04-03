const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "رست",
  version: "2.6.0",
  hasPermssion: 2,
  credits: "DANTE",
  description: "إعادة تشغيل النظام وتحديث المكتبات (نسخة المطور)",
  commandCategory: "المطور",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const devID = "61581906898524";

  // حماية المطور
  if (senderID !== devID) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ هذا الأمر مخصص للمطور DANTE فقط ○\n╯────────────── 🝓", threadID, messageID);
  }

  api.setMessageReaction("🔄", messageID, () => {}, true);

  // الحالة الأولى: تحديث المكتبات npm install
  if (args[0] === "تحديث") {
    const loading = await api.sendMessage("╮─── ▽ 「 تحديث 」\n│ جاري تحديث مكتبات النظام... ○\n╯────────────── 🝓", threadID);
    
    return exec("npm install", (err, stdout, stderr) => {
      if (err) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل تحديث المكتبات ○\n╯────────────── 🝓", threadID);
      }
      
      api.unsendMessage(loading.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage("╮─── ▽ 「 نجاح 」\n│ تم تحديث النظام بنجاح ○\n╯────────────── 🝓", threadID);
    });
  }

  // الحالة الثانية: إعادة التشغيل الكامل (Restart)
  const restartMsg = `╮─────── 🝓 ───────╭
    𝖲 𝖸 𝖲 𝖳 𝖤 𝖬   𝖱 𝖤 𝖲 𝖤 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : جاري إعادة التشغيل...
│ ⌑ الموقع : Render Engine
│ ⌑ سأعود خلال لحظات ○
╯────────────── 🝓`;

  await api.sendMessage(restartMsg, threadID);

  // تنفيذ الخروج بكود (1) ليعرف ملف index.js أنه يجب إعادة التشغيل فوراً
  process.exit(1);
};
