module.exports.config = {
  name: "اوامر",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر بنظام الحواف الهندسية الرفيعة",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 20
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": "┝───「 %1 」\n│ › الوصف ─ %2\n│ › الاستخدام ─ %3\n│ › الفئة ─ %4\n│ › الانتظار ─ %5 ثانية\n│ › الصلاحية ─ %6\n┝───「 %7 」",
    "user": "مستخدم",
    "adminGroup": "مشرف مجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const imgUrl = "https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg";
  let image;
  try {
    image = (await axios.get(imgUrl, { responseType: "stream" })).data;
  } catch (e) {
    image = null;
  }

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    let totalCmds = 0;

    for (const [name, value] of commands) {
      const cat = value.config.commandCategory || "عام";
      if (cat.toLowerCase().includes("مطور") || cat.toLowerCase().includes("dev")) continue;

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      totalCmds++;
    }

    let blocks = [];
    for (let cat in categories) {
      const cmds = categories[cat].sort();
      // تطبيق الاستايل الهندسي الرفيع هنا
      let block = `┝───「 ${cat.toUpperCase()} 」\n`;
      
      // تقسيم الأوامر إلى أسطر، كل سطر يحتوي على 3 أوامر لضمان التناسق
      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join(" ─ ");
        block += `│ › ${row}\n`;
      }
      
      block += `┝─────────────────◈`;
      blocks.push(block);
    }

    const page = parseInt(args[0]) || 1;
    const itemsPerPage = 5; 
    const totalPages = Math.ceil(blocks.length / itemsPerPage);

    if (page < 1 || page > totalPages) 
      return api.sendMessage(`⚠️ القائمة تحتوي على ${totalPages} صفحات فقط.`, threadID, messageID);

    const start = (page - 1) * itemsPerPage;
    const displayedBlocks = blocks.slice(start, start + itemsPerPage).join("\n\n");

    const msg = `
${displayedBlocks}

──────────────────
📌 المجموع: ${totalCmds} أمر | الصفحة: ${page}/${totalPages}
💡 استخدم ${prefix}${module.exports.config.name} [اسم الأمر] للتفاصيل.

⇨ المطور: DANTE SPARDA
──────────────────`;

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name.toUpperCase(),
      command.config.description,
      `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
      command.config.commandCategory,
      command.config.cooldowns,
      (command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};
