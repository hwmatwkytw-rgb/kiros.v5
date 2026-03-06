module.exports.config = {
  name: "مساعدة",
  version: "1.3.5",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "عرض تفاصيل وكيفية استخدام أمر معين",
  commandCategory: "النظام",
  usages: "[اسم الأمر]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const commands = global.client.commands;
  const input = args[0];

  // 1. في حال عدم تحديد أمر
  if (!input) {
    return api.sendMessage("─── • ⌈ ⚠️ ⌋ • ───\nحدّد اسم الأمر لعرض التفاصيل\nمثال: مساعدة اغاني\n─── • ⌈ 𖠂 ⌋ • ───", threadID, messageID);
  }

  // 2. البحث عن الأمر
  const command = commands.get(input.toLowerCase());

  if (!command) {
    return api.sendMessage(`── • ⌈ ✘ ⌋ • ──\nالأمر [ ${input} ] غير مدرج\n── • ⌈ 𖠂 ⌋ • ──`, threadID, messageID);
  }

  const config = command.config;

  // 3. عرض التفاصيل بالاستايل الهندسي الموحد
  let detailMsg = `─── • ⌈ 𖠂 ⌋ • ───\n`;
  detailMsg += `⚝ الاسـم: ${config.name}\n`;
  detailMsg += `⚝ الـفئة: ${config.commandCategory || "—"}\n`;
  detailMsg += `⚝ الـوصـف: ${config.description || "—"}\n`;
  detailMsg += `⚝ الـطـريـقة: ${config.usages || "—"}\n`;
  detailMsg += `⚝ الانـتظار: ${config.cooldowns || 1}s\n`;
  detailMsg += `⚝ الـمصدر: ${config.credits}\n`;
  detailMsg += `─── • ⌈ 𖠂 ⌋ • ───\n`;
  detailMsg += `[ ⚙︎ ڪايࢪوس ]`;

  return api.sendMessage(detailMsg, threadID, messageID);
};
