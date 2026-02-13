const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "shell",
    version: "3.0.0",
    hasPermssion: 2,
    credits: "Jonell Magallanes & Gemini",
    description: "نظام إدارة اڪاز المتكامل",
    commandCategory: "Utility",
    usages: "[الأمر]",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const adminID = "61581906898524";
    const prefix = "/"; // قم بتعديله حسب بريفكس بوتك

    if (senderID !== adminID) return api.sendMessage("🚫 صلاحية المطور فقط.", threadID, messageID);

    const command = args[0];

    // --- عرض القائمة عند كتابة shell فقط ---
    if (!command) {
        const menu = 
`┌─── · · 💻 **نظام ** · · ───┐
  •- shell new : إنشاء ملف جديد
  •- shell search [اسم] : بحث سريع
  •- shell script : تصفح الملفات
  •- shell npm [مكتبة] : تثبيت مكتبات
  •- shell [cmd] : أمر نظام مباشر
  •- shell log : سجل العمليات
└─── · · · · · · · · · · · · ───┘
👤 المطور: ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ`;
        return api.sendMessage(menu, threadID, messageID);
    }

    // --- ميزة البحث (Search) ---
    if (command === "search" && args[1]) {
        const query = args.slice(1).join(" ").toLowerCase();
        const results = [];
        
        function searchDir(dir) {
            const list = fs.readdirSync(dir);
            for (const file of list) {
                const fullPath = path.join(dir, file);
                if (file.toLowerCase().includes(query)) results.push(fullPath);
                if (fs.lstatSync(fullPath).isDirectory() && !fullPath.includes("node_modules")) {
                    searchDir(fullPath);
                }
            }
        }

        api.sendMessage("🔍 جاري البحث في الخادم...", threadID);
        try {
            searchDir("./");
            if (results.length === 0) return api.sendMessage("❌ لم يتم العثور على نتائج.", threadID);
            return api.sendMessage(`✅ نتائج البحث عن (${query}):\n\n${results.slice(0, 15).map((r, i) => `${i+1}. ${r}`).join("\n")}`, threadID);
        } catch (e) { return api.sendMessage(`❌ خطأ: ${e.message}`, threadID); }
    }

    // --- إنشاء ملف جديد (shell new) ---
    if (command === "new") {
        return api.sendMessage("📝 أرسل اسم الملف (مثال: test.js):", threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                step: "WAIT_NAME",
                messageID: info.messageID,
                author: senderID
            });
        }, messageID);
    }

    // --- إدارة المكتبات (NPM) ---
    if (command === "npm" && args[1]) {
        const lib = args.slice(1).join(" ");
        api.setMessageReaction("⌛", messageID, () => {}, true);
        exec(`npm install ${lib} --save`, (err) => {
            if (err) return api.sendMessage(`❌ فشل التثبيت: ${err}`, threadID);
            api.setMessageReaction("✅", messageID, () => {}, true);
            api.sendMessage(`✅ تم تثبيت ${lib} وحفظها بنجاح.`, threadID);
        });
        return;
    }

    // --- تصفح الملفات (Script) ---
    if (command === "script") {
        const dir = args[1] || "./";
        return displayFiles(api, threadID, senderID, dir, messageID);
    }

    // تنفيذ أمر مباشر
    exec(args.join(" "), (err, stdout, stderr) => {
        const out = stdout || stderr || "✅ تم التنفيذ.";
        api.sendMessage(`💻 المخرجات:\n\n${out.slice(0, 1500)}`, threadID, messageID);
    });
};

// --- معالج الردود (Reply Handler) ---
module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { body, threadID, senderID } = event;
    if (senderID !== handleReply.author) return;

    // مراحل إنشاء ملف جديد
    if (handleReply.step === "WAIT_NAME") {
        const folders = fs.readdirSync("./").filter(f => fs.lstatSync(f).isDirectory() && !f.startsWith("."));
        let msg = "📂 اختر مجلد الحفظ (أرسل الرقم):\n" + folders.map((f, i) => `${i+1}. ${f}`).join("\n") + "\n0. الرئيسي (Root)";
        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({ ...handleReply, step: "WAIT_PATH", filename: body, folders, messageID: info.messageID });
        });
    }

    if (handleReply.step === "WAIT_PATH") {
        const idx = parseInt(body);
        const target = idx === 0 ? "./" : `./${handleReply.folders[idx-1]}/`;
        return api.sendMessage(`📥 المسار: ${target}\nأرسل الآن كود البرمجة للملف:`, threadID, (err, info) => {
            global.client.handleReply.push({ ...handleReply, step: "WAIT_CODE", fullPath: path.join(target, handleReply.filename), messageID: info.messageID });
        });
    }

    if (handleReply.step === "WAIT_CODE") {
        fs.writeFileSync(handleReply.fullPath, body);
        return api.sendMessage(`✅ تم الحفظ في: ${handleReply.fullPath}\nاللهم صلِّ وسلم على سيدنا محمد 🍂🤍`, threadID);
    }
};

function displayFiles(api, threadID, author, dir, msgID) {
    const files = fs.readdirSync(dir);
    let msg = `📂 المسار: ${path.resolve(dir)}\n\n`;
    files.forEach((f, i) => msg += `${i+1}. ${fs.lstatSync(path.join(dir, f)).isDirectory() ? "📁" : "📄"} ${f}\n`);
    api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({ name: "shell", author, files, dirPath: dir, messageID: info.messageID });
    }, msgID);
}
