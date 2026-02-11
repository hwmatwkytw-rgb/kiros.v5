module.exports.config = {
  name: "اوامر",
  version: "1.3.5",
  hasPermssion: 0,
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "قائمة الأوامر الملكية - صفحتين - فلترة ودمج ذكي",
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
  const { threadID, messageID } = event;

  const image = (await axios.get(
    "https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg",
    { responseType: "stream" }
  )).data;

  const command = commands.get((args[0] || "").toLowerCase());
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!command) {
    let categories = {};
    let miscCommands = [];

    // 1. تجميع الأوامر وفلترة قسم المطور نهائياً
    for (let [name, value] of commands) {
      const config = value.config;
      const cat = config.commandCategory || "عام";

      // تجاهل فئة المطور تماماً للجميع
      if (cat.toLowerCase().includes("مطور") || cat.toLowerCase().includes("dev")) continue;
      
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    // 2. منطق الدمج للفئات التي تحتوي على أمرين أو أقل
    let finalCategories = {};
    for (let cat in categories) {
      if (categories[cat].length <= 2) {
        miscCommands.push(...categories[cat]);
      } else {
        finalCategories[cat] = categories[cat];
      }
    }
    if (miscCommands.length > 0) finalCategories["أوامر متنوعة"] = miscCommands;

    const categoryMap = {
      "نظام": "⚙️ ¦ الـنـظـام",
      "ترفية": "🎭 ¦ الـتـرفـيـه",
      "اقتصاد": "💰 ¦ الاقـتـصـاد",
      "العاب": "🎮 ¦ الألـعـاب",
      "ذكاء صناعي": "🤖 ¦ الـذكاء الاصطناعي",
      "أوامر متنوعة": "✨ ¦ مـتـنـوعـات",
      "عام": "📌 ¦ عــــام"
    };

    let blocks = [];
    let count = 0;

    // 3. بناء كتل الأقسام
    for (let cat in finalCategories) {
      const cmds = finalCategories[cat].sort();
      let block = `📂 الـقـسـم: ${categoryMap[cat] || cat}\n──────────────\n`;

      for (let i = 0; i < cmds.length; i += 3) {
        const row = cmds.slice(i, i + 3).map(c => `◈ ${c}`).join("    ");
        block += `${row}\n`;
        count += cmds.slice(i, i + 3).length;
      }
      blocks.push(block.trim());
    }

    // 4. تقسيم الأوامر على صفحتين فقط
    const totalPages = 2;
    const perPage = Math.ceil(blocks.length / totalPages);
    const page = parseInt(args[0]) || 1;

    if (page < 1 || page > totalPages)
      return api.sendMessage(`⚠️ القائمة تتكون من ${totalPages} صفحات فقط. اختر صفحة صحيحة.`, threadID, messageID);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const finalBlocks = blocks.slice(start, end).join("\n\n");

    const msg = `⌬ ───「 ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ 」─── ⌬\n\n${finalBlocks}\n\n──────────────\n📊 الأوامر: [ ${count} ]  |  📑 الصفحة: [ ${page} / ${totalPages} ]\n💡 استخدم: ${prefix}اوامر [اسم الأمر] للتفاصيل\nاللهم صلِّ وسلم على سيدنا محمد 🍂🤍`;

    return api.sendMessage({ body: msg, attachment: image }, threadID);
  }

  // 5. عرض تفاصيل أمر محدد
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
