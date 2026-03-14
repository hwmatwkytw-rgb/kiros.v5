const formatter = require('../utils/formatter');

module.exports.config = {
  name: "اوامر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "عرض قائمة الأوامر الكاملة مع التفاصيل",
  commandCategory: "النظام",
  usages: "[اسم الأمر]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 300
  }
};

module.exports.languages = {
  "ar": {
    "moduleInfo": `${formatter.header('معلومات الأمر')}
${formatter.emojis.message} الاسم: %1
${formatter.emojis.info} الوصف: %2
${formatter.emojis.gear} الاستخدام: %3
${formatter.emojis.folder} الفئة: %4
${formatter.emojis.hourglass} المهلة الزمنية: %5 ثانية
${formatter.emojis.lock} الصلاحية: %6
${formatter.emojis.star} المطور: %7
${formatter.borders.simple}`,
    "helpList": `${formatter.header('قائمة الأوامر')}
${formatter.emojis.rocket} يوجد %1 أمر متاح في البوت!
${formatter.emojis.info} استخدم: "%2اوامر [اسم الأمر]" لمعرفة تفاصيل الأمر
${formatter.borders.simple}`,
    "user": `${formatter.emojis.user} مستخدم عادي`,
    "adminGroup": `${formatter.emojis.crown} مسؤول المجموعة`,
    "adminBot": `${formatter.emojis.diamond} مسؤول البوت`,
    "pageInfo": `الصفحة: %1/%2`,
    "totalCommands": `إجمالي الأوامر: %1`
  },
  "en": {
    "moduleInfo": `${formatter.header('Command Information')}
${formatter.emojis.message} Name: %1
${formatter.emojis.info} Description: %2
${formatter.emojis.gear} Usage: %3
${formatter.emojis.folder} Category: %4
${formatter.emojis.hourglass} Cooldown: %5 seconds
${formatter.emojis.lock} Permission: %6
${formatter.emojis.star} Developer: %7
${formatter.borders.simple}`,
    "helpList": `${formatter.header('Commands List')}
${formatter.emojis.rocket} There are %1 available commands in the bot!
${formatter.emojis.info} Use: "%2help [command name]" to see command details
${formatter.borders.simple}`,
    "user": `${formatter.emojis.user} Regular User`,
    "adminGroup": `${formatter.emojis.crown} Group Admin`,
    "adminBot": `${formatter.emojis.diamond} Bot Admin`,
    "pageInfo": `Page: %1/%2`,
    "totalCommands": `Total Commands: %1`
  }
};

module.exports.handleEvent = function ({ api, event, getText }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;

  if (!body || typeof body !== "string" || body.indexOf("اوامر") !== 0) return;
  
  const splitBody = body.slice(body.indexOf("اوامر")).trim().split(/\s+/);
  if (splitBody.length === 1 || !commands.has(splitBody[1].toLowerCase())) return;

  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const command = commands.get(splitBody[1].toLowerCase());
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  const info = getText("moduleInfo",
    command.config.name,
    command.config.description,
    `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
    command.config.commandCategory,
    command.config.cooldowns,
    ((command.config.hasPermssion === 0) ? getText("user") :
      (command.config.hasPermssion === 1) ? getText("adminGroup") : getText("adminBot")),
    command.config.credits
  );

  return api.sendMessage(info, threadID, messageID);
};

module.exports.run = function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  if (!command) {
    // Show all commands with pagination
    const arrayInfo = [];
    const page = parseInt(args[0]) || 1;
    const itemsPerPage = 15;

    for (const [name] of commands) {
      arrayInfo.push(name);
    }

    arrayInfo.sort();

    const totalPages = Math.ceil(arrayInfo.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCommands = arrayInfo.slice(startIndex, endIndex);

    let msg = getText("helpList", commands.size, prefix);
    msg += "\n\n";

    // Group by category
    const categories = {};
    for (const cmdName of pageCommands) {
      const cmd = commands.get(cmdName);
      const category = cmd.config.commandCategory || "أخرى";
      
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(cmdName);
    }

    for (const [category, cmds] of Object.entries(categories)) {
      msg += `${formatter.emojis.folder} ${category}\n`;
      cmds.forEach((cmd, index) => {
        msg += formatter.listItem(index + 1, cmd, `${index + 1}️⃣`);
        msg += "\n";
      });
      msg += "\n";
    }

    msg += formatter.borders.simple + "\n";
    msg += `${formatter.emojis.info} ${getText("pageInfo", page, totalPages)}\n`;
    msg += `${formatter.emojis.rocket} ${getText("totalCommands", commands.size)}\n`;
    msg += `${formatter.emojis.gear} البادئة: ${prefix}`;

    return api.sendMessage(msg, threadID, async (error, info) => {
      if (error) return;
      
      const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
      if (autoUnsend) {
        await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
        return api.unsendMessage(info.messageID);
      }
    });
  }

  // Show specific command info
  const info = getText("moduleInfo",
    command.config.name,
    command.config.description,
    `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
    command.config.commandCategory,
    command.config.cooldowns,
    ((command.config.hasPermssion === 0) ? getText("user") :
      (command.config.hasPermssion === 1) ? getText("adminGroup") : getText("adminBot")),
    command.config.credits
  );

  return api.sendMessage(info, threadID, messageID);
};
