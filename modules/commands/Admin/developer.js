const fs = require('fs-extra');
const path = require('path');
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "مطور",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "N-Dora Team",
  description: "أوامر تطوير وإدارة البوت",
  commandCategory: "مطور",
  usages: "[الأمر] [المعاملات]",
  cooldowns: 0,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "noPermission": "عذراً، ليس لديك صلاحية لاستخدام هذا الأمر",
    "invalidCommand": "أمر غير صحيح",
    "success": "تم تنفيذ الأمر بنجاح",
    "error": "حدث خطأ أثناء تنفيذ الأمر",
    "stats": "إحصائيات البوت",
    "commands": "عدد الأوامر",
    "uptime": "وقت التشغيل",
    "memory": "استخدام الذاكرة",
    "users": "عدد المستخدمين",
    "threads": "عدد المجموعات"
  },
  "en": {
    "noPermission": "Sorry, you don't have permission to use this command",
    "invalidCommand": "Invalid command",
    "success": "Command executed successfully",
    "error": "An error occurred while executing the command",
    "stats": "Bot Statistics",
    "commands": "Number of Commands",
    "uptime": "Uptime",
    "memory": "Memory Usage",
    "users": "Number of Users",
    "threads": "Number of Groups"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID, senderID } = event;
  const command = args[0]?.toLowerCase();

  // Check admin permission
  const adminList = global.config.ADMINBOT || [];
  if (!adminList.includes(senderID)) {
    return api.sendMessage(
      formatter.error(getText("noPermission")),
      threadID,
      messageID
    );
  }

  try {
    switch (command) {
      case 'إحصائيات':
      case 'stats':
        return handleStats(api, threadID, messageID, getText);

      case 'أوامر':
      case 'commands':
        return handleCommands(api, threadID, messageID, getText);

      case 'مسح':
      case 'clear':
        return handleClear(api, threadID, messageID, getText);

      case 'إعادة_تشغيل':
      case 'restart':
        return handleRestart(api, threadID, messageID, getText);

      case 'حالة':
      case 'status':
        return handleStatus(api, threadID, messageID, getText);

      default:
        return api.sendMessage(
          formatter.error(getText("invalidCommand")),
          threadID,
          messageID
        );
    }
  } catch (error) {
    console.error('Developer Command Error:', error);
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
};

async function handleStats(api, threadID, messageID, getText) {
  const { commands } = global.client;
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  const stats = `
${formatter.header(getText("stats"))}
${formatter.emojis.gear} ${getText("commands")}: ${commands.size}
${formatter.emojis.hourglass} ${getText("uptime")}: ${formatUptime(uptime)}
${formatter.emojis.brain} ${getText("memory")}: ${formatter.formatSize(memoryUsage.heapUsed)} / ${formatter.formatSize(memoryUsage.heapTotal)}
${formatter.emojis.user} ${getText("users")}: ${global.data.allUserID?.length || 0}
${formatter.emojis.users} ${getText("threads")}: ${global.data.allThreadID?.length || 0}
${formatter.borders.simple}
  `;

  return api.sendMessage(stats, threadID, messageID);
}

async function handleCommands(api, threadID, messageID, getText) {
  const { commands } = global.client;
  const categories = {};

  // Group commands by category
  for (const [name, cmd] of commands) {
    const category = cmd.config.commandCategory || 'أخرى';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(name);
  }

  let msg = `${formatter.header('قائمة الأوامر')}\n`;

  for (const [category, cmds] of Object.entries(categories)) {
    msg += `\n${formatter.emojis.folder} ${category} (${cmds.length})\n`;
    msg += formatter.bulletList(cmds.slice(0, 10));
    if (cmds.length > 10) {
      msg += `\n${formatter.emojis.arrow_right} و${cmds.length - 10} أوامر أخرى...`;
    }
  }

  msg += `\n\n${formatter.borders.simple}`;
  msg += `\nإجمالي الأوامر: ${commands.size}`;

  return api.sendMessage(msg, threadID, messageID);
}

async function handleClear(api, threadID, messageID, getText) {
  const cacheDir = path.join(global.client.mainPath, 'cache');
  
  try {
    if (fs.existsSync(cacheDir)) {
      const files = fs.readdirSync(cacheDir);
      let cleared = 0;

      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          cleared++;
        }
      }

      return api.sendMessage(
        formatter.success(getText("success"), `تم مسح ${cleared} ملف من الذاكرة المؤقتة`),
        threadID,
        messageID
      );
    }
  } catch (error) {
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
}

async function handleRestart(api, threadID, messageID, getText) {
  const msg = await api.sendMessage(
    formatter.loading('جاري إعادة تشغيل البوت...'),
    threadID
  );

  setTimeout(() => {
    process.exit(1);
  }, 2000);

  return msg;
}

async function handleStatus(api, threadID, messageID, getText) {
  const status = `
${formatter.header('حالة البوت')}
${formatter.status('online', 'البوت يعمل بشكل طبيعي')}
${formatter.emojis.rocket} الإصدار: ${global.config.version || '2.0.0'}
${formatter.emojis.calendar} التاريخ: ${new Date().toLocaleString('ar-SA')}
${formatter.borders.simple}
  `;

  return api.sendMessage(status, threadID, messageID);
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}يوم ${hours}س ${minutes}د ${secs}ث`;
}

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events
};
