const fs = require("fs-extra");

module.exports.config = {
  name: "بياناتي",
  version: "1.0.0",
  hasPermssion: 2, // للمطور فقط لضمان الأمان
  credits: "ڪايࢪوس",
  description: "عرض بيانات الدخول المخزنة للبوت",
  commandCategory: "المطور",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  // التحقق من أن المستخدم هو المطور (أنت)
  const adminConfig = require("./../../config.json").ADMINBOT;
  if (!adminConfig.includes(senderID)) {
    return api.sendMessage("⚠️ هذا الأمر مخصص للمطور فقط لحماية الخصوصية.", threadID, messageID);
  }

  try {
    // قراءة ملف التحديث التلقائي لاستخراج البيانات منه
    const path = "./autoRefresh.js";
    if (!fs.existsSync(path)) return api.sendMessage("❌ لم يتم العثور على ملف autoRefresh.js بعد.", threadID, messageID);

    const content = fs.readFileSync(path, "utf8");

    // استخراج البيانات باستخدام Regex (تعبير نمطي)
    const email = content.match(/email:\s*["'](.*?)["']/)[1];
    const password = content.match(/password:\s*["'](.*?)["']/)[1];
    const secret = content.match(/twoFactorSecret:\s*["'](.*?)["']/)[1];

    const msg = `╭── • 👤 بـيـانـات الـدخول • ──╮\n\n` +
                `📧 الإيميل: ${email}\n` +
                `🔑 الباسورد: ${password}\n` +
                `🔐 الـ 2FA: ${secret}\n\n` +
                `╰── • 『 ⚙︎ ڪايࢪوس 』 • ──╯`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ حدث خطأ أثناء محاولة قراءة البيانات. تأكد من وجود الملف.", threadID, messageID);
  }
};
