module.exports.config = {
  name: "اوامر",
  version: "1.5.5",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر ذكية مقسمة على صفحتين فقط",
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
    "moduleInfo": "╮────────── ⎔ ──────────╭\n│ › الاسم ─ %1\n│ › الوصف ─ %2\n│ › الاستخدام ─ %3\n│ › الفئة ─ %4\n│ › الانتظار ─ %5 ثانية\n│ › الصلاحية ─ %6\n╯────────── ⊞ ──────────╰\n│ صـنـع بـواسطـة: %7",
    "user": "مستخدم",
    "adminGroup": "مشرف مجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const imgUrl = "https://i.ibb.co/HpgjQn4Y/1773583274989.png";
  let image;
  try {
    const response = await axios.get(imgUrl, { responseType: "stream" });
    image = response.data;
  } catch (e) { image = null; }

  const commandName = (args[0] || "").toLowerCase();
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!commands.has(commandName)) {
    const categories = {};
    let totalCmds = 0;

    for (const [name, value] of commands) {
      let cat = (value.config.commandCategory || "عامة").toLowerCase();
      if (cat.includes("مطور") || cat.includes("dev") || cat.includes("owner") || cat.includes("نظام المطور")) continue;
      
      let finalCat = value.config.commandCategory;
      if (cat.includes("لعب") || cat.includes("ترفيه") || cat.includes("تسلية") || cat.includes("ضحك") || cat.includes("بوس")) finalCat = "التسلية والالعاب";
      else if (cat.includes("ادمن") || cat.includes("حماية") || cat.includes("نظام") || cat.includes("ادارة")) finalCat = "الادارة والحماية";
      else if (cat.includes("زكاء") || cat.includes("ai") || cat.includes("ذكاء") || cat.includes("رسم")) finalCat = "تقنيات الذكاء";
      else if (cat.includes("وسائط") || cat.includes("تحميل") || cat.includes("فيديو") || cat.includes("اغاني")) finalCat = "الوسائط والتحميل";
      else finalCat = "الخدمات العامة";

      if (!categories[finalCat]) categories[finalCat] = [];
      categories[finalCat].push(name);
      totalCmds++;
    }

    let blocks = [];
    const sortedCats = Object.keys(categories).sort();
    for (let cat of sortedCats) {
      const cmds = categories[cat].sort();
      let block = `╮─── ⎔ 「 ${cat.toUpperCase()} 」\n`;
      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join("  ─  ");
        block += `│ › ${row}\n`;
      }
      block += `╯────────── ⊞ ──────────╰`;
      blocks.push(block);
    }

    // القفل على صفحتين فقط
    const totalPages = 2;
    const page = parseInt(args[0]) || 1;
    
    // حساب عدد البلوكات في كل صفحة (نصف المجموع)
    const itemsPerPage = Math.ceil(blocks.length / 2);

    if (page < 1 || page > totalPages) 
      return api.sendMessage(`قائمة الأوامر دي فيها صفحتين بس يا ملك ₍•᷄ - •᷅₎`, threadID, messageID);

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const displayedBlocks = blocks.slice(start, end).join("\n\n");

    const msg = `╮────────── ⎔ ──────────╭\n          KIRUS COMMANDS\n╯────────── ⎔ ──────────╰\n\n${displayedBlocks}\n\n╮────────── ⊞ ──────────╭\n│ الأوامــر : ${totalCmds} | الصفحة: ${page}/${totalPages}\n│ الـبـوت : ڪايࢪوس\n│ الـمـطـور : DANTE SPARDA\n│ اسـتـخــدم : ${prefix}${this.config.name} [اسم الأمر]\n╯────────── ⊞ ──────────╰`;

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  // تفاصيل الأمر الفردي
  const command = commands.get(commandName);
  if (command.config.commandCategory.toLowerCase().includes("مطور")) return api.sendMessage("ممنوع الاقتراب من أوامر المطور! ʕᵕ᷄-ᵕ᷅ʔ", threadID, messageID);

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
