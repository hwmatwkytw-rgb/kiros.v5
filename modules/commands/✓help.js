module.exports.config = {
  name: "اوامر",
  version: "1.4.6",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر ذكية بفلترة أوامر المطور",
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
    image = (await axios.get(imgUrl, { responseType: "stream" })).data;
  } catch (e) { image = null; }

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    let totalCmds = 0;

    for (const [name, value] of commands) {
      let cat = (value.config.commandCategory || "عامة").toLowerCase();

      // فلترة صارمة لأوامر المطورين (لن تظهر أبداً)
      if (cat.includes("مطور") || cat.includes("dev") || cat.includes("owner") || cat.includes("نظام المطور")) continue;
      
      let finalCat = value.config.commandCategory;
      // دمج الفئات الذكي
      if (cat.includes("لعب") || cat.includes("ترفيه") || cat.includes("تسلية")) finalCat = "التسلية والالعاب";
      else if (cat.includes("ادمن") || cat.includes("حماية") || cat.includes("نظام") || cat.includes("ادارة")) finalCat = "الادارة والحماية";
      else if (cat.includes("زكاء") || cat.includes("ai") || cat.includes("ذكاء")) finalCat = "تقنيات AI";
      else if (cat.includes("وسائط") || cat.includes("تحميل") || cat.includes("فيديو")) finalCat = "الوسائط والتحميل";
      else if (cat.includes("عام") || cat.includes("ادوات") || cat.includes("أدوات")) finalCat = "العامة والأدوات";

      if (!categories[finalCat]) categories[finalCat] = [];
      categories[finalCat].push(name);
      totalCmds++;
    }

    let blocks = [];
    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let block = `╮─── ⎔ 「 ${cat.toUpperCase()} 」\n`;
      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).join("  ─  ");
        block += `│ › ${row}\n`;
      }
      block += `╯────────── ⊞ ──────────╰`;
      blocks.push(block);
    }

    const page = parseInt(args[0]) || 1;
    const itemsPerPage = Math.ceil(blocks.length / 2); 
    const totalPages = 2;

    if (page < 1 || page > totalPages) 
      return api.sendMessage(`يا حبيبنا القائمة دي فيها صفحتين بس (1 أو 2).`, threadID, messageID);

    const start = (page - 1) * itemsPerPage;
    const displayedBlocks = blocks.slice(start, start + itemsPerPage).join("\n\n");

    const msg = `
╮────────── ⎔ ──────────╭
           Command
╯────────── ⎔ ──────────╰

${displayedBlocks}

╮────────── ⊞ ──────────╭
│ الأوامــر : ${totalCmds} | الصفحة: ${page}/${totalPages}
│ الـبـوت : ڪايࢪوس
│ الـمـطـور : DANTE SPARDA
│ اسـتـخــدم : ${prefix}${this.config.name} [اسم الأمر]
╯────────── ⊞ ──────────╰`;

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  // إذا بحث عن أمر مطور بالاسم، لن يعرض تفاصيله أيضاً زيادة في الأمان
  const checkCat = command.config.commandCategory.toLowerCase();
  if (checkCat.includes("مطور") || checkCat.includes("dev") || checkCat.includes("owner")) {
      return api.sendMessage("الأمر ده خاص بالمطورين فقط وما متاح للعرض.", threadID, messageID);
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
