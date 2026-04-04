const login = require("@xaviabot/fca-unofficial");
const fs = require("fs-extra");
const totp = require("totp-generator");

// بيانات الحساب - ضع بياناتك هنا
const credentials = {
    email: "ضع_الإيميل_هنا",
    password: "ضع_الباسورد_هنا",
    twoFactorSecret: "ضع_كود_الـ2FA_هنا" 
};

async function updateToken() {
    return new Promise((resolve) => {
        console.log('┌── [ SYSTEM: TOKEN MANAGER ]');
        console.log('│ جاري استخراج توكن جديد لـ SAIKO...');

        const options = {
            forceLogin: true,
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1"
        };

        login({ email: credentials.email, password: credentials.password }, (err, api) => {
            if (err) {
                if (err.error === 'login-approval') {
                    const code = totp(credentials.twoFactorSecret);
                    err.continue(code);
                    return;
                }
                console.log(`│ [ERROR]: فشل الدخول: ${err.message}`);
                console.log('└──────────────────────────');
                return resolve(); 
            }

            const appState = api.getAppState();
            fs.writeJSONSync("./appstate.json", appState, { spaces: 2 });
            
            console.log('│ [SUCCESS]: تم تحديث ملف appstate.json بنجاح.');
            console.log('└──────────────────────────');
            resolve(appState);
        });
    });
}

module.exports = { updateToken };
