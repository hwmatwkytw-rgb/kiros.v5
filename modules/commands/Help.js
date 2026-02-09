module.exports.config = {
  name: "اوامر",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "قائمة أوامر ڪايࢪوس الملكية - صفحتين",
  commandCategory: "نظام",
  usages: "[رقم الصفحة/اسم الأمر]",
  cooldowns: 5
};

module.exports.languages = {
  "ar": {
    "moduleInfo": "┌─── · · ✨ · · ───┐\n   شـرح الـأمـر الـمـلكـي\n└─── · · ✨ · · ───┘\n\n📜 الـاسـم: [ %1 ]\n💬 الـوصـف: %2\n\n💡 طـريـقـة الـاسـتـخدام:\n └─╼ %3\n\n📂 الـفـئـة: %4\n⏳ الـانـتـظار: %5 ثانية\n🔒 الـصـلاحـيـة: %6\n\n────────────────\n👤 الـمـطور: ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
    "user": "مستخدم عادي",
    "adminGroup": "إدمن المجموعة",
    "adminBot": "مطور البوت"
  }
};

module.exports.run = async function({ api, event, args, getText }) {
  const axios = require("axios");
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  // --- 1. عرض تفاصيل أمر محدد ---
  if (args[0] && isNaN(args[0])) {
    const command = commands.get(args[0].toLowerCase());
    if (command) {
      const config = command.config;
      return api.sendMessage(
        getText("moduleInfo", config.name.toUpperCase(), config.description || "...", `${prefix}${config.name} ${config.usages || ""}`, config.commandCategory, config.cooldowns, (config.hasPermssion == 0) ? getText("user") : (config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
        threadID, messageID
      );
    }
  }

  // --- 2. جلب الصورة ---
  const image = (await axios.get("https://i.ibb.co/Vcsqzf4T/22ed4e077eadba33e9b9f78a64317ab9.jpg", { responseType: "stream" })).data;

  // --- 3. تصنيف الأوامر ---
  let categories = {};
  let totalCommands = 0;

  for (let [name, value] of commands) {
    const config = value.config;
    let cat = config.commandCategory || "عام";
    
    // دمج فئات الإدارة
    if (cat.toLowerCase().includes("admin") || cat.toLowerCase().includes("ادمن") || cat.toLowerCase().includes("إدارة")) {
        cat = "إدارة المجموعات";
    }

    // فلترة المطور (إظهار shell فقط)
    if ((cat.toLowerCase().includes("مطور") || cat.toLowerCase().includes("dev")) && name.toLowerCase() !== "shell") continue;
    
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
    totalCommands++;
  }

  const categoryIcons = {
    "نظام": "⚙️", "ترفية": "🎭", "اقتصاد": "💰", "العاب": "🎮",
    "ذكاء صناعي": "🤖", "وسائط": "🎬", "عام": "📌", "مطور": "🛠️",
    "إدارة المجموعات": "🛡️"
  };

  let blocks = [];
  const sortedCats = Object.keys(categories).sort();

  for (let cat of sortedCats) {
    const icon = categoryIcons[cat] || "📂";
    const cmds = categories[cat].sort();
    
    let block = `┌──〈 ${icon} ${cat.toUpperCase()} 〉──┐\n`;
    for (let i = 0; i < cmds.length; i += 3) {
      const row = cmds.slice(i, i + 3).map(c => ` • ${c}`).join("  ");
      block += `${row}\n`;
    }
    block += `└─────────────────┘`;
    blocks.push(block);
  }

  // --- 4. تقسيم الأوامر على صفحتين فقط ---
  const totalPages = 2;
  const perPage = Math.ceil(blocks.length / totalPages);
  const page = parseInt(args[0]) || 1;

  if (page < 1 || page > totalPages) return api.sendMessage(`⚠️ القائمة تتكون من ${totalPages} صفحات فقط.`, threadID, messageID);

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const finalBlocks = blocks.slice(start, end).join("\n");

  const msg = `╭── · · ڪايࢪوس · · ──╮\n\n${finalBlocks}\n\n📖 الـصـفـحـة: ❲ ${page} / ${totalPages} ❳\n⚙️ الـبࢪيفڪـس: ❲ ${prefix} ❳\n✨ الـأوامـر: ❲ ${totalCommands} ❳\n\n🤖 الـبـوت: ڪايࢪوس\n👤 الـمـطور: ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ\n\nاللهم صلِّ وسلم على سيدنا محمد 🤍`;

  return api.sendMessage({ body: msg, attachment: image }, threadID);
};
