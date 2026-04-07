module.exports.config = {
  name: "ابتايم",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "Mustapha",
  description: "إحصائيات النظام ستايل دوائر رقيقة",
  commandCategory: "النظام",
  usages: "ابتايم",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const moment = require("moment-timezone");

  // تفاعل
  api.setMessageReaction("⚡", event.messageID, () => {}, true);

  const uptime = process.uptime();
  const days = Math.floor(uptime / (24 * 3600));
  const hours = Math.floor((uptime % (24 * 3600)) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  const tz = "Africa/Khartoum";
  const time = moment.tz(tz).format("hh:mm:ss A");
  const date = moment.tz(tz).format("YYYY/MM/DD");
  const dayName = moment.tz(tz).locale("ar").format("dddd");

  const threads = await api.getThreadList(100, null, ["INBOX"]);
  const groupCount = threads.filter(t => t.isGroup).length;

  const message = `
╭━─━━━━─「 📊 」─━━━━─━╮
    sʏsᴛᴇᴍ ᴜᴘᴛɪᴍᴇ sᴛᴀᴛs
╰━─━━━━─「 ⏳ 」─━━━━─━╯

  ◦ ◜الـنـظـام الـنـشـط◞
  ╎⏱️ التشغيل: ${days}d ${hours}h ${mins}m ${secs}s
  ╎👥 المجموعات: ${groupCount} مجموعات
  ╎🌐 الحالة: Active

  ◦ ◜تـوقـيـت الـسـودان◞
  ╎📅 اليوم: ${dayName}
  ╎🕘 الساعة: ${time}
  ╎🗓️ التاريخ: ${date}

  ───━━━━─ 🛡️ ─━━━━───
   『 ᴋᴀɪʀᴏs ᴅᴇᴠᴇʟᴏᴘᴍᴇɴᴛ 』
  ───━━━━─ 🪶 ─━━━━───
`.trim();

  setTimeout(() => {
    return api.sendMessage(message, event.threadID, event.messageID);
  }, 300);
};
