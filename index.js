const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");
const express = require("express");
const path = require("path");
const chalk = require("chalk");
const chalk1 = require("chalkercli");
const CFonts = require("cfonts");
const moment = require("moment-timezone");

const app = express();
// إضافة هذه السطر لقراءة البيانات القادمة من فيسبوك
app.use(express.json());

const PORT = process.env.PORT || 2006;

// الوقت والتاريخ
const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
let dayName = moment.tz("Asia/Ho_Chi_Minh").format("dddd");

// تعريب الأيام
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

// --- حل مشكلة تكرار الرسائل في Render ---
// هذا المسار يستقبل إشارات فيسبوك ويرد عليها فوراً بـ 200 لمنع التكرار
app.post("/", (req, res) => {
  res.status(200).send('EVENT_RECEIVED');
});

// صفحة الويب والتحقق من الـ Webhook
app.get("/", (req, res) => {
  // كود التحقق (Verify Token) المطلوب من فيسبوك عند الربط لأول مرة
  const verifyToken = "SAIKO"; // يمكنك تغييره حسب إعداداتك في Meta Developers
  if (req.query['hub.verify_token'] === verifyToken) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(PORT, () => {
    logger(`Server is running on port: ${PORT}`, "SYSTEM");
});

// واجهة البداية
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
  chalk1.cyanBright(
    `\n🎉 SAIKO BOT READY AT ${timeNow}\n📅 ${dayName}\n`
  )
);

// تشغيل البوت
function startBot(message) {
  if (message) {
    logger(chalk.green(message), "SYSTEM");
  }

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
    if (code === 1) {
      console.log(chalk.yellow("🔄 Rebooting bot..."));
      startBot("Bot restarted");
    } else if (!isNaN(code)) {
      await new Promise((r) => setTimeout(r, code * 1000));
      startBot("Bot relaunched after delay");
    }
  });

  bot.on("error", (err) => {
    logger(chalk.red("⚠️ Bot crashed: ") + err, "ERROR");
  });
}

// فحص تحديث (غير إجباري)
axios
  .get("https://raw.githubusercontent.com/tandung1/Bot12/main/package.json")
  .catch(() => {});

// بدء التشغيل
setTimeout(() => {
  console.log(chalk.green("🚀 Launching SAIKO BOT...\n"));
  startBot("SAIKO POWER-UP ⚡");
}, 70);
