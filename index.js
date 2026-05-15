const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const chalk = require("chalk");
const CFonts = require("cfonts");
const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");
const { updateToken } = require("./autoRefresh.js");

// ======================
// CONFIGURATION (الإعدادات)
// ======================
const TIMEZONE = "Africa/Khartoum"; // توقيت السودان لضبط الجدولة بدقة
const BOT_NAME = "KAIRUS V3";
const PORT = process.env.PORT || 2006;
// ضع رابط ريندر الخاص بك هنا كملاذ آمن لمنع النوم (مثال: https://kairus.onrender.com)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`; 

// ======================
// 🔒 Anti Duplicate (منع التكرار)
// ======================
const lockFile = path.join(__dirname, "bot.lock");

if (fs.existsSync(lockFile)) {
  console.log(chalk.red("⎔ [SYSTEM] Bot already running. Exiting..."));
  process.exit(0);
}

fs.writeFileSync(lockFile, process.pid.toString());

const cleanup = () => {
  if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
};
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(0); });
process.on("SIGTERM", () => { cleanup(); process.exit(0); });

// ======================
// 🌐 Express Server & Smart Ping
// ======================
const app = express();

app.get("/", (req, res) => {
  const currentServerTime = moment.tz(TIMEZONE).format("HH:mm:ss || DD/MM/YYYY");
  res.send(`
    <body style="background: #0d0e15; color: #00ffcc; font-family: monospace; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0;">
      <div style="border: 1px solid #00ffcc; padding: 30px; border-radius: 5px; box-shadow: 0 0 15px rgba(0, 255, 204, 0.2); text-align: center;">
        <h1 style="letter-spacing: 5px; margin: 0 0 10px 0;">${BOT_NAME}</h1>
        <p style="color: #888; margin: 0 0 20px 0;">STATUS: IMMORTAL RUNNING</p>
        <p style="font-size: 1.2rem; border-top: 1px dashed #333; padding-top: 15px; margin: 0;">⚡ TIME: ${currentServerTime}</p>
      </div>
    </body>
  `);
});

app.listen(PORT, () => {
  console.log(chalk.gray(`│ `) + chalk.greenBright(`🌍 Cyber Server initialized on port: ${PORT}`));
});

// ======================
// ⏰ Time & Day System
// ======================
const timeNow = moment.tz(TIMEZONE).format("HH:mm:ss || D/MM/YYYY");
let dayName = moment.tz(TIMEZONE).format("dddd");

const days = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت"
};
dayName = days[dayName] || dayName;

// ======================
// 🎨 Minimalist Intro (الهوية البصرية)
// ======================
CFonts.say("KAIRUS v3", {
  font: "slick",
  align: "center",
  gradient: ["cyan", "magenta"]
});

console.log(
  chalk.cyan(`◸──────────────────────────────────◹\n`) +
  chalk.cyan(`  ⌬ SYSTEM: `) + chalk.white(`${BOT_NAME} Engine\n`) +
  chalk.cyan(`  ⌬ TIME  : `) + chalk.white(`${timeNow}\n`) +
  chalk.cyan(`  ⌬ DAY   : `) + chalk.white(`${dayName}\n`) +
  chalk.cyan(`◺──────────────────────────────────◿\n`)
);

// ======================
// 🤖 Start Bot (التحكم في العمليات)
// ======================
let botProcess = null;
let failCount = 0;

async function startBot(msg) {
  if (msg) logger(msg, "SYSTEM");

  // تحديث التوكن تلقائياً قبل الإقلاع
  try {
    await updateToken();
  } catch (err) {
    logger("Token generation failed, bypassing to avoid lock...", "WARN");
  }

  failCount++;
  if (failCount > 5) {
    logger("Excessive crashes detected. Cooling down for 2 minutes...", "SYSTEM");
    setTimeout(() => {
      failCount = 0;
      startBot("Retry After Cool-down");
    }, 120000);
    return;
  }

  botProcess = spawn("node", ["main.bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  botProcess.on("close", (code) => {
    console.log(chalk.gray(`│ `) + chalk.red(`🛑 Bot process closed with code (${code})`));
    // إعادة تشغيل ذكية: لو قفل طبيعي (0) ينتظر 10 ثواني، لو كراش ينتظر 5 ثواني
    setTimeout(() => startBot("Restarting Engine..."), code === 0 ? 10000 : 5000);
  });

  botProcess.on("error", (err) => {
    logger("Process spawn error: " + err, "ERROR");
    setTimeout(() => startBot("Restarting Engine via Error Handler"), 5000);
  });
  
  botProcess.on("spawn", () => {
    failCount = 0; // تصفير العداد عند النجاح
  });
}

setTimeout(() => {
  console.log(chalk.gray(`│ `) + chalk.cyan("🚀 Igniting Kairus Core..."));
  startBot("STARTUP");
}, 200);

// ======================
// ♻️ Self-Ping Anti-Sleep System (حل مشكلة ريندر)
// ======================
// نقوم بعمل بينج للرابط الخارجي كل 4 دقائق لمنع السيرفر من الدخول في وضع الخمول
setInterval(() => {
  if (RENDER_URL.includes("localhost") && process.env.RENDER_EXTERNAL_URL) {
    // تحديث ديناميكي للرابط إذا تم رصده في البيئة لاحقاً
    return;
  }
  axios.get(RENDER_URL)
    .then(() => console.log(chalk.gray(`│ `) + chalk.dim(`⎔ [Self-Ping] Core keeping alive via external pulse.`)))
    .catch(() => {});
}, 4 * 60 * 1000);

// فاحص لحالة العملية كل دقيقة لإعادة الإقلاع الفوري في حال توقف العملية الفرعية
setInterval(() => {
  if (!botProcess || botProcess.killed) {
    startBot("Anti-Freeze Recovery");
  }
}, 60000);

// إعادة تشغيل كاملة كل 24 ساعة لضمان استخراج توكن فريش ونقاء الذاكرة
setTimeout(() => {
  console.log(chalk.magenta("\n♻️ [24H RESET] Scheduled reboot for system optimization & fresh token generation."));
  if (botProcess && !botProcess.killed) botProcess.kill('SIGTERM');
  setTimeout(() => process.exit(0), 3000);
}, 24 * 60 * 60 * 1000);
