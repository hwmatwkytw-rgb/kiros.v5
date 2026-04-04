const login = require("@xaviabot/fca-unofficial");
const fs = require("fs-extra");
const totp = require("totp-generator");

/**
 * 🛠️ إعدادات الحساب المستخرج للتوكن
 * قم بوضع بياناتك الحقيقية هنا ليعمل النظام تلقائياً
 */
const credentials = {
    email: "ضع_الإيميل_هنا",
    password: "ضع_الباسورد_هنا",
    twoFactorSecret: "ضع_كود_الـ2FA_هنا" // مفتاح الأمان المكون من حروف وأرقام
};

async function updateToken() {
    return new Promise((resolve) => {
        console.log(require("chalk").bold.yellow('┌── [ SYSTEM: TOKEN EXTRACTOR ]'));
        console.log(require("chalk").cyan('│ جاري استخراج AppState جديد تلقائياً...'));

        // إعدادات الدخول لضمان عدم الحظر (مطابقة لـ config.json الخاص بك)
        const options = {
            forceLogin: true,
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1"
        };

        login({ email: credentials.email, password: credentials.password }, (err, api) => {
            if (err) {
                if (err.error === 'login-approval') {
                    // توليد كود الأمان تلقائياً وتجاوز الحماية
                    const code = totp(credentials.twoFactorSecret);
                    err.continue(code);
                    return;
                }
                console.log(require("chalk").red(`│ [ERROR]: فشل الدخول: ${err.message}`));
                console.log(require("chalk").bold.yellow('└──────────────────────────'));
                return resolve(); 
            }

            const appState = api.getAppState();
            
            // تحديث ملف appstate.json (يمسح القديم ويكتب الجديد فوراً)
            fs.writeJSONSync("./appstate.json", appState, { spaces: 2 });
            
            console.log(require("chalk").green('│ [SUCCESS]: تم تحديث الكوكيز بنجاح واستبدال الملف القديم.'));
            console.log(require("chalk").bold.yellow('└──────────────────────────'));
            resolve(appState);
        });
    });
}

module.exports = { updateToken };
