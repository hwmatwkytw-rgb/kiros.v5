const { inspect } = require("util");

module.exports = {
  config: {
    name: "eval",
    version: "2.0.0",
    author: "Dante Sparda",
    role: 2,
    description: "تنفيذ برمجيات JavaScript فورية مع مخرجات متقدمة",
    category: "system",
    guide: "{pn} <code_to_execute>"
  },

  onStart: async function ({ api, event, args, Users, Threads, Currencies }) {
    // التحقق الصارم من معرف المطور
    const DEV_ID = "61581906898524";
    if (event.senderID !== DEV_ID) return;

    const code = args.join(" ");
    if (!code) return api.sendMessage("⚠️ يرجى إدخال الكود البرمجي للتنفيذ.", event.threadID);

    const startTime = Date.now();
    let output;

    try {
      // تنفيذ الكود مع توفير سياق كامل (api, event, args, إلخ)
      let evaled = await eval(code);

      // تحويل النتيجة إلى نص منسق إذا لم تكن نصاً
      if (typeof evaled !== "string") {
        output = inspect(evaled, { depth: 1 });
      } else {
        output = evaled;
      }

      const executionTime = Date.now() - startTime;

      // تنسيق المخرجات بأسلوب احترافي
      api.sendMessage(
        `⎔───  𝐄𝐗𝐄𝐂𝐔𝐓𝐈𝐎𝐍  ───⎔\n` +
        `📝 **المخرجات:**\n\`\`\`javascript\n${output}\n\`\`\`\n` +
        `⏱️ **الوقت:** ${executionTime}ms\n` +
        `╰────────── •`,
        event.threadID
      );

    } catch (err) {
      api.sendMessage(
        `⎔───  𝐄𝐑𝐑𝐎𝐑  ───⎔\n` +
        `❌ **فشل التنفيذ:**\n\`\`\`bash\n${err.message}\n\`\`\`\n` +
        `╰────────── •`,
        event.threadID
      );
    }
  }
};
