const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const chalk = require("chalk");
const CFonts = require("cfonts");
const { spawn } = require("child_process");
const axios = require("axios"); // 🆕 إضافة axios للـ Self-ping
const logger = require("./utils/log");

// ======================
// 🔒 Anti Duplicate Lock
// ======================
const lockFile = path.join(__dirname, "bot.lock");

if (fs.existsSync(lockFile)) {
  console.log("⚠️ Bot already running, exit.");
  process.exit(0);
}

fs.writeFileSync(lockFile, process.pid.toString());

process.on("exit", () => {
  if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
});

process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());

// ======================
// 🌐 Express Server (Keep Alive)
// ======================
const app = express();
const PORT = process.env.PORT || 2006;

app.get("/", (req, res) => {
  res.send(`
    <style>
      body { font-family: monospace; text-align: center; background: #111; color: #fff; padding-top: 50px; }
      h1 { color: #0f0; }
      p { color: #aaa; }
    </style>
    <h1>◸——— SAIKO BOT ONLINE ———◹</h1>
    <p>⌬ STATUS: IMMORTAL MODE ⌬</p>
    <p>TIME: ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")}</p>
  `);
});

app.listen(PORT, () => {
  console.log(chalk.green(`🌍 Web server running on port ${PORT}`));
});

// ======================
// ⏰ Time & Date
// ======================
const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
let dayName = moment.tz("Asia/Ho_Chi_Minh").format("dddd");

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
// 🎨 Console Intro
// ======================
CFonts.say("SAIKO", {
  font: "block",
  align: "center",
  gradient: ["red", "magenta"]
});

CFonts.say("Bot Messenger Powered By SAIKO 🚀", {
  font: "simple",
  align: "center",
  gradient: ["cyan", "blue"]
});

console.log(
  chalk.cyanBright(
    `\n◸————————————————————————◹\n` +
    ` ⌬ SAIKO BOT READY AT ${timeNow} ⌬\n` +
    ` ⌬ ${dayName} ⌬\n` +
    `◺————————————————————————◿\n`
  )
);

// ======================
// 🤖 Start Bot (IMMORTAL LOOP)
// ======================
function startBot(msg) {
  if (msg) logger(msg, "SYSTEM");

  const bot = spawn("node", ["main.bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  bot.on("close", (code) => {
    console.log(chalk.red(`\n🛑 Bot stopped with code ${code}.`));
    console.log(chalk.yellow("🔄 Restarting Bot automatically..."));
    setTimeout(() => startBot("Bot restarted"), 5000); // إعادة تشغيل مستمرة
  });

  bot.on("error", (err) => {
    logger("Bot error: " + err, "ERROR");
  });
}

// ======================
// 🚀 Launch & Keep Alive
// ======================
setTimeout(() => {
  console.log(chalk.green("🚀 Launching SAIKO BOT...\n"));
  startBot("SAIKO POWER-UP ⚡");
}, 100);

// 🆕 خدعة Self-Ping لضمان النشاط الدائم
setInterval(() => {
  axios.get(`http://localhost:${PORT}`).catch(() => {});
  console.log(chalk.gray("💓 Heartbeat: Bot is alive.."));
}, 4 * 60 * 1000); // كل 4 دقائق

// ======================
// ♻️ Daily Restart
// ======================
setTimeout(() => {
  console.log(chalk.magenta("♻️ Daily restart triggered by IMMORTAL MODE"));
  process.exit(1);
}, 24 * 60 * 60 * 1000);
