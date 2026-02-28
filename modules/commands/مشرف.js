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
    name: "مشرف",
    version: "10.0",
    hasPermssion: 2, // للمطور فقط
    credits: "Gemini",
    description: "لوحة تحكم المطور",
    commandCategory: "المنظومة",
    usages: "[اضافة/حذف/قائمة/تقرير]",
    cooldowns: 2
};

// تصميم واجهة رقيق وأنيق
const UI = (title, body) => `┌───┤ 🛡️ ${title} ├───┐\n\n${body}\n\n└────────── • 💡 ID: 61581906898524`;

module.exports.run = async ({ api, event, args, mentions, messageReply }) => {
    const { threadID, senderID } = event;
    const devID = "61581906898524";
    
    // التحقق من أن المرسل هو المطور
    if (senderID !== devID) return api.sendMessage("🚫 ┋ لا تملك الصلاحية.", threadID);
    
    const data = getData();
    const cmd = args[0];

    // تحديد الـ ID (بالرد أو التاغ أو الآيدي المباشر)
    let targetID = "";
    if (messageReply) {
        targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
    } else {
        targetID = args[1];
    }

    // ➕ إضافة مشرف
    if (cmd === "اضافة") {
        if (!targetID) return api.sendMessage(UI("خطأ", "┋ يرجى الإشارة إلى الشخص أو الرد على رسالته."), threadID);
        try {
            const userInfo = await api.getUserInfo(targetID);
            const name = userInfo[targetID].name;
            
            if (!data.admins) data.admins = {};
            if (!data.stats) data.stats = {};
            
            data.admins[targetID] = { name: name, date: new Date().toLocaleDateString('ar-EG') };
            data.stats[targetID] = { total: 0, last: "لم يستخدمه" };
            
            saveData(data);
            return api.sendMessage(UI("تم الإضافة", `👤 ┋ الاسم: ${name}\n🆔 ┋ الآيدي: ${targetID}\n✅ ┋ تم منحه صلاحيات الإدارة.`), threadID);
        } catch (e) {
            return api.sendMessage(UI("خطأ", "┋ فشل في الحصول على بيانات المستخدم."), threadID);
        }
    }

    // ➖ حذف مشرف (يحذف من الملف فورا)
    if (cmd === "حذف") {
        if (!targetID || !data.admins[targetID]) return api.sendMessage(UI("خطأ", "┋ هذا المستخدم غير موجود في قائمة المشرفين."), threadID);
        
        const name = data.admins[targetID].name;
        delete data.admins[targetID]; // حذف من الذاكرة
        delete data.stats[targetID];
        
        saveData(data); // حفظ التغييرات فوراً في الملف
        return api.sendMessage(UI("تم الحذف", `👤 ┋ الاسم: ${name}\n🆔 ┋ الآيدي: ${targetID}\n❌ ┋ تم سحب الصلاحيات نهائياً.`), threadID);
    }

    // 📋 عرض القائمة
    if (cmd === "قائمة") {
        const ids = Object.keys(data.admins);
        let list = ids.map((id, i) => `▫️ ${i+1}. ${data.admins[id].name}`).join("\n");
        return api.sendMessage(UI("قائمة المشرفين", ids.length ? list : "┋ القائمة فارغة."), threadID);
    }

    // 📊 تقرير النشاط
    if (cmd === "تقرير") {
        if (!targetID || !data.admins[targetID]) return api.sendMessage(UI("خطأ", "┋ المستخدم غير مسجل كمشرف."), threadID);
        const st = data.stats[targetID];
        const name = data.admins[targetID].name;
        return api.sendMessage(UI("تقرير النشاط", `👤 ┋ ${name}\n📈 ┋ الأوامر: ${st.total}\n🕒 ┋ آخر استخدام: ${st.last}`), threadID);
    }

    // ❓ المساعدة
    return api.sendMessage(UI("لوحة التحكم", "🔹 مشرف اضافة\n🔹 مشرف حذف\n🔹 مشرف قائمة\n🔹 مشرف تقرير"), threadID);
};
