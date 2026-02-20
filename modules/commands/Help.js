module.exports.config = {
  name: "اوامر",
  version: "1.3.5",
  hasPermssion: 0,
  credits: "ᏦᎥᏒᏫᎦ ᏚᎮᎯᏒᎠᎯ",
  description: "قائمة الأوامر الملكية - صفحتين - فلترة ودمج ذكي - استايل رفيع",
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
    "moduleInfo": "─── ᏦᎥᏒᏫᎦ ᏚᎮᎯᏒᎠᎯ ───\n\n🔹 الأسم ➟ [ %1 ]\n🔹 الوصف ➟ %2\n🔹 الاستخدام ➟ %3\n🔹 الفئة ➟ %4\n🔹 الانتظار ➟ %5 ثانية\n🔹 الإذن ➟ %6\n\n──────────────────",
    "user": "مستخدم عادي",
    "adminGroup": "إدمن المجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  // رابط الصورة المباشر المحدث
  const imgURL = "https://i.ibb.co/DgYq3fqw/1771594045409.png";

  try {
    const image = (await axios.get(imgURL, { responseType: "stream" })).data;

    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;

    if (!command) {
      let categories = {};
      let miscCommands = [];

      // 1. تجميع الأوامر وفلترة قسم المطور نهائياً (نفس البنية الأصلية)
      for (let [name, value] of commands) {
        const config = value.config;
        const cat = config.commandCategory || "عام";

        if (cat.toLowerCase().includes("مطور") || cat.toLowerCase().includes("dev")) continue;
        
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      // 2. منطق الدمج الذكي (نفس البنية الأصلية)
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
        "نظام": "SYSTΞM",
        "ترفية": "ΞNTΞRTAINMΞNT",
        "اقتصاد": "ΞCONOMY",
        "العاب": "GAMΞS",
        "ذكاء صناعي": "AI-PROTOCOL",
        "أوامر متنوعة": "MISCΞLLANΞOUS",
        "عام": "GΞNΞRAL"
      };

      let blocks = [];
      let count = 0;

      // 3. بناء كتل الأقسام بالاستايل الرفيع والزوايا
      for (let cat in finalCategories) {
        const cmds = finalCategories[cat].sort();
        let block = `┌─── ● ${categoryMap[cat] || cat.toUpperCase()} ● ───┐\n`;

        for (let i = 0; i < cmds.length; i += 3) {
          // استخدام • كفاصلة بين الأوامر
          const row = cmds.slice(i, i + 3).join("  •  ");
          block += `  ${row}\n`;
          count += cmds.slice(i, i + 3).length;
        }
        block += `└───────────────────┘`;
        blocks.push(block.trim());
      }

      // 4. تقسيم الأوامر على صفحتين فقط (نفس البنية الأصلية)
      const totalPages = 2;
      const perPage = Math.ceil(blocks.length / totalPages);
      const page = parseInt(args[0]) || 1;

      if (page < 1 || page > totalPages)
        return api.sendMessage(`⚠️ القائمة تتكون من ${totalPages} صفحات فقط. اختر صفحة صحيحة.`, threadID, messageID);

      const start = (page - 1) * perPage;
      const end = start + perPage;
      const finalBlocks = blocks.slice(start, end).join("\n\n");

      // 5. بناء الرسالة النهائية مع الأذكار والخاتمة المطلوبة
      const msg = `─── KIROS COMMAND ───\n\n${finalBlocks}\n\n──────────────────\n📊 الأوامر: [ ${count} ]  |  📑 الصفحة: [ ${page} / ${totalPages} ]\n💡 استخدم: ${prefix}اوامر [اسم الأمر] للتفاصيل\n\nاستغفر الله العظيم واتوب اليه 🌸\nاللهم صلِّ وسلم على سيدنا محمد 🤍🍂`;

      return api.sendMessage({ body: msg, attachment: image }, threadID);
    }

    // 5. عرض تفاصيل أمر محدد (نفس البنية الأصلية)
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
  } catch (err) {
    return api.sendMessage("❌ عذراً، تعذر تحميل القائمة حالياً.", threadID, messageID);
  }
};
