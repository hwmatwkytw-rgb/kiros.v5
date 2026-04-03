const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const chalk = require("chalk");
const CFonts = require("cfonts");
const { spawn } = require("child_process");
const axios = require("axios");

// ======================
// 🔒 Anti Duplicate
// ======================
const lockFile = path.join(__dirname, "bot.lock");

if (fs.existsSync(lockFile)) {
  console.log(chalk.red("⚠️ Bot already running"));
  process.exit(0);
}

fs.writeFileSync(lockFile, process.pid.toString());

process.on("exit", () => {
  if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
});

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

// ======================
// 🌐 Express Server
// ======================
const app = express();
const PORT = process.env.PORT || 2006;

app.get("/", (req, res) => {
  res.send(`
    <body style="background: #000; color: #00ffff; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <div style="text-align: center; border: 1px solid #00ffff; padding: 30px; box-shadow: 0 0 15px #00ffff;">
        <h1 style="letter-spacing: 5px;">KAIRUS ENGINE</h1>
        <hr color="#00ffff">
        <p>STATUS: RUNNING ○</p>
        <p>TIME: ${moment.tz("Africa/Khartoum").format("HH:mm:ss")}</p>
      </div>
    </body>
  `);
});

app.listen(PORT, () => {
  console.log(chalk.cyan(`[ SERVER ] Port: ${PORT} ○`));
});

// ======================
// ⏰ Time (Sudan)
// ======================
const timeNow = moment.tz("Africa/Khartoum").format("HH:mm:ss || D/MM/YYYY");
let dayName = moment.tz("Africa/Khartoum").format("dddd");

const days = {
  Sunday: "🌞 الأحد",
  Monday: "🌙 الإثنين",
  Tuesday: "🔥 الثلاثاء",
  Wednesday: "💧 الأربعاء",
  Thursday: "🌈 الخميس",
  Friday: "🎉 الجمعة",
  Saturday: "⭐ السبت"
};

dayName = days[dayName] || dayName;

// ======================
// 🎨 Intro (Kairus Style)
// ======================
CFonts.say("KAIRUS", {
  font: "block",
  align: "center",
  gradient: ["cyan", "magenta"]
});

console.log(
  chalk.cyanBright(
    `\n  ╮─────── 🝓 ───────╭\n` +
    `  │  ${timeNow}  │\n` +
    `  │  ${dayName}  │\n` +
    `  ╯─────── 🝓 ───────╰\n`
  )
);

// ======================
// 🤖 Start Bot Engine
// ======================
let botProcess = null;
let failCount = 0;

function startBot(msg) {
  if (msg) console.log(chalk.blue(`[ SYSTEM ] ${msg} ○`));

  failCount++;
  if (failCount > 5) {
    console.log(chalk.red("[ ERROR ] Critical Failure. Retrying in 2 minutes..."));
    setTimeout(() => {
      failCount = 0;
      startBot("Retry");
    }, 120000);
    return;
  }

  // تشغيل ملف البوت الرئيسي
  botProcess = spawn("node", ["main.bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  botProcess.on("close", (code) => {
    console.log(chalk.red(`🛑 Engine Exited (Code: ${code})`));
    // إذا كان الكود 1 (بسبب أمر رست) سيعيد التشغيل فوراً
    setTimeout(() => startBot("Restarting Engine..."), code === 0 ? 10000 : 5000);
  });

  botProcess.on("error", (err) => {
    console.log(chalk.red(`[ ERROR ] ${err}`));
    setTimeout(() => startBot("Auto-Restart"), 5000);
  });
  
  botProcess.on("spawn", () => {
    failCount = 0;
  });
}

setTimeout(() => {
  console.log(chalk.cyan("🚀 Launching Kairus System..."));
  startBot("STARTUP");
}, 100);

// ======================
// ♻️ Keep Alive & Auto Maintenance
// ======================
setInterval(() => {
  axios.get(`http://localhost:${PORT}`).catch(() => {});
}, 4 * 60 * 1000);

setInterval(() => {
  if (!botProcess || botProcess.killed) {
    startBot("Guardian Auto-restart");
  }
}, 60000);

// ريستارت كامل كل 24 ساعة لضمان استقرار السيرفر
setTimeout(() => {
  console.log(chalk.magenta("♻️ Periodic System Refresh..."));
  if (botProcess && !botProcess.killed) botProcess.kill('SIGTERM');
  setTimeout(() => process.exit(0), 3000);
}, 24 * 60 * 60 * 1000);
