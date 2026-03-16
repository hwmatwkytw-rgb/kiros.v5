const os = require('os');
const fs = require('fs-extra');
const moment = require('moment-timezone');

module.exports.config = {
  name: "احصائيات",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "عرض بيانات الاستضافة، المعالج، والذاكرة بالتفصيل",
  commandCategory: "النظام",
  cooldowns: 5
};

module.exports.run = async function({ api, event, Users, Threads }) {
  const { threadID, messageID } = event;

  // 1. وقت تشغيل البوت (منذ تشغيل الملف)
  const botUptime = process.uptime();
  const bHours = Math.floor(botUptime / 3600);
  const bMinutes = Math.floor((botUptime % 3600) / 60);
  const bSeconds = Math.floor(botUptime % 60);

  // 2. وقت تشغيل الاستضافة (الجهاز نفسه أو السيرفر)
  const sysUptime = os.uptime();
  const sDays = Math.floor(sysUptime / (3600 * 24));
  const sHours = Math.floor((sysUptime % (3600 * 24)) / 3600);
  const sMinutes = Math.floor((sysUptime % 3600) / 60);

  // 3. بيانات المعالج والذاكرة
  const cpus = os.cpus();
  const cpuModel = cpus[0].model;
  const cpuSpeed = cpus[0].speed;
  const cpuCores = cpus.length;
  
  const totalRAM = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeRAM = (os.freemem() / (1024 ** 3)).toFixed(2);
  const usedRAM = (totalRAM - freeRAM).toFixed(2);

  // 4. بيانات إحصائية للبوت
  const allUsers = (await Users.getAll()).length;
  const allThreads = (await Threads.getAll()).length;

  // 5. حساب البنج (Ping)
  const ping = Date.now() - event.timestamp;

  const msg = `╮────────── ⎔ ──────────╭\n` +
              `        KIRUS DASHBOARD 🖥️\n` +
              `╯────────── ⎔ ──────────╰\n\n` +
              `› وقت تشغيل البوت: ${bHours}س ${bMinutes}د ${bSeconds}ث\n` +
              `› وقت تشغيل الاستضافة: ${sDays} يوم و ${sHours}س\n` +
              `› سرعة الاستجابة: ${ping}ms\n\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `› الـمـعـالـج: ${cpuModel}\n` +
              `› عـدد الأنوية: ${cpuCores} أنوية (${cpuSpeed} MHz)\n` +
              `› الذاكـرة (RAM): ${usedRAM}GB / ${totalRAM}GB\n` +
              `› النظام: ${os.type()} ${os.release()} (${os.arch()})\n` +
              `╯────────── ⊞ ──────────╰\n\n` +
              `╮────────── ⊞ ──────────╭\n` +
              `› إجمالي المستخدمين: ${allUsers}\n` +
              `› إجمالي المجموعات: ${allThreads}\n` +
              `╯────────── ⊞ ──────────╰\n` +
              `│ بـواسطـة: ڪايࢪوس 🤖`;

  return api.sendMessage(msg, threadID, messageID);
};
