module.exports.config = {
  name: "اوامر",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "قائمة الأوامر بالاستايل الملكي مع فلترة المطور",
  commandCategory: "نظام",
  usages: "[رقم الصفحة]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 20
  }
};

module.exports.languages = {
  "ar": {
    "moduleInfo": "💎 ¦ مـعـلـومـات الأمـر\n⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n\n🏷️ الاسـم: [ %1 ]\n📝 الـوصـف: %2\n\n🚀 الاسـتخدام: %3\n📂 الـفـئة: %4\n⏳ الانـتظار: %5 ثانية\n🔒 الإذن: %6\n\n👤 الـمطور: ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ\n⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼",
    "user": "مستخدم عادي",
    "adminGroup": "إدمن المجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID, senderID } = event;

  // معرف المطور الخاص بك للفلترة
  const devID = "61581906898524";
  const isDeveloper = (senderID == devID);

  const image = (await axios.get(
    "https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg",
    { responseType: "stream" }
  )).data;

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    const categories = {};
    for (let [name, value] of commands) {
      // إخفاء أوامر المطور عن الغرباء
      if (value.config.commandCategory === "مطور" && !isDeveloper) continue;
      
      const cat = value.config.commandCategory || "عام";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    const categoryMap = {
      "نظام": "⚙️ ¦ الـنـظـام",
      "ترفية": "🎭 ¦ الـتـرفـيـه",
      "اقتصاد": "💰 ¦ الاقـتـصـاد",
      "العاب": "🎮 ¦ الألـعـاب",
      "ذكاء صناعي": "🤖 ¦ الـذكاء الاصطناعي",
      "مطور": "🛠️ ¦ المطور",
      "عام": "📌 ¦ عــــام"
    };

    let blocks = [];
    let count = 0;

    for (let cat in categories) {
      const cmds = categories[cat].sort();
      let block = `📂 الـقـسـم: ${categoryMap[cat] || cat}\n──────────────\n`;

      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).map(c => `◈ ${c}`).join("    ");
        block += `${row}\n`;
        count += cmds.slice(i, i + 3).length;
      }
      blocks.push(block.trim());
    }

    const totalPages = 3; // تثبيت عدد الصفحات على 3
    const perPage = Math.ceil(blocks.length / totalPages);
    const page = parseInt(args[0]) || 1;

    if (page < 1 || page > totalPages)
      return api.sendMessage(`⚠️ اختر صفحة بين 1 و ${totalPages}`, threadID, messageID);

    const start = (page - 1) * perPage;
    const finalBlocks = blocks.slice(start, start + perPage).join("\n\n");

    const msg = `⌬ ───「 ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ 」─── ⌬\n\n${finalBlocks}\n\n──────────────\n📊 الأوامر: [ ${count} ]  |  📑 الصفحة: [ ${page} / ${totalPages} ]\n💡 استخدم: ${prefix}اوامر [اسم الأمر] للتفاصيل\nاللهم صلِّ وسلم على سيدنا محمد 🍂🤍`;

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
      (command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")
    ),
    threadID,
    messageID
  );
};
