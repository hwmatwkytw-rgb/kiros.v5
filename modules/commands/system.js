module.exports = {
    config: {
        name: "تحديث",
        version: "2.1.0",
        hasPermission: 2,
        credits: "DANTE SPARDA",
        description: "أوامر إدارة السيرفر وصيانة النظام (كاش، لوغات، ريستارت)",
        commandCategory: "المطور",
        usages: "[كاش / لوغ / شامل / ريستارت]",
        cooldowns: 5
    },

    run: async function ({ api, event, args }) {
        const fs = require("fs-extra");
        const path = require("path");
        const { threadID, messageID, senderID } = event;

        // الهوية الحقيقية والمصرحة لمطور كأيروس الأساسي
        const developerID = "61573334176409"; 
        
        if (senderID !== developerID) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("🚫 الوصول مرفوض. هذا الأمر خاص بمطور النظام فقط.", threadID, messageID);
        }

        const action = args[0]?.toLowerCase();

        // واجهة الأمر في حال عدم كتابة خيار
        if (!action) {
            return api.sendMessage(
                "╭─  ───  ───  ───  ───  ─╮\n" +
                "    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖲 𝖸 𝖲 𝖳 𝖤 𝖬\n" +
                "╰─  ───  ───  ───  ───  ─╯\n\n" +
                "⚙️ خيارات التحكم المتاحة:\n" +
                "▫ تحديث كاش ∘ مسح ملفات الميديا المؤقتة.\n" +
                "▫ تحديث لوغ ∘ تنظيف سجلات الأخطاء المتراكمة.\n" +
                "▫ تحديث شامل ∘ صيانة كاملة (كاش + رام + لوغات).\n" +
                "▫ تحديث ريستارت ∘ إعادة تشغيل البوت فوراً.\n\n" +
                " ⊞ الـنـظـام : ڪايروس", 
                threadID, messageID
            );
        }

        // تفاعل الانتظار لبدء العملية
        api.setMessageReaction("⏳", messageID, () => {}, true);

        try {
            // 1. تنظيف مجلد الكاش (Cache)
            if (action === "كاش") {
                const cachePath = path.join(__dirname, "..", "..", "cache");
                if (!fs.existsSync(cachePath)) {
                    api.setMessageReaction("❌", messageID, () => {}, true);
                    return api.sendMessage("❌ خطأ: لم يتم العثور على مسار مجلد cache.", threadID, messageID);
                }

                const files = fs.readdirSync(cachePath);
                let deletedCount = 0;

                files.forEach(file => {
                    if (file !== ".gitkeep" && file !== "readme.txt") {
                        fs.removeSync(path.join(cachePath, file));
                        deletedCount++;
                    }
                });

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage(`🧹 تم تنظيف الكاش بالكامل وحذف ${deletedCount} من الملفات المؤقتة.`, threadID, messageID);
            }

            // 2. تنظيف ملفات السجلات واللوغات (Logs)
            if (action === "لوغ" || action === "لوغات") {
                let check = false;
                const targetLogs = [
                    path.join(__dirname, "..", "..", "npm-debug.log"),
                    path.join(__dirname, "..", "..", "yarn-error.log")
                ];

                targetLogs.forEach(logPath => {
                    if (fs.existsSync(logPath)) {
                        fs.removeSync(logPath);
                        check = true;
                    }
                });

                try {
                    const npmLogs = "/root/.npm/_logs";
                    if (fs.existsSync(npmLogs)) {
                        fs.emptyDirSync(npmLogs);
                        check = true;
                    }
                } catch (e) {}

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage(check ? "✨ تم تصفير سجلات الأخطاء واللوغات العالقة بنجاح." : "👍 السجلات نظيفة بالفعل، لا توجد ملفات زائدة لتنظيفها.", threadID, messageID);
            }

            // 3. الصيانة الشاملة وتفريغ الذاكرة
            if (action === "شامل") {
                const cachePath = path.join(__dirname, "..", "..", "cache");
                
                if (fs.existsSync(cachePath)) {
                    fs.readdirSync(cachePath).forEach(file => {
                        if (file !== ".gitkeep") fs.removeSync(path.join(cachePath, file));
                    });
                }

                if (global.gc) global.gc();

                api.setMessageReaction("✅", messageID, () => {}, true);
                return api.sendMessage(
                    "╭─  ───  ───  ───  ───  ─╮\n" +
                    "       𝖲 𝖸 𝖲 𝖳 𝖤 𝖬   𝖢 𝖫 𝖤 拆\n" +
                    "╰─  ───  ───  ───  ───  ─╯\n\n" +
                    "✅ اكتملت الصيانة الشاملة:\n" +
                    "▫ تم مسح ملفات الميديا المؤقتة.\n" +
                    "▫ تم تصفير كاش الـ npm واللوغات المعطوبة.\n" +
                    "▫ تم تحرير مساحة القرص وتقليص استهلاك الرام.\n\n" +
                    " ⊞ الـنـظـام : ڪايروس", 
                    threadID, messageID
                );
            }

            // 4. إعادة تشغيل البوت النظيفة (Restart)
            if (action === "ريستارت") {
                await api.sendMessage("🔄 جاري حفظ جلسة العمل وإعادة تشغيل المحرك الآن...", threadID, messageID);
                api.setMessageReaction("✅", messageID, () => {}, true);
                process.exit(1); 
            }

            // خيار غير مدعوم
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("❓ الخيار غير معروف. استخدم: [كاش / لوغ / شامل / ريستارت]", threadID, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(`❌ حدث خطأ برمي أثناء تنفيذ العملية:\n${error.message}`, threadID, messageID);
        }
    }
};
