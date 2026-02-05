const { exec } = require('child_process');
const fs = require('fs');

module.exports.config = {
    name: "shell",
    version: "1.6.0",
    hasPermssion: 2,
    credits: "Jonell Magallanes",
    description: "التحكم بالخادم وتثبيت المكتبات",
    commandCategory: "Utility",
    usages: "[الأمر]",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const adminID = "61581906898524"; // هويتك كمطور
    const logPath = './shell_logs.txt';

    // حماية الأمان: التحقق من الهوية
    if (senderID !== adminID) return api.sendMessage("🚫 صلاحية المطور فقط.", threadID, messageID);

    // عرض القائمة عند كتابة shell فقط
    if (!args[0]) {
        const size = fs.existsSync(logPath) ? (fs.statSync(logPath).size / 1024).toFixed(1) : 0;
        return api.sendMessage(
            "💻 [ Shell Menu ]\n" +
            "──────────\n" +
            "• [cmd] تنفيذ أمر مباشر\n" +
            "• log تحميل ملف السجل\n" +
            "• clear مسح السجل\n" +
            "──────────\n" +
            `📁 سجل العمليات: ${size}KB`, 
            threadID, messageID
        );
    }

    // أوامر السجل
    if (args[0] === "log") return api.sendMessage({ attachment: fs.createReadStream(logPath) }, threadID);
    if (args[0] === "clear") { fs.writeFileSync(logPath, ""); return api.sendMessage("✅ تم مسح السجل.", threadID); }

    // تنفيذ الأوامر (تثبيت المكتبات، فحص الملفات، إلخ)
    const command = args.join(" ");
    const waitMsg = await api.sendMessage("⏳ جاري التنفيذ...", threadID, messageID);

    exec(command, (err, stdout, stderr) => {
        const result = stdout || stderr || "✅ تم التنفيذ (بدون مخرجات).";
        
        // حفظ في السجل
        const logData = `\n[${new Date().toLocaleString()}] > ${command}\n${result}\n`;
        fs.appendFileSync(logPath, logData);

        // إرسال النتيجة مع مراعاة طول النص
        const output = result.length > 1500 ? result.slice(0, 1500) + "\n... (المخرجات طويلة)" : result;
        api.editMessage(`💻 المخرجات:\n\n${output}`, waitMsg.messageID, threadID);
    });
};
