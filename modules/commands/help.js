module.exports.config = {
  name: "اوامر",
  version: "1.2.5",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة الأوامر بنظام الفئات المدمجة - النسخة الكاملة",
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
    
    // الأوامر المحصورة للمطور فقط
    const devCommands = ["shell", "cmd", "setdata", "out", "getid", "admin"];

    // خريطة دمج بقية الفئات لضمان التنسيق
    const mergeMap = {
      "ترفية": "الترفيه والوسائط", "ترفيه": "الترفيه والوسائط", "خدمات": "الترفيه والوسائط", "وسائط": "الترفيه والوسائط",
      "العاب": "الألعاب والتسلية", "لعبة": "الألعاب والتسلية",
      "ذكاء صناعي": "الذكاء الاصطناعي", "ذكاء": "الذكاء الاصطناعي", "ai": "الذكاء الاصطناعي",
      "حماية": "الحماية والمجموعة", "مجموعة": "الحماية والمجموعة", "ادارة": "الحماية والمجموعة",
      "نظام": "النظام العامة", "عام": "النظام العامة"
    };

    for (let [name, value] of commands) {
      let cat;
      const catOrig = (value.config.commandCategory || "عام").trim();

      // 1. فحص فئة المطور أولاً
      if (devCommands.includes(name.toLowerCase()) || catOrig.toLowerCase() === "مطور" || catOrig.toLowerCase() === "المطور") {
        cat = "قـائـمـة الـمـطـور";
      } 
      // 2. دمج الفئات العامة بناءً على الخريطة
      else if (mergeMap[catOrig]) {
        cat = mergeMap[catOrig];
      }
      // 3. إذا لم تكن في الخريطة، استخدم الاسم الأصلي (بدل كلمة أخرى)
      else {
        cat = catOrig;
      }
      
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let blocks = [];
    let count = 0;
    // ترتيب الفئات (قائمة المطور تظهر دائماً في البداية أو النهاية حسب الترتيب)
    const sortedCats = Object.keys(categories).sort();

    for (let cat of sortedCats) {
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

    // تقسيم عادل: 4 فئات كحد أقصى في كل صفحة
    const perPage = 4;
    const totalPages = Math.ceil(blocks.length / perPage);
    let page = parseInt(args[0]) || 1;
    if (page < 1 || page > totalPages) page = 1;

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

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  // الجزء الخاص بعرض تفاصيل أمر واحد
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
