const chalk = require('chalk');
const gradient = require('gradient-string');

/**
 * محرك كايروس للنظام والتحكم بالسجلات
 * Kairus Engine - Logging Module
 */
module.exports = (الرسالة, النوع) => {
    let رسالة_السجل = '';

    switch (النوع) {
        case 'warn':
            // طباعة التنبيهات بلمسة كايروس الهندسي النحيف
            رسالة_السجل = gradient('#c2ed34', '#ed3491')('⎔ KAIRUS › WARNING ⎔ ' + الرسالة);
            console.log(chalk.bold(رسالة_السجل));
            break;

        case 'error':
            // طباعة الأخطاء القاتلة باللون الأحمر النيون المتناسق
            رسالة_السجل = chalk.bold.hex('#FF0000')('⎔ KAIRUS › ERROR ⎔ ') + chalk.bold.red(الرسالة);
            console.log(رسالة_السجل);
            break;

        default:
            // السجلات العادية وحالات الأنظمة الفرعية بتصميم سايبربانك هندسي
            رسالة_السجل = gradient('#cb34ed', '#3aed34', '#00FFFF', '#347bed')(`⊞ ${النوع.toUpperCase()} ⎔ ${الرسالة}`);
            console.log(chalk.bold(رسالة_السجل));
            break;
    }
};

/**
 * دالة مراقبة ومتابعة تحميل ملفات ووحدات البوت
 */
module.exports.loader = (الرسالة, النوع) => {
    let رسالة_التحميل = '';

    switch (النوع) {
        case 'warn':
            // تحذيرات التحميل بتدرج نيون كامل لمظهر برمجيات متطور
            رسالة_التحميل = gradient(
                '#3366FF', '#FFCCFF', '#FF0000', '#00FF00', 
                '#00FFFF', '#0000FF', '#347bed', '#00DD00', '#00FF33'
            )('⎔ KAIRUS › LOADER ⎔ ' + الرسالة);
            console.log(chalk.bold(رسالة_التحميل));
            break;

        case 'error':
            // أخطاء تحميل الموديلات أو الأوامر
            رسالة_التحميل = chalk.bold.hex('#FF0000')('⎔ KAIRUS › LOAD_ERR ⎔ ') + chalk.bold.red(الرسالة);
            console.log(رسالة_التحميل);
            break;

        default:
            // حالات التحميل الناجحة للأوامر والأحداث (Events) بمظهر بسيط ونظيف
            رسالة_التحميل = gradient(
                '#deed34', '#347bed', '#00FFFF', '#ed3491', 
                '#cb34ed', '#3aed34', '#FF3366'
            )('⎔ KAIRUS › LOADED ⎔ ' + الرسالة);
            console.log(chalk.bold(رسالة_التحميل));
            break;
    }
};
