const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "تحميل",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "تحميل وسائط (FB, IG, TK, YT) باستخدام مكتبة rx والـ API الخاص بك",
    commandCategory: "خدمات",
    usages: "[الرابط]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { alldown } = require("rx-dawonload"); // المكتبة اللي ثبتها الآن ✅

    const url = args[0];
    if (!url || !url.startsWith("http")) {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى وضع رابط صحيح\n┃ ⚬ مثال: تحميل [رابط الفيديو]\n╰───────────────────╯", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
        // 1. تحديد المنصة بشكل جمالي
        let platform = "وسائط عامة 🌐";
        if (url.includes("tiktok.com")) platform = "تـيـك تـوك 🎵";
        else if (url.includes("facebook.com")) platform = "فـيـس بـوك 💙";
        else if (url.includes("instagram.com")) platform = "إنـسـتـغـرام 📸";
        else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "يـوتـيـوب 📺";

        // 2. جلب البيانات باستخدام المكتبة المثبتة
        const res = await alldown(url);
        if (!res || !res.url) throw new Error("لم يتم العثور على محتوى قابل للتحميل");

        api.setMessageReaction("📥", messageID, () => {}, true);

        // 3. تجهيز مسار التخزين المؤقت (Cache)
        const cacheDir = path.join(__dirname, 'cache');
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `kairus_dl_${Date.now()}.mp4`);

        // 4. تحميل الفيديو كـ Stream (أفضل للأداء)
        const response = await axios({
            method: 'get',
            url: res.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            const msg = 
                `╭─── 𖦆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𖦆 ───╮\n` +
                `┃ ⚬ الـمـنـصـة ➔ ${platform}\n` +
                `┃ ⚬ الـعـنـوان ➔ ${res.title ? res.title.substring(0, 20) : 'بـدون عـنـوان'}...\n` +
                `┝───────────────┤\n` +
                `┃ ⚬ الـحـالـة ➔ تـم الـجـلـب بنـجاح\n` +
                `┝───────────────┤\n` +
                `┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯开𝐑𝐃𝐀 𖦹\n` +
                `╰───────────────────╯`;

            api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                api.setMessageReaction("✅", messageID, () => {}, true);
            }, messageID);
        });

        writer.on('error', (e) => { throw e; });

    } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭─── 𖦆 𝐄𝐑𝐑𝐎𝐑 𖦆 ───╮\n┃ ⚬ فشل بسبب: ${e.message}\n╰───────────────────╯`, threadID, messageID);
    }
};
