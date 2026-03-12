module.exports.config = {
  name: "ابتايم",
  version: "1.8.0",
  hasPermssion: 0,
  credits: "Mustapha",
  description: "إحصائيات النظام ستايل V6 العربي",
  commandCategory: "النظام",
  usages: "ابتايم",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, Users }) {
  const moment = require("moment-timezone");

  // تفاعل البوت
  api.setMessageReaction("⌛", event.messageID, () => {}, true);

  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  const threads = await api.getThreadList(100, null, ["INBOX"]);
  const groupCount = threads.filter(t => t.isGroup).length;

  // تنسيق الوقت 12 ساعة
  const time = moment.tz("Africa/Khartoum").format("hh:mm:ss A");
  const date = moment.tz("Africa/Khartoum").format("YYYY/MM/DD");

  const message = `
╭─── · · 📊 · · ───╮
     
     ⏱️ Runtime
     
╰─── · · · · · ───╯

┌ 📊 الاحصائيات
│ • ⏱️ التشفيل : ${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}
│ • 👥 المجموعات : ${groupCount}
└───────────────┈

┌ 🕒 الوقت
│ • 🕐 الساعة : ${time}
│ • 📅 التاريخ : ${date}
└───────────────┈

「 جـلـسـة نـشـطـة 」
`.trim();

  setTimeout(() => {
    return api.sendMessage(message, event.threadID, event.messageID);
  }, 300);
};
