const fs = require("fs-extra");
const path = require("path");
const logger = require("../../utils/log.js");

module.exports.config = {
    name: "cmd",
    version: "1.2.5",
    hasPermssion: 2,
    credits: "DANTE SPARDA",
    description: "تحديث وتحميل وإيقاف الأوامر برمجياً بدون ريستارت",
    commandCategory: "المطور",
    cooldowns: 5
};

module.exports.run = async ({ event: e, api, args }) => {
    const { threadID, messageID, senderID } = e;

    const developerID = "61581906898524";
    if (String(senderID) !== developerID) {
        return api.sendMessage("صلاحياتك لا تسمح لك باستخدام هذا الأمر، مخصص للمطور فقط.", threadID, messageID);
    }

    const action = args[0]?.toLowerCase();
    const commandName = args[1]?.toLowerCase();

    if (!action) {
        return api.sendMessage(
            "طريقة الاستخدام الصحيحة لـ أمر التحكم:\n\n" +
            "• cmd load [اسم_الأمر] -> لتحديث أو تحميل ملف أمر جديد فوراً\n" +
            "• cmd loadall -> لإعادة تحميل وجرد جميع ملفات النظام دفعة واحدة\n" +
            "• cmd unload [اسم_الأمر] -> لتعطيل أمر معين وإزالته مؤقتاً من الذاكرة", 
            threadID, messageID
        );
    }

    // تفاعل الانتظار (ساعة رملية) لبدء العملية
    try {
        await api.setMessageReaction("⏳", messageID, () => {}, true);
    } catch (err) {
        console.error("فشل وضع تفاعل الانتظار: " + err.message);
    }

    const commandsPath = path.join(__dirname, ".."); 

    // ==================== [ خيار: تحميل / تحديث أمر معين ] ====================
    if (action === "load") {
        if (!commandName) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("يرجى كتابة اسم الملف المطلوب تحديثه أو تحميله (مثال: cmd load صيد).", threadID, messageID);
        }

        const filePath = path.join(commandsPath, `${commandName}.js`);
        if (!fs.existsSync(filePath)) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`الملف [ ${commandName}.js ] غير موجود في مجلد الأوامر الخاص بالبوت.`, threadID, messageID);
        }

        try {
            // حذف كاش النظام بالكامل لقراءة التعديلات الجديدة الحالية في الكود
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if (!command.config || !command.run) {
                throw new Error("الملف يفتقد للهيكل الأساسي للأوامر (config أو run).");
            }

            global.client.commands.set(command.config.name, command);
            
            if (global.config.DeveloperMode) {
                logger(`تم تحديث الأمر [ ${command.config.name} ] من الترمنال بنجاح.`, "[ DEV MODE ]");
            }

            await api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`تم تحديث وتحميل أمر [ ${command.config.name} ] وتفعيله بنجاح.`, threadID, messageID);
        } catch (error) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`فشل تحميل الملف بسبب خطأ في السنتاكس:\n${error.message || error}`, threadID, messageID);
        }
    }

    // ==================== [ خيار: إعادة تحميل كافة الأوامر دفعة واحدة ] ====================
    if (action === "loadall") {
        try {
            const files = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
            let successCount = 0;
            let failCount = 0;
            let errors = [];

            for (const file of files) {
                const filePath = path.join(commandsPath, file);
                try {
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    if (command.config && command.run) {
                        global.client.commands.set(command.config.name, command);
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    failCount++;
                    errors.push(`${file}: ${err.message}`);
                }
            }

            if (global.config.DeveloperMode) {
                logger(`إعادة تحميل شاملة لـ ${successCount} أمر بنجاح.`, "[ DEV MODE ]");
            }

            await api.setMessageReaction("✅", messageID, () => {}, true);
            let responseMsg = `تم الانتهاء من فحص وجرد ملفات البوت:\n\n• الأوامر المشغلة بنجاح: ${successCount}\n• الملفات التي فشل تحميلها: ${failCount}`;
            if (errors.length > 0) {
                responseMsg += `\n\nتقارير الأخطاء للملفات المعطوبة:\n${errors.join("\n")}`;
            }
            return api.sendMessage(responseMsg, threadID, messageID);
        } catch (error) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`خطأ في الوصول لمجلد الأوامر الرئيسي:\n${error.message}`, threadID, messageID);
        }
    }

    // ==================== [ خيار: إيقاف أمر معين ] ====================
    if (action === "unload") {
        if (!commandName) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("يرجى كتابة اسم الأمر الذي تريد إيقافه وحذفه من الذاكرة المؤقتة.", threadID, messageID);
        }

        if (!global.client.commands.has(commandName)) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`الأمر [ ${commandName} ] غير نشط في البوت من الأساس.`, threadID, messageID);
        }

        try {
            const filePath = path.join(commandsPath, `${commandName}.js`);
            delete require.cache[require.resolve(filePath)];
            global.client.commands.delete(commandName);

            await api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage(`تم إيقاف أمر [ ${commandName} ] وإزالته من مخزن الذاكرة بنجاح.`, threadID, messageID);
        } catch (error) {
            await api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`حدث مشكلة أثناء محاولة مسح ملف الأمر:\n${error.message}`, threadID, messageID);
        }
    }

    // في حال عدم تطابق المدخلات
    await api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("المعامل المدخل غير مدعوم، استخدم (load, loadall, unload) فقط.", threadID, messageID);
};
