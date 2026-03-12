const fs = require("fs");
const path = require("path");

// 🔒 إنشاء مجلد cache في مسار ثابت للاستضافة
const cacheDir = path.join(process.cwd(), "cache"); // استخدام process.cwd() بدلاً من __dirname
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

// 📁 قاعدة البيانات الخاصة بالكلمات المتعلمة
const learnedPath = path.join(cacheDir, "learned.json");
if (!fs.existsSync(learnedPath)) fs.writeFileSync(learnedPath, JSON.stringify({}));
let learned = JSON.parse(fs.readFileSync(learnedPath));

// 📁 ملف وضع كارلوس
const carlosPath = path.join(cacheDir, "carlos.json");
if (!fs.existsSync(carlosPath)) fs.writeFileSync(carlosPath, JSON.stringify({ status: "off" }));
let carlos = JSON.parse(fs.readFileSync(carlosPath));

// حفظ البيانات
function saveLearned() {
  fs.writeFileSync(learnedPath, JSON.stringify(learned, null, 2));
}

function saveCarlos() {
  fs.writeFileSync(carlosPath, JSON.stringify(carlos, null, 2));
}

module.exports.config = {
  name: "تعلم",
  version: "2.0.0",
  credits: "GPT + محمد إدريس",
  description: "نظام تعليم الردود مع وضع كارلوس",
  commandCategory: "النظام",
  usages: "تعلم الكلمة => الرد",
  cooldowns: 2
};

// ✨ التحقق إذا المرسل أدمن
async function isAdmin(api, threadID, senderID) {
  try {
    const info = await api.getThreadInfo(threadID);
    return info.adminIDs.some(ad => ad.id == senderID);
  } catch (error) {
    return false;
  }
}

module.exports.run = async function ({ api, event, args }) {
  const text = args.join(" ");
  const sender = event.senderID;

  // لو كتب فقط "تعلم"
  if (args.length === 0) {
    return api.sendMessage(
      "⚙️ **أوامر نظام التعلم**:\n\n" +
      "📘 إضافة رد:\nتعلم الكلمة => الرد\n\n" +
      "🛡 أوامر الأدمن فقط:\nتعلم تعديل الكلمة => الرد الجديد\nتعلم حذف الكلمة\nتعلم قائمة\nتعلم كايروس on\nتعلم كايروس off",
      event.threadID,
      event.messageID
    );
  }

  // 🔥 تشغيل كايروس
  if (text === "كايروس on") {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("❌ هذا الأمر للأدمن فقط.", event.threadID);

    carlos.status = "on";
    saveCarlos();
    return api.sendMessage("⚡ انبح عايز شنو 🐸", event.threadID);
  }

  // 🛑 إيقاف كايروس
  if (text === "كايروس off") {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("❌ هذا الأمر للأدمن فقط.", event.threadID);

    carlos.status = "off";
    saveCarlos();
    return api.sendMessage("⚡ ciros th off", event.threadID);
  }

  // 📜 قائمة الردود
  if (text === "قائمة") {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("❌ هذا الأمر للأدمن فقط.", event.threadID);

    if (Object.keys(learned).length === 0)
      return api.sendMessage("📭 لا توجد كلمات متعلمة حالياً.", event.threadID);

    let msg = "📚✨ **قائمة الردود المتعلمة** ✨📚\n\n";
    let i = 1;
    for (let w in learned) {
      msg += `🔹 ${i}) **${w}** → ${learned[w]}\n`;
      i++;
    }

    msg += "\n💠 استخدم: كايروس + الكلمة";

    return api.sendMessage(msg, event.threadID);
  }

  // ❌ حذف كلمة
  if (text.startsWith("حذف ")) {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("❌ هذا الأمر للأدمن فقط.", event.threadID);

    const word = text.replace("حذف ", "").trim();

    if (!learned[word])
      return api.sendMessage("⚠️ الكلمة غير موجودة.", event.threadID);

    delete learned[word];
    saveLearned();
    return api.sendMessage(`🗑️ تم حذف "${word}" بنجاح.`, event.threadID);
  }

  // ✏ تعديل كلمة
  if (text.startsWith("تعديل ")) {
    if (!(await isAdmin(api, event.threadID, sender)))
      return api.sendMessage("❌ هذا الأمر للأدمن فقط.", event.threadID);

    const parts = text.replace("تعديل ", "").split("=>");
    if (parts.length !== 2)
      return api.sendMessage("⚠️ الصيغة:\nتعديل الكلمة => الرد الجديد", event.threadID);

    const word = parts[0].trim();
    const reply = parts[1].trim();

    if (!learned[word])
      return api.sendMessage("⚠️ الكلمة غير موجودة.", event.threadID);

    learned[word] = reply;
    saveLearned();
    return api.sendMessage(`✏️ تم تعديل الرد للكلمة "${word}".`, event.threadID);
  }

  // ➕ تعليم كلمة
  const parts = text.split("=>");
  if (parts.length !== 2)
    return api.sendMessage("❌ الصيغة:\nتعلم الكلمة => الرد", event.threadID);

  const word = parts[0].trim();
  const reply = parts[1].trim();

  learned[word] = reply;
  saveLearned();

  return api.sendMessage(`✔️ تم تعلم الكلمة "${word}".`, event.threadID);
};

// 🤖 نظام الردود
module.exports.handleEvent = function ({ api, event }) {
  const msg = event.body;
  if (!msg) return;

  // كايروس ON — يرد على أي كلمة
  if (carlos.status === "on") {
    const w = msg.trim();
    if (learned[w])
      return api.sendMessage(learned[w], event.threadID, event.messageID);
  }

  // الوضع العادي: كايروس الكلمة
  if (msg.startsWith("كايروس ")) {
    const w = msg.replace("كايروس ", "").trim();
    if (learned[w])
      return api.sendMessage(learned[w], event.threadID, event.messageID);
  }
};
