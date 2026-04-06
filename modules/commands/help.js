module.exports.config = {
  name: "اوامر",
  version: "1.8.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر كايروس - نسخة الأقسام المصفاة",
  commandCategory: "نظام",
  usages: "[اسم الأمر]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 20
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": "╭─── 𖦆 𝐈𝐍𝐅𝐎 𖦆 ───╮\n┃ ⚬ الأمـر: %1\n┃ ⚬ الوصف: %2\n┃ ⚬ الاستخدام: %3\n┃ ⚬ الفئة: %4\n┃ ⚬ الانتظار: %5 ثانية\n┃ ⚬ الصلاحية: %6\n┃ ⚬ المصدر: %7\n╰──────────────────╯",
    "user": "مستخدم",
    "adminGroup": "مشرف مجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const imgUrl = "https://i.postimg.cc/T2bF4SNQ/1773583274989.png";
  let image;
  try {
    const response = await axios.get(imgUrl, { responseType: "stream" });
    image = response.data;
  } catch (e) { image = null; }

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    let totalPublicCommands = 0;

    const devBlacklist = ["shell", "cmd", "setdata", "out", "getid", "admin", "رست", "صيانة", "نظام", "جافا", "حقن", "مغادرةالكل", "مطور", "المطور", "dev", "System", "المنظومة"];

    const mergeMap = {
      "أدوات الصور": "أدوات الـصـور",
      "صور": "أدوات الـصـور",
      "الأفلام والأنمي": "الـأنـمـي والـأفـلام",
      "افلام": "الـأنـمـي والـأفـلام",
      "انمي": "الـأنـمـي والـأفـلام",
      "الإدارة": "الـإدارة والـحـماية",
      "الحماية والادارة": "الـإدارة والـحـماية",
      "الإسلاميات والثقافة": "الـإسـلامـيـات",
      "الالعاب والتسلية والاقتصاد": "الـألـعـاب والـتـسـلـيـة",
      "ترفيه": "الـألـعـاب والـتـسـلـيـة",
      "ترفية": "الـألـعـاب والـتـسـلـيـة",
      "الخدمات والوسائط": "الـوسـائط والـخـدمـات",
      "الذكاء الصناعي": "الـذكاء الـاصـطـناعي",
      "النظام العامة": "الـنـظام والـحـالة"
    };

    for (let [name, value] of commands) {
      const catOrig = (value.config.commandCategory || "عام").trim();
      if (devBlacklist.includes(name.toLowerCase()) || devBlacklist.includes(catOrig)) continue; 

      let cat = mergeMap[catOrig] || catOrig;
      if (!categories[cat]) categories[cat] = [];
      if (!categories[cat].includes(name)) {
        categories[cat].push(name);
        totalPublicCommands++;
      }
    }

    let blocks = [];
    const keys = Object.keys(categories).sort();

    for (let cat of keys) {
      const cmds = categories[cat].sort();
      let block = `╭── ▽ 「 ${cat} 」\n`;
      
      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join("  ⚬  ");
        block += `┃  ⚬  ${row}\n`;
      }

      block += `╰────────────── 🝓`;
      blocks.push(block.trim());
    }

    const finalBlocks = blocks.join("\n\n");

    const msg = `╭─────── 𖦆 ───────╮\n    𝐊 𝐀 𝐈 𝐑 𝐔 𝐒   𝐋 𝐈 𝐒 𝐓\n╰─────── 𖦆 ───────╯\n\n${finalBlocks}\n\n╭─── 𖦆 𝐈𝐍𝐅𝐎 𖦆 ───╮\n┃ ⌑ الأوامر : ${totalPublicCommands} \n┃ ⌑ المطور : DANTE\n┃ ⌑ استخدم : ${prefix}اوامر [الأمر]\n╰──────────────────╯`;

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
      (command.config.hasPermssion == 0) ? "مستخدم" : (command.config.hasPermssion == 1) ? "مشرف" : "مطور",
      command.config.credits
    ),
    threadID,
    messageID
  );
};
