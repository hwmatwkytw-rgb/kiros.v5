module.exports.config = {
  name: "اوامر",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة الأوامر بنظام الفئات المدمجة - نسخة دانتي",
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
    "moduleInfo": "「 %1 」\n%2\n\n❯ الاستخدام: %3\n❯ الفئة: %4\n❯ وقت الانتظار: %5 ثانية\n❯ الصلاحية: %6\n\n» بواسطة: %7 «",
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
    const response = await axios.get(imgUrl, { responseType: "stream" });
    image = response.data;
  } catch (e) { image = null; }

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    const mergeMap = {
      "ترفية": "الترفيه والوسائط",
      "خدمات": "الترفيه والوسائط",
      "وسائط": "الترفيه والوسائط",
      "العاب": "الألعاب والتسلية",
      "ذكاء صناعي": "الذكاء الاصطناعي",
      "حماية": "الحماية والمجموعة",
      "مجموعة": "الحماية والمجموعة",
      "نظام": "النظام العامة",
      "عام": "النظام العامة"
    };

    for (let [name, value] of commands) {
      const catOrig = value.config.commandCategory || "عام";
      if (catOrig.toLowerCase() === "مطور" || catOrig.toLowerCase() === "المطور") continue;

      const cat = mergeMap[catOrig] || "أخرى";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let blocks = [];
    let count = 0;

    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let block = `╮─── ▽ 「 ${cat} 」\n`;

      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join("  ○  ");
        block += `│  ▱  ${row}\n`;
        count += cmds.slice(i, i + 3).length;
      }

      block += `╯────────────── 🝓`;
      blocks.push(block.trim());
    }

    const totalPages = 2;
    const perPage = Math.ceil(blocks.length / totalPages);
    const page = parseInt(args[0]) || 1;

    if (page < 1 || page > totalPages)
      return api.sendMessage(`⚠️ القائمة تتكون من ${totalPages} صفحات فقط.`, threadID, messageID);

    const start = (page - 1) * perPage;
    const finalBlocks = blocks.slice(start, start + perPage).join("\n\n");

    const msg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖫 𝖨 𝖲 𝖳
╯─────── 🝓 ───────╰

${finalBlocks}

╮─────── 🝓 ───────╭
│ ⌑ الأوامر : ${count} | الصفحة : ${page}/${totalPages}
│ ⌑ المطور : DANTE
│ ⌑ استخدم : ${prefix}اوامر [اسم الأمر]
╯─────── 🝓 ───────╰`;

    return api.sendMessage(
      { body: msg, attachment: image },
      threadID
    );
  }

  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
      command.config.commandCategory,
      command.config.cooldowns,
      (command.config.hasPermssion == 0)
        ? getText("user")
        : (command.config.hasPermssion == 1)
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};
