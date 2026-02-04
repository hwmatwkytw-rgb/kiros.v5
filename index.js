const { spawn } = require("child_process");
const { readFileSync, writeFileSync, existsSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const logger = require("./utils/log");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
const chalk1 = require("chalkercli");
const CFonts = require("cfonts");
const moment = require("moment-timezone");

const app = express();
const PORT = process.env.PORT || 2006;

// إعدادات الوقت
const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(PORT);

CFonts.say("SAIKO", { font: "block", align: "center", gradient: ["red", "magenta"] });

// دالة تشغيل البوت مع إدارة الجلسة
function startBot(message) {
  if (message) {
    logger(chalk1.green(message), "SYSTEM");
  }

  // ملاحظة للمطور: تأكد أن ملف main.js يقوم بعمل api.getAppState() وحفظه في appstate.json
  const bot = spawn(
    "node",
    ["--trace-warnings", "--async-stack-traces", "main.js"],
    {
      cwd: __dirname,
      stdio: "inherit",
      shell: true
    }
  );

  bot.on("close", async (code) => {
    // التعديل هنا: إذا كان الكود 0 أو 1 (إغلاق عادي أو خطأ بسيط) 
    // ننتظر قليلاً قبل إعادة التشغيل لضمان عدم حظر الجلسة من فيسبوك
    if (code === 1 || code === 0) {
      console.log(chalk.yellow("🔄 جاري الحفاظ على الجلسة وإعادة التشغيل التلقائي..."));
      setTimeout(() => {
        startBot("تمت إعادة تشغيل الجلسة بنجاح ✅");
      }, 5000); // تأخير 5 ثوانٍ لحماية التوكن من الحظر
    } else {
      console.log(chalk.red(`⚠️ تم إيقاف البوت بكود خطأ: ${code}`));
      // في حال وجود خطأ فادح، ننتظر دقيقة كاملة قبل المحاولة مرة أخرى
      setTimeout(() => {
        startBot("محاولة استعادة الجلسة بعد خطأ فادح...");
      }, 60000);
    }
  });

  bot.on("error", (err) => {
    logger(chalk.red("⚠️ تعطل المحرك الرئيسي: ") + err, "ERROR");
  });
}

// بدء التشغيل
console.log(chalk.green("🚀 جاري تشغيل SAIKO BOT بنظام الجلسة المستمرة...\n"));
startBot("SAIKO POWER-UP ⚡");
