module.exports.config = {
  name: "اوامر",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر مقسمة على صفحتين فقط بالتنسيق الهندسي الحاد",
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
    "moduleInfo": "┝───「 %1 」\n\n نبذة: %2\n الاستخدام: %3\n الفئة: %4\n الانتظار: %5 ثانية\n الصلاحية: %6\n\n┝───「 %7 」",
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
  const image = (await axios.get(imgUrl, { responseType: "stream" })).data;

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    let totalCmds = 0;

    for (const [name, value] of commands) {
      const cat = value.config.commandCategory || "عام";
      // استثناء أوامر المطور لخصوصية النظام
      if (cat.toLowerCase().includes("مطور") || cat.toLowerCase().includes("dev")) continue;

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
      totalCmds++;
    }

    // منطق التقسيم لصفحتين فقط
    const allCats = Object.keys(categories).sort();
    const half = Math.ceil(allCats.length / 2); 
    
    const page = parseInt(args[0]) || 1;
    if (page < 1 || page > 2) 
      return api.sendMessage("⚠️ القائمة مقسمة إلى صفحتين فقط (1 أو 2).", threadID, messageID);

    const start = (page - 1) * half;
    const end = start + half;
    const displayedCats = allCats.slice(start, end);

    let blocks = [];
    for (let cat of displayedCats) {
      const cmds = categories[cat].sort();
      let block = `┝───「 ${cat.toUpperCase()} 」\n`;
      block += `│ › ${cmds.join(" ─ ")}\n`;
      block += `┝─────────────────◈`;
      blocks.push(block);
    }

    const msg = `
${blocks.join("\n\n")}

┝─────────────────╼
│ المجموع: ${totalCmds} أمر
│ الصفحة: [ ${page} / 2 ]
│ المطور: DANTE SPARDA
┝─────────────────╼
💡 استخدم ${prefix}اوامر [الاسم] للتفاصيل.`;

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
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
