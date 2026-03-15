module.exports.config = {
  name: "اوامر",
  version: "1.4.1",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "قائمة أوامر بنظام الحواف المنحنية الرفيعة",
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

  // الرابط الجديد الذي زودتني به
  const imgUrl = "https://i.ibb.co/HpgjQn4Y/1773583274989.png";
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
│ اسـتـخــدم : ${prefix}${module.exports.config.name} [اسم الأمر]
╯────────── ⊞ ──────────╰`;

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
