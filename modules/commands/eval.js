const { inspect } = require("util");
const { exec } = require("child_process");

module.exports.config = {
  name: "eval",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Dante Sparda",
  description: "بيئة تطوير متكاملة (JS + Shell) مع اختصارات ذكية",
  commandCategory: "المطور",
  usages: "[كود أو $أمر_نظام]",
  cooldowns: 0,
  dependencies: {
      "util": "",
      "child_process": ""
  }
};

module.exports.run = async function ({ api, event, args, Users, Threads, Currencies }) {
  const { threadID, messageID, senderID } = event;
  const DEV_ID = "61573334176409";
  if (senderID !== DEV_ID) return;

  const content = args.join(" ");
  if (!content) return api.sendMessage("⊞ يرجى إدخال كود أو أمر نظام ($)...", threadID, messageID);

  const startTime = Date.now();

  // --- [ ميزة تنفيذ أوامر النظام Shell ] ---
  if (content.startsWith("$")) {
    const shellCommand = content.slice(1).trim();
    exec(shellCommand, (error, stdout, stderr) => {
      const res = error ? stderr : stdout;
      return api.sendMessage(
        `⎔───  𝐒𝐇𝐄𝐋𝐋  ───⎔\n` +
        `📝 **Output:**\n\`\`\`bash\n${res || "Done (No Output)"}\n\`\`\`\n` +
        `╰────────── •`, threadID, messageID
      );
    });
    return;
  }

  // --- [ سياق الاختصارات الذكية ] ---
  const me = senderID;
  const chat = threadID;
  const bot = api;
  const reply = (msg) => api.sendMessage(typeof msg === "object" ? inspect(msg, { depth: 0 }) : String(msg), threadID, messageID);

  try {
    // تنفيذ الكود
    let evaled = await eval(content);
    const type = typeof evaled;
    
    // حساب استهلاك الذاكرة
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;

    if (typeof evaled !== "string") {
        evaled = inspect(evaled, { depth: 0 });
    }

    // تنظيف المخرجات من التوكنات
    const cleanOutput = evaled.replace(new RegExp(api.getAppState(), 'g'), "[ HIDDEN TOKEN ]");

    const output = `⎔───  𝐄𝐗𝐄𝐂𝐔𝐓𝐈𝐎𝐍  ───⎔\n` +
                   `⊞ **Type:** ${type}\n` +
                   `⊞ **RAM:** ${memory.toFixed(2)} MB\n` +
                   `📝 **Result:**\n\`\`\`javascript\n${cleanOutput}\n\`\`\`\n` +
                   `⏱️ **Time:** ${Date.now() - startTime}ms\n` +
                   `╰────────── •`;

    return api.sendMessage(output, threadID, messageID);

  } catch (err) {
    return api.sendMessage(
      `⎔───  𝐄𝐑𝐑𝐎𝐑  ───⎔\n` +
      `❌ **Failed:**\n\`\`\`bash\n${err.message}\n\`\`\`\n` +
      `╰────────── •`, threadID, messageID
    );
  }
};
