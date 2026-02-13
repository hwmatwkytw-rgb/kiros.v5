const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "shell",
    version: "5.0.0",
    hasPermssion: 2,
    credits: "Jonell Magallanes & Gemini",
    description: "إدارة شاملة: ملفات (تعديل/تفاعل) + مكتبات NPM",
    commandCategory: "System",
    usages: "[الأمر/المسار/npm]",
    cooldowns: 0,
};

const adminID = "61581906898524"; // هويتك البرمجية

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    if (senderID !== adminID) return api.sendMessage("🚫 صلاحية المطور فقط.", threadID, messageID);

    const command = args[0];

    // --- 📦 قسم المكتبات NPM ---
    if (command === "npm" && args[1]) {
        const libName = args.slice(1).join(" ");
        api.sendMessage(`⏳ جاري تثبيت المكتبة: ${libName}...`, threadID, messageID);
        
        exec(`npm install ${libName} --save`, (err, stdout, stderr) => {
            if (err) return api.sendMessage(`❌ فشل التثبيت:\n${err.message}`, threadID);
            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`✅ تم تثبيت [${libName}] بنجاح وتحديث package.json.`, threadID);
        });
        return;
    }

    // --- 📂 قسم المستعرض ---
    const initialPath = args.join(" ") || "./";
    return displayFolder(api, threadID, senderID, initialPath);
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { body, threadID, messageID, senderID } = event;
    if (senderID !== handleReply.author) return;

    const { type, dirPath, files, targetPath } = handleReply;

    // 1. معالج التنقل (Explorer)
    if (type === "EXPLORER") {
        const input = body.toLowerCase().trim();
        const args = input.split(" ");
        const index = parseInt(args[0]) - 1;
        const action = args[1];

        if (input === "0" || input === "رجوع") return displayFolder(api, threadID, senderID, path.join(dirPath, ".."));
        if (isNaN(index) || !files[index]) return api.sendMessage("❌ اختيار غير صحيح.", threadID);

        const targetName = files[index];
        const fullPath = path.join(dirPath, targetName);
        const isDir = fs.lstatSync(fullPath).isDirectory();

        if (isDir && !action) return displayFolder(api, threadID, senderID, fullPath);

        switch (action) {
            case "عرض":
                if (isDir) return api.sendMessage("📁 هذا مجلد، قم بالرد برقمه للدخول.", threadID);
                return api.sendMessage(`📄 محتوى ${targetName}:\n\n${fs.readFileSync(fullPath, "utf8").slice(0, 3800)}`, threadID);

            case "حذف":
                fs.rmSync(fullPath, { recursive: true, force: true });
                api.sendMessage(`🗑️ تم حذف: ${targetName}`, threadID);
                return displayFolder(api, threadID, senderID, dirPath);

            case "تعديل":
                if (isDir) return api.sendMessage("❌ لا يمكن تعديل مجلد.", threadID);
                return api.sendMessage(`📝 أرسل الكود الجديد لملف [${targetName}]:`, threadID, (err, info) => {
                    global.client.handleReply.push({
                        name: "shell",
                        type: "WAITING_NEW_CODE",
                        targetPath: fullPath,
                        author: senderID
                    });
                }, messageID);
        }
    }

    // 2. معالج الكود الجديد (قبل التأكيد)
    if (type === "WAITING_NEW_CODE") {
        return api.sendMessage(`⚠️ تأكيد الحفظ:\n\nالمسار: ${targetPath}\n\nتفاعل بـ 👍 للحفظ النهائي.\nتفاعل بـ ❌ للإلغاء.`, threadID, (err, info) => {
            global.client.handleReaction.push({
                name: "shell",
                messageID: info.messageID,
                author: senderID,
                newCode: body,
                targetPath: targetPath
            });
        });
    }
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
    const { reaction, userID, threadID, messageID } = event;
    if (userID !== handleReaction.author) return;

    if (reaction === "👍") {
        try {
            fs.writeFileSync(handleReaction.targetPath, handleReaction.newCode);
            api.setMessageReaction("✅", messageID, () => {}, true);
            api.sendMessage(`✅ تم تحديث الملف بنجاح!\nالتغييرات الآن سارية في النظام.`, threadID);
        } catch (e) {
            api.sendMessage(`❌ خطأ أثناء الكتابة: ${e.message}`, threadID);
        }
    } else if (reaction === "❌") {
        api.sendMessage("📥 تم إلغاء العملية.", threadID);
    }
};

// دالة عرض القائمة
function displayFolder(api, threadID, senderID, dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        let msg = `💻 مدير النظام | ${path.resolve(dirPath)}\n`;
        msg += `──────────────\n`;
        files.forEach((f, i) => {
            const isDir = fs.lstatSync(path.join(dirPath, f)).isDirectory();
            msg += `${i + 1}. ${isDir ? "📁" : "📄"} ${f}\n`;
        });
        msg += `──────────────\n`;
        msg += `• [رقم] : دخول مجلد\n`;
        msg += `• [رقم عرض] : قراءة ملف\n`;
        msg += `• [رقم تعديل] : تغيير كود\n`;
        msg += `• [رقم حذف] : إزالة نهائية\n`;
        msg += `• [0] : رجوع للخلف\n`;
        msg += `• shell npm [اسم] : تثبيت مكتبة`;

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "shell",
                type: "EXPLORER",
                messageID: info.messageID,
                author: senderID,
                files,
                dirPath
            });
        });
    } catch (e) {
        api.sendMessage(`❌ لا يمكن الوصول: ${e.message}`, threadID);
    }
}
