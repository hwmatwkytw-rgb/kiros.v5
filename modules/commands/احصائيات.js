const os = require('os');
const moment = require('moment-timezone');

module.exports.config = {
    name: "احصائيات",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "إحصائيات النظام (نسخة مستقرة)",
    commandCategory: "خدمات",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
        const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(1);
        const freeMem = (os.freemem() / (1024 ** 3)).toFixed(1);
        const usedMem = (totalMem - freeMem).toFixed(1);

        const time = moment.tz("Africa/Khartoum").format("hh:mm A");
        
        const statsMsg = 
            `╭─── 𖦆 𝐒𝐓𝐀𝐓𝐒 𖦆 ───╮\n` +
            `┃ ⚬ الـوقـت ➔ ${time}\n` +
            `┃ ⚬ الـنـظـام ➔ ${os.platform()}\n` +
            `┝───────────────┤\n` +
            `┃ ⚬ الـرام ➔ ${usedMem} / ${totalMem} GB\n` +
            `┃ ⚬ الـحـالـة ➔ نـشـط 🟢\n` +
            `┝───────────────┤\n` +
            `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣开 𖦹\n` +
            `╰───────────────────╯`;

        return api.sendMessage(statsMsg, threadID, messageID);
    } catch (e) {
        return api.sendMessage("⚠️ حدث خطأ أثناء جلب البيانات", threadID, messageID);
    }
};
