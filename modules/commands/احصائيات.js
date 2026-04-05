const os = require('os');
const moment = require('moment-timezone');

module.exports.config = {
    name: "احصائيات",
    version: "3.2.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "عرض إحصائيات النظام بالنمط الهادئ",
    commandCategory: "خدمات",
    usages: "احصائيات",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID } = event;

    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2);
    const usedMem = ((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(2);
    const uptime = os.uptime();
    const hrs = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);

    const time = moment.tz("Africa/Khartoum").format("hh:mm A");
    const date = moment.tz("Africa/Khartoum").format("DD/MM/YYYY");

    const statsMsg = 
        `╭─── 𖦆 𝐒𝐓𝐀𝐓𝐒 𖦆 ───╮\n` +
        `┃ ⚬ الـوقـت ➔ ${time}\n` +
        `┃ ⚬ الـتـاريـخ ➔ ${date}\n` +
        `┃ ⚬ الـنـظـام ➔ ${os.platform()}\n` +
        `┝───────────────┤\n` +
        `┃ ⚬ الـذاكـرة ➔ ${usedMem} / ${totalMem} GB\n` +
        `┃ ⚬ الـتـشـغـيـل ➔ ${hrs}سـاعة و ${mins}دقيقة\n` +
        `┃ ⚬ الـحـالـة ➔ نـشـط وفعّـال\n` +
        `┝───────────────┤\n` +
        `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠 𖦹\n` +
        `╰───────────────────╯`;

    api.setMessageReaction("📊", messageID, () => {}, true);
    return api.sendMessage(statsMsg, threadID, messageID);
};
