module.exports.config = {
  name: "اوامر",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة الأوامر المدمجة - النسخة النهائية المنظمة",
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

  // الرابط المباشر الجديد الذي زودتني به
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

    // قائمة الحظر (الأوامر التي لن تظهر ولن تُحسب)
    const devBlacklist = ["shell", "cmd", "setdata", "out", "getid", "admin", "رست", "صيانة", "نظام", "جافا", "حقن", "مغادرةالكل", "مطور", "المطور", "dev", "System", "المنظومة"];

    // خريطة الدمج الشاملة لضمان الترتيب الصحيح
    const mergeMap = {
      // 1. الحماية والإدارة
      "حماية": "الحماية والادارة", "مجموعة": "الحماية والادارة", "ادارة": "الحماية والادارة", "إدارة": "الحماية والادارة", "الادمن": "الحماية والادارة", "المجموعة": "الحماية والادارة", "الحماية": "الحماية والادارة", "مشرف": "الحماية والادارة", "تفاعل": "الحماية والادارة",
      // 2. الخدمات والوسائط والأدوات
      "خدمات": "الخدمات والوسائط", "وسائط": "الخدمات والوسائط", "الخدمات": "الخدمات والوسائط", "الوسائط": "الخدمات والوسائط", "أدوات": "الخدمات والوسائط", "ادوات": "الخدمات والوسائط", "الأدوات": "الخدمات والوسائط", "tools": "الخدمات والوسائط", "الصوتيات": "الخدمات والوسائط", "الصور": "الخدمات والوسائط", "صور": "الخدمات والوسائط", "الوسائط والتحميل": "الخدمات والوسائط", "أدوات": "الخدمات والوسائط", "تيك": "الخدمات والوسائط", "فيس": "الخدمات والوسائط",
      // 3. الألعاب والتسلية والترفيه والاقتصاد
      "العاب": "الالعاب والتسلية والاقتصاد", "لعبة": "الالعاب والتسلية والاقتصاد", "تسلية": "الالعاب والتسلية والاقتصاد", "اقتصاد": "الالعاب والتسلية والاقتصاد", "الالعاب الرمضانية الكبرى": "الالعاب والتسلية والاقتصاد", "ألعاب": "الالعاب والتسلية والاقتصاد", "الاموال": "الالعاب والتسلية والاقتصاد", "الترفيه": "الالعاب والتسلية والاقتصاد", "مرح": "الالعاب والتسلية والاقتصاد", "تفاعل": "الالعاب والتسلية والاقتصاد", "رهان": "الالعاب والتسلية والاقتصاد", "فلوس": "الالعاب والتسلية والاقتصاد",
      // 4. الأفلام والأنمي
      "افلام": "الأفلام والأنمي", "انمي": "الأفلام والأنمي", "فلم": "الأفلام والأنمي", "مانهوا": "الأفلام والأنمي", "مسلسلات": "الأفلام والأنمي", "مانجا": "الأفلام والأنمي",
      // 5. النظام والذكاء الاصطناعي
      "نظام": "النظام العامة", "عام": "النظام العامة", "النظام": "النظام العامة", "النظام العامة": "النظام العامة", "System": "النظام العامة", "ذكاء صناعي": "الذكاء الاصطناعي", "ai": "الذكاء الاصطناعي", "الذكاء": "الذكاء الاصطناعي",
      // 6. الثقافة والدين
      "ثقافة": "الإسلاميات والثقافة", "دين": "الإسلاميات والثقافة", "حكمة": "الإسلاميات والثقافة", "مواقيت": "الإسلاميات والثقافة", "قران": "الإسلاميات والثقافة"
    };

    for (let [name, value] of commands) {
      const catOrig = (value.config.commandCategory || "عام").trim();

      // تخطي أوامر المطور تماماً
      if (devBlacklist.includes(name.toLowerCase()) || devBlacklist.includes(catOrig)) {
        continue; 
      }

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
│ ⌑ الأوامر : ${totalPublicCommands} 
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
