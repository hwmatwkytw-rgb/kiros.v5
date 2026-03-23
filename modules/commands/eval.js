const { inspect } = require("util");

module.exports.config = {
  name: "eval",
  version: "2.1.0",
  hasPermssion: 2, // للمطورين فقط
  credits: "Dante Sparda",
  description: "تنفيذ كود JavaScript مباشر وتجربة الوظائف برمجياً",
  commandCategory: "المطور",
  usages: "[كود البرمجة]",
  cooldowns: 0,
  dependencies: {
      "util": ""
  }
};

module.exports.run = async function ({ api: bot, event, args, Users, Threads, Currencies }) {
  const { threadID, messageID, senderID } = event;
  
  // التحقق من الهوية (ID الخاص بك)
  const DEV_ID = "61581906898524";
  if (senderID !== DEV_ID) return;

  const code = args.join(" ");
  if (!code) {
    return bot.sendMessage("⚠️ يرجى كتابة الكود البرمجي المراد تنفيذه.", threadID, messageID);
  }

  const startTime = Date.now();

  try {
    // تنفيذ الكود مع دعم الـ await وتوفير السياق البرمجي
    let evaled = await eval(code);

    // معالجة النتيجة لتظهر بشكل نصي واضح
    if (typeof evaled !== "string") {
      evaled = inspect(evaled, { depth: 1 });
    }

    const executionTime = Date.now() - startTime;

    const output = `⎔───  𝐄𝐗𝐄𝐂𝐔𝐓𝐈𝐎𝐍  ───⎔\n` +
                   `📝 **المخرجات:**\n\`\`\`javascript\n${evaled}\n\`\`\`\n` +
                   `⏱️ **الوقت:** ${executionTime}ms\n` +
                   `╰────────── •`;

    return bot.sendMessage(output, threadID, messageID);

  } catch (err) {
    const errorOutput = `⎔───  𝐄𝐑𝐑𝐎𝐑  ───⎔\n` +
                        `❌ **فشل التنفيذ:**\n\`\`\`bash\n${err.message}\n\`\`\`\n` +
                        `╰────────── •`;
                        
    return bot.sendMessage(errorOutput, threadID, messageID);
  }
};
