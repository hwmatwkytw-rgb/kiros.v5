module.exports.config = {
  name: "اوامر",
  version: "1.3.5",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة الأوامر المدمجة - العدد الحقيقي - صفحة واحدة",
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
    const totalCommands = commands.size; // جلب العدد الحقيقي للأوامر المحملة في البوت

    const mergeMap = {
      "حماية": "الحماية والادارة", "مجموعة": "الحماية والادارة", "ادارة": "الحماية والادارة", "إدارة": "الحماية والادارة", "حمايه": "الحماية والادارة",
      "ترفية": "الخدمات والوسائط", "ترفيه": "الخدمات والوسائط", "خدمات": "الخدمات والوسائط", "وسائط": "الخدمات والوسائط", "أدوات": "الخدمات والوسائط", "ادوات": "الخدمات والوسائط",
      "العاب": "الالعاب والتسلية والاقتصاد", "لعبة": "الالعاب والتسلية والاقتصاد", "تسلية": "الالعاب والتسلية والاقتصاد", "اقتصاد": "الالعاب والتسلية والاقتصاد", "فلوس": "الالعاب والتسلية والاقتصاد",
      "ذكاء صناعي": "الذكاء الاصطناعي", "ذكاء": "الذكاء الاصطناعي", "ai": "الذكاء الاصطناعي", "الذكاء": "الذكاء الاصطناعي",
      "نظام": "النظام العامة", "عام": "النظام العامة", "البوت": "النظام العامة"
    };

    for (let [name, value] of commands) {
      let cat;
      const catOrig = (value.config.commandCategory || "عام").trim();

      if (catOrig.toLowerCase() === "مطور" || catOrig.toLowerCase() === "المطور" || catOrig.toLowerCase() === "dev") {
        cat = "قـائـمـة الـمـطـور";
      } 
      else if (mergeMap[catOrig]) {
        cat = mergeMap[catOrig];
      }
      else {
        cat = catOrig;
      }
      
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    let blocks = [];
    const keys = Object.keys(categories).sort((a, b) => {
      if (a === "قـائـمـة الـمـطـور") return -1;
      if (b === "قـائـمـة الـمـطـور") return 1;
      return a.localeCompare(b);
    });

    for (let cat of keys) {
      const cmds = categories[cat].sort();
      let block = `╮─── ▽ 「 ${cat} 」\n`;

      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join("  ○  ");
        block += `│  ▱  ${row}\n`;
      }

      block += `╯────────────── 🝓`;
      blocks.push(block.trim());
    }

    const finalBlocks = blocks.join("\n\n");

    const msg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖫 𝖨 𝖲 𝖳
╯─────── 🝓 ───────╰

${finalBlocks}

╮─────── 🝓 ───────╭
│ ⌑ الأوامر : ${totalCommands} 
│ ⌑ المطور : DANTE
│ ⌑ استخدم : ${prefix}اوامر [اسم الأمر]
╯─────── 🝓 ───────╰`;

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
