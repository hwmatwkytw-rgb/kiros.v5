module.exports.config = {
  name: "ابتايم",
  version: "2.4.5",
  hasPermssion: 0,
  credits: "Mustapha",
  description: "إحصائيات النظام ستايل خطوط منحنية مع نهاية هندسية مبتكرة",
  commandCategory: "النظام",
  usages: "ابتايم",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const moment = require("moment-timezone");
  const os = require("os");

  // تفاعل الساعة الرملية
  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  const timeStart = Date.now();

  // حساب وقت التشغيل
  const uptime = process.uptime();
  const days = Math.floor(uptime / (24 * 3600));
  const hours = Math.floor((uptime % (24 * 3600)) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  // حساب وقت بدء التشغيل الفعلي
  const tz = "Africa/Khartoum";
  const startTime = moment().tz(tz).subtract(uptime, 'seconds');
  const actualLaunch = startTime.locale("ar").format("YYYY/MM/DD ◦ hh:mm A");

  // الوقت الحالي
  const timeNow = moment.tz(tz).format("hh:mm:ss A");
  const dateNow = moment.tz(tz).format("YYYY/MM/DD");
  const dayName = moment.tz(tz).locale("ar").format("dddd");

  // إحصائيات المجموعات
  const threads = await api.getThreadList(100, null, ["INBOX"]);
  const groupCount = threads.filter(t => t.isGroup).length;

  // إحصائيات الذاكرة (ميجابايت)
  const memoryUsage = process.memoryUsage();
  const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
  const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const rssMem = (memoryUsage.rss / 1024 / 1024).toFixed(2);

  // معلومات المعالج والنظام
  const osPlatform = os.platform();
  const osArch = os.arch();
  const cpuLoad = os.loadavg()[0].toFixed(2);

  // سرعة الاستجابة (Ping)
  const ping = Date.now() - timeStart;

  // تصميم هندسي متناسق بخطوط منحنية ونهاية مخصصة
  const message = `
╭────────────────╮
  ⎔  SYSTEM METRICS & UPTIME
╰────────────────╯

 ⊞ ◜ الـمـؤشـرات الـحـيـة ◞
 ├─▫ الـتـشـغـيـل: ${days}d ${hours}h ${mins}m ${secs}s
 ├─▫ بـدء الـنـظـام: ${actualLaunch}
 ├─▫ الـمـجـمـوعـات: ${groupCount} ديرّة نشطة
 ├─▫ الاسـتـجـابـة: ${ping}ms
 ╰─▫ حـالـة الـبـوت: Active

 ⊞ ◜ مـوارد الاسـتـضـافـة ◞
 ├─▫ الـكـومـة الإجـمـالـيـة: ${heapTotal} MB
 ├─▫ الـمـسـتـهـلـك الـفـعـلـي: ${heapUsed} MB
 ├─▫ الـذاكـرة الـكـلـيـة: ${rssMem} MB
 ├─▫ ضـغـط الـمـعـالـج: ${cpuLoad}%
 ╰─▫ الـنـظـام: ${osPlatform} (${osArch})

 ⊞ ◜ تـوقـيـت الـسـودان ◞
 ├─▫ الـيـوم: ${dayName}
 ├─▫ الـسـاعـة: ${timeNow}
 ╰─▫ الـتـاريـخ: ${dateNow}

  ⎔────────────────⎔
   ⌬ ᴋᴀɪʀᴏs ᴅᴇᴠᴇʟᴏᴘᴍᴇɴᴛ ⌬
  ⎔────────────────⎔`.trim();

  setTimeout(() => {
    return api.sendMessage(message, event.threadID, event.messageID);
  }, 300);
};
