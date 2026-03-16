const fs = require('fs-extra');
const path = './data/economy.json';

const ecoDB = {
    /**
     * تهيئة النظام: التأكد من وجود المجلد وملف الـ JSON
     */
    init: async () => {
        try {
            if (!fs.existsSync('./data')) {
                fs.mkdirSync('./data');
            }
            if (!fs.existsSync(path)) {
                const initialStructure = {
                    users: [],
                    bankConfig: {
                        totalBankMoney: 1000000,
                        interestRate: 0.05
                    }
                };
                await fs.writeJson(path, initialStructure, { spaces: 2 });
            }
        } catch (error) {
            console.error("○ فشل في تهيئة قاعدة بيانات الاقتصاد:", error);
        }
    },

    /**
     * جلب بيانات المستخدم أو إنشاؤها إذا كان جديداً
     * @param {String} uid - معرف المستخدم
     * @param {String} name - اسم المستخدم (اختياري)
     */
    getUser: async (uid, name = "مستخدم") => {
        try {
            const data = await fs.readJson(path);
            let user = data.users.find(u => u.id === uid);
            
            if (!user) {
                user = {
                    id: uid,
                    name: name,
                    balance: 500, // رصيد البداية نقداً
                    bank: 0,      // الرصيد في البنك
                    debt: 0,      // الديون
                    lastWork: 0,  // توقيت آخر عمل
                    lastDaily: 0, // توقيت آخر يومية
                    status: "active"
                };
                data.users.push(user);
                await fs.writeJson(path, data, { spaces: 2 });
            }
            return user;
        } catch (error) {
            console.error(`○ خطأ في جلب بيانات المستخدم ${uid}:`, error);
            return null;
        }
    },

    /**
     * حفظ وتحديث بيانات المستخدم
     * @param {String} uid - معرف المستخدم
     * @param {Object} updates - البيانات المراد تحديثها
     */
    saveUser: async (uid, updates) => {
        try {
            const data = await fs.readJson(path);
            const index = data.users.findIndex(u => u.id === uid);
            
            if (index !== -1) {
                data.users[index] = { ...data.users[index], ...updates };
                await fs.writeJson(path, data, { spaces: 2 });
                return true;
            }
            return false;
        } catch (error) {
            console.error(`○ خطأ في حفظ بيانات المستخدم ${uid}:`, error);
            return false;
        }
    }
};

// تشغيل التهيئة عند استدعاء الملف
ecoDB.init();

module.exports = ecoDB;

