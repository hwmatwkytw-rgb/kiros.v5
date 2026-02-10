const os = require('os');

module.exports.config = {
  name: "جلسة",
  version: "4.0.0",
  hasPermssion: 2, 
  credits: "Gemini",
  description: "عرض تفاصيل الجلسة والتحكم في الاستضافة",
  commandCategory: "المطور",
  usages: "جلسة",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, client }) {
  const { threadID, messageID, senderID } = event;
  
  // التحقق من هويتك كمطور
  const devID = "61581906898524";
  if (senderID != devID) return api.sendMessage("⚠️ الوصول مقتصر على المطور الرئيسي.", threadID, messageID);

  return sendDashboard(api, threadID, messageID, senderID);
};

async function sendDashboard(api, threadID, messageID, senderID) {
  // 1. حساب وقت التشغيل
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  // 2. معلومات الاستضافة
  const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  
  // 3. معلومات الحساب
  const botID = api.getCurrentUserID();
  const botInfo = await api.getUserInfo(botID);
  const botName = botInfo[botID].name;

  const msg = `⌈ جـلـسـة الـمـطـور الـشـامـلـة ⌋\n` +
    `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
    `🤖 الـحساب النشط: ${botName}\n` +
    `🔗 عدد الحسابات: 1 (الرئيسي)\n` +
    `⏳ وقت تشغيل الجلسة: ${hours}س ${minutes}د ${seconds}ث\n` +
    `📟 الـرام المستخدم: ${ramUsage}MB / ${totalRam}GB\n` +
    `🌐 الـنظام: ${os.platform()} (${os.arch()})\n` +
    `📊 الـمجموعات: ${global.data.allThreadID.length}\n` +
    `👥 الـمستخدمين: ${global.data.allUserID.length}\n` +
    `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
    `⌈ خـيارات الـتحكم ⌋\n\n` +
    `[1] ⚡ فحص السرعة (Ping)\n` +
    `[2] 🔄 تحديث الجلسة (Restart)\n` +
    `[3] 📑 تحديث البيانات (Refresh)\n` +
    `[4] 🚪 خروج نهائي (Shutdown)\n` +
    `[5] 📊 تفاصيل المجموعات\n\n` +
    `💡 رد بالرقم المطلوب للتنفيذ`;

  return api.sendMessage(msg, threadID, (err, info) => {
    if (err) return;
    global.client.handleReply.push({
      name: "جلسة",
      messageID: info.messageID,
      author: senderID
    });
  }, messageID);
}

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, body, messageID, senderID } = event;
  
  if (senderID != handleReply.author) return;

  switch (body) {
    case "1": // فحص السرعة
      const start = Date.now();
      return api.sendMessage("📡 جاري فحص السرعة...", threadID, (err, info) => {
        const end = Date.now() - start;
        api.editMessage(`🚀 سرعة استجابة الاستضافة: ${end}ms`, info.messageID);
      });

    case "2": // ريستارت
      await api.sendMessage("⚙️ جاري إعادة تشغيل الجلسة وتحديث المضيف...", threadID);
      process.exit(1);
      break;

    case "3": // تحديث اللوحة
      api.unsendMessage(handleReply.messageID);
      return sendDashboard(api, threadID, messageID, senderID);

    case "4": // خروج نهائي
      await api.sendMessage("🛑 تم إغلاق الجلسة بنجاح. (يتطلب تشغيل يدوي الآن)", threadID);
      process.exit(0);
      break;

    case "5": // إحصائيات المجموعات
      return api.sendMessage(`📊 المجموعات المرتبطة حالياً: ${global.data.allThreadID.length} مجموعة.`, threadID);

    default:
      return api.sendMessage("⚠️ خيار غير صحيح، اختر من 1 إلى 5.", threadID);
  }
};
