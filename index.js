const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const chalk = require("chalk");
const CFonts = require("cfonts");
const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");

// ======================
// 🔒 Anti Duplicate
// ======================
const lockFile = path.join(__dirname, "bot.lock");

if (fs.existsSync(lockFile)) {
  console.log("⚠️ Bot already running");
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
    <h1>SAIKO BOT ONLINE</h1>
    <p>STATUS: RUNNING</p>
    <p>TIME: ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")}</p>
  `);
});

app.listen(PORT, () => {
  console.log(chalk.green(`🌍 Server port ${PORT}`));
});

// ======================
// ⏰ Time
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
// 🎨 Intro
// ======================
CFonts.say("SAIKO", {
  font: "block",
  align: "center",
  gradient: ["red", "magenta"]
});

console.log(
  chalk.cyanBright(
    `\n◸—————◹\n` +
    ` ⌬ ${timeNow} ⌬\n` +
    ` ⌬ ${dayName} ⌬\n` +
    `◺—————◿\n`
  )
);

// ======================
// 🤖 Start Bot
// ======================
let botProcess = null;
let failCount = 0;

function startBot(msg) {
  if (msg) logger(msg, "SYSTEM");

  failCount++;
  if (failCount > 5) {
    setTimeout(() => {
      failCount = 0;
      startBot("Retry");
    }, 120000);
    return;
  }

  botProcess = spawn("node", ["main.bot.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  botProcess.on("close", (code) => {
    console.log(chalk.red(`🛑 Bot exited (${code})`));
    setTimeout(() => startBot("Restart"), code === 0 ? 10000 : 5000);
  });

  botProcess.on("error", (err) => {
    logger("Error: " + err, "ERROR");
    setTimeout(() => startBot("Restart"), 5000);
  });
  
  botProcess.on("spawn", () => {
    failCount = 0;
  });
}

setTimeout(() => {
  console.log(chalk.green("🚀 Starting..."));
  startBot("Start ⚡");
}, 100);

// ======================
// ♻️ Keep Alive
// ======================
setInterval(() => {
  axios.get(`http://localhost:${PORT}`).catch(() => {});
}, 4 * 60 * 1000);

setInterval(() => {
  if (!botProcess || botProcess.killed) {
    startBot("Auto-restart");
  }
}, 60000);

setTimeout(() => {
  console.log(chalk.magenta("♻️ 24h restart"));
  if (botProcess && !botProcess.killed) botProcess.kill('SIGTERM');
  setTimeout(() => process.exit(0), 3000);
}, 24 * 60 * 60 * 1000);
