const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const chalk = require("chalk");
const CFonts = require("cfonts");
const { spawn } = require("child_process");
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
// 🌐 Express Server
// ======================
const app = express();
const PORT = process.env.PORT || 2006;

app.get("/", (req, res) => {
  res.send("🤖 SAIKO BOT ONLINE ✅");
});

app.listen(PORT, () => {
  console.log("🌍 Web server running on port " + PORT);
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
    `\n🎉 SAIKO BOT READY AT ${timeNow}\n📅 ${dayName}\n`
  )
);

// ======================
// 🤖 Start Bot (NO LOOP)
// ======================
let restarted = false;

function startBot(msg) {
  if (msg) logger(msg, "SYSTEM");

  const bot = spawn("node", ["main.bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  bot.on("close", () => {
    if (!restarted) {
      restarted = true;
      console.log(chalk.yellow("🔄 Restarting bot ONCE safely..."));
      setTimeout(() => startBot("Bot restarted once"), 3000);
    } else {
      console.log("🛑 Bot stopped permanently.");
    }
  });

  bot.on("error", (err) => {
    logger("Bot error: " + err, "ERROR");
  });
}

// ======================
// 🚀 Launch
// ======================
setTimeout(() => {
  console.log(chalk.green("🚀 Launching SAIKO BOT...\n"));
  startBot("SAIKO POWER-UP ⚡");
}, 100);

// ======================
// ♻️ Restart once every 24h
// ======================
setTimeout(() => {
  console.log("♻️ Daily restart triggered");
  process.exit(1);
}, 24 * 60 * 60 * 1000);
