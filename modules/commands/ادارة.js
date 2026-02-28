const fs = require("fs");
const path = "./config.json";

// وظائف قراءة وحفظ البيانات
const getData = () => {
    try {
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ admins: {}, stats: {}, blockedGroups: [] }, null, 2));
        return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (e) {
        return { admins: {}, stats: {}, blockedGroups: [] };
    }
};
const saveData = (d) => fs.writeFileSync(path, JSON.stringify(d, null, 2));

module.exports.config = {
    name: "ادارة",
    version: "12.5",
    hasPermssion: 1, // للمشرفين
    credits: "Gemini",
    description: "لوحة تحكم الإدارة",
    commandCategory: "المنظومة",
    usages: "[رسالة/مجموعات/خروج/دخول/حظر/الغاء]",
    cooldowns: 2
};

// تصميم واجهة رقيق وأنيق
const UI = (title, body) => `┌───┤ 🛠️ ${title} ├───┐\n\n${body}\n\n└────────── • 💡 Staff Dashboard`;

module.exports.run = async ({ api, event, args }) => {
    const { threadID, senderID } = event;
    const data = getData();
    const devID = "61581906898524";

    // التحقق من الصلاحية (مزامنة فورية مع ملف config.json)
    if (senderID !== devID && !data.admins[senderID]) {
        return api.sendMessage("🚫 ┋ لا تملك الصلاحية لاستخدام هذا الأمر.", threadID);
    }

    // تسجيل النشاط
    if (senderID !== devID && data.admins[senderID]) {
        data.stats[senderID].total += 1;
        data.stats[senderID].last = new Date().toLocaleString('ar-EG');
        saveData(data);
    }

    const cmd = args[0];

    // 📋 القائمة الرئيسية (تظهر عند كتابة "ادارة" فقط)
    if (!cmd) {
        const menu = `▫️ رسالة [النص]\n▫️ مجموعات\n▫️ خروج [الرقم]\n▫️ دخول [الرقم]\n▫️ حظر [الرقم]\n▫️ الغاء [الرقم]`;
        return api.sendMessage(UI("لوحة الإشراف", menu), threadID);
    }

    // 📢 إرسال رسالة (بدون كلمة ادارة)
    if (cmd === "رسالة") {
        const txt = args.slice(1).join(" ");
        if (!txt) return api.sendMessage(UI("خطأ", "┋ أدخل النص."), threadID);
        const list = (await api.getThreadList(100, null, ["INBOX"])).filter(t => t.isGroup);
        
        const formattedMsg = `┌───┤ 📢 إشعار إداري ├───┐\n\n${txt}\n\n└────────── • 💡 ${new Date().toLocaleDateString('ar-EG')}`;

        list.forEach(t => api.sendMessage(formattedMsg, t.threadID));
        return api.sendMessage(UI("تم الإرسال", `✅ ┋ تم الإرسال لـ ${list.length} مجموعة.`), threadID);
    }

    // 📋 عرض المجموعات (بدون كلمة ادارة)
    if (cmd === "مجموعات") {
        const groups = (await api.getThreadList(100, null, ["INBOX"])).filter(t => t.isGroup);
        
        let gMsg = `📊 ┋ المجموعات النشطة:\n\n`;
        gMsg += groups.map((g, i) => `【${i+1}】 ${g.name}`).join("\n");
        gMsg += `\n\n💡 ┋ استخدم الرقم + الأمر للإجراءات.`;
        
        global.temp = groups; // تخزين مؤقت
        return api.sendMessage(UI("إدارة المجموعات", gMsg.length > 0 ? gMsg : "┋ لا توجد مجموعات."), threadID);
    }

    // 🚪 خروج (بدون كلمة ادارة)
    if (cmd === "خروج") {
        const i = parseInt(args[1]) - 1;
        if (!global.temp || !global.temp[i]) return api.sendMessage(UI("خطأ", "┋ رقم المجموعة غير صحيح."), threadID);
        const target = global.temp[i];
        api.sendMessage(UI("خروج", `🚪 ┋ تم مغادرة: ${target.name}`), threadID);
        return api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
    }
    
    // 🚪 دخول المشرف (بدون كلمة ادارة)
    if (cmd === "دخول") {
        const i = parseInt(args[1]) - 1;
        if (!global.temp || !global.temp[i]) return api.sendMessage(UI("خطأ", "┋ رقم المجموعة غير صحيح."), threadID);
        const target = global.temp[i];
        
        try {
            await api.addUserToGroup(senderID, target.threadID);
            return api.sendMessage(UI("دخول", `✅ ┋ تم إضافتك للمجموعة: ${target.name}`), threadID);
        } catch (e) {
            return api.sendMessage(UI("خطأ", `❌ ┋ فشل الدخول. تأكد أن البوت مسؤول.\nخطأ: ${e.message}`), threadID);
        }
    }

    // 🚫 حظر (بدون كلمة ادارة)
    if (cmd === "حظر") {
        const i = parseInt(args[1]) - 1;
        if (!global.temp || !global.temp[i]) return api.sendMessage(UI("خطأ", "┋ رقم المجموعة غير صحيح."), threadID);
        const target = global.temp[i];
        
        if (!data.blockedGroups) data.blockedGroups = [];
        if (data.blockedGroups.includes(target.threadID)) return api.sendMessage(UI("تنبيه", "┋ المجموعة محظورة بالفعل."), threadID);
        
        data.blockedGroups.push(target.threadID);
        saveData(data);
        api.sendMessage(UI("تم الحظر", `🚫 ┋ تم حظر البوت في: ${target.name}`), threadID);
        return api.sendMessage(UI("حظر", "┋ تم إيقاف البوت."), target.threadID);
    }

    // ✅ إلغاء حظر (بدون كلمة ادارة)
    if (cmd === "الغاء") {
        const i = parseInt(args[1]) - 1;
        if (!global.temp || !global.temp[i]) return api.sendMessage(UI("خطأ", "┋ رقم المجموعة غير صحيح."), threadID);
        const target = global.temp[i];
        
        if (!data.blockedGroups.includes(target.threadID)) return api.sendMessage(UI("تنبيه", "┋ المجموعة غير محظورة."), threadID);
        
        data.blockedGroups = data.blockedGroups.filter(id => id !== target.threadID);
        saveData(data);
        api.sendMessage(UI("إلغاء الحظر", `✅ ┋ تم إلغاء حظر: ${target.name}`), threadID);
        return api.sendMessage(UI("إلغاء حظر", "┋ تم إعادة تفعيل البوت."), target.threadID);
    }
};
