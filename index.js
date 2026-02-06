const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
const chalk1 = require("chalkercli");
const CFonts = require("cfonts");
const moment = require("moment-timezone");
const logger = require("./utils/log");

const app = express();
const PORT = process.env.PORT || 2006;

// --- نظام منع التكرار (Lock System) ---
let isBotRunning = false; 

app.get("/", (req, res) => {
  res.status(200).send("SAIKO BOT IS ALIVE 🚀");
});

// تشغيل السيرفر قبل البوت لضمان استجابة Render
app.listen(PORT, () => {
  console.log(chalk.cyan(`[ SERVER ] Listening on Port: ${PORT}`));
});

const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");

CFonts.say("SAIKO", { font: "block", align: "center", gradient: ["red", "magenta"] });

function startBot(message) {
  // إذا كان البوت يعمل بالفعل، نمنع التشغيل المتكرر
  if (isBotRunning) {
    console.log(chalk.red("⚠️ محاولة تشغيل نسخة مكررة! تم منع العملية."));
    return;
  }

  if (message) {
    logger(chalk1.green(message), "SYSTEM");
  }

  isBotRunning = true;

  const bot = spawn(
    "node",
    ["--trace-warnings", "--async-stack-traces", "main.js"],
    {
      cwd: __dirname,
      stdio: "inherit",
      shell: true
    }
  );

  bot.on("close", (code) => {
    isBotRunning = false; // تحرير القفل عند إغلاق البوت
    
    // تأخير إعادة التشغيل لمنع الـ Spam في Render
    const delay = 10000; 
    console.log(chalk.yellow(`🔄 تم إغلاق العملية (Code: ${code}). إعادة التشغيل خلال ${delay/1000} ثوانٍ...`));
    
    setTimeout(() => {
      startBot("إعادة تشغيل الجلسة...");
    }, delay);
  });

  bot.on("error", (err) => {
    isBotRunning = false;
    logger(chalk.red("⚠️ خطأ في المحرك: ") + err, "ERROR");
  });
}

// تشغيل البوت
setTimeout(() => {
  console.log(chalk.green("🚀 Launching SAIKO BOT...\n"));
  startBot("SAIKO POWER-UP ⚡");
}, 1000);
