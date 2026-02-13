const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '/cache/ramadan_v7.json');

module.exports.config = {
    name: "رمضان",
    version: "7.0.0",
    hasPermssion: 0,
    credits: "Gemini Pro & Dev ID: 61581906898524",
    description: "أضخم نظام محاكاة رمضاني: إدارة خيام، تجارة، أعمال خيرية، ورتب عظمى",
    commandCategory: "الألعاب الرمضانية الكبرى",
    usages: "اكتب 'رمضان' (بدون بادئة) للدخول إلى العالم الرمضاني",
    cooldowns: 1,
    usePrefix: false
};

// --- [ 📦 محرك البيانات الضخم ] ---
function loadDB() {
    if (!fs.existsSync(dataPath)) {
        fs.writeJsonSync(dataPath, { users: {}, threads: {}, market: { date: Date.now(), prices: { dates: 10, meat: 150, juice: 20 } } });
    }
    return fs.readJsonSync(dataPath);
}

function saveDB(data) {
    fs.writeJsonSync(dataPath, data);
}

// --- [ 🛠️ الأدوات المساعدة ] ---
const getTimeStatus = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 6) return "سحور";
    if (hour >= 6 && hour < 18) return "صيام";
    if (hour >= 18 && hour < 20) return "إفطار";
    return "تهجد";
};

const getRank = (deeds) => {
    if (deeds > 50000) return "👑 ختم الرمضانيين";
    if (deeds > 20000) return "🕌 شيخ الخيمة";
    if (deeds > 10000) return "🌟 فاعل خير كبير";
    if (deeds > 5000) return "🌙 صائم مجتهد";
    return "🌱 متطوع ناشئ";
};

// --- [ 🧠 المحرك الرئيسي V7 ] ---
module.exports.handleEvent = async function({ api, event }) {
    const { body, senderID, threadID, messageID } = event;
    if (!body || !body.trim().toLowerCase().startsWith("رمضان")) return;

    let db = loadDB();
    const args = body.split(/\s+/);
    const cmd = args[1];
    const status = getTimeStatus();

    // تسجيل المستخدم V7
    if (!db.users[senderID]) {
        db.users[senderID] = { 
            points: 2000, deeds: 0, lanterns: 0, 
            inventory: { dates: 5, meat: 0, juice: 0 },
            lastWork: 0, tentLevel: 1, streak: 0 
        };
    }
    const u = db.users[senderID];

    // القائمة الرئيسية الشاملة V7
    if (!cmd) {
        let menu = `🌙 ✨ 【 إمـبـراطـوريـة رمـضـان V7 】 ✨ 🌙\n`;
        menu += `━━━━━━━━━━━━━━━━━━━━\n`;
        menu += `🕒 الوقت الآن: [ ${status} ]\n`;
        menu += `━━━━━━━━━━━━━━━━━━━━\n`;
        menu += `『⛺』 رمضان خيمة : إدارة وتطوير خيمتك الرمضانية\n`;
        menu += `『🛒』 رمضان سوق : شراء المستلزمات (تتغير الأسعار يومياً)\n`;
        menu += `『🍱』 رمضان مائدة : تجهيز الفطور أو السحور حسب الوقت\n`;
        menu += `『💰』 رمضان عمل : العمل لجمع المال (يتغير حسب الوقت)\n`;
        menu += `『🤝』 رمضان صدقة : التبرع بالنقاط لتحويلها لحسنات\n`;
        menu += `『🎖️』 رمضان توب : قائمة كبار الصالحين والخيام\n`;
        menu += `『👤』 رمضان انا : هويتك، رتبتك، ومخزنك\n`;
        menu += `━━━━━━━━━━━━━━━━━━━━\n`;
        menu += `💡 نصيحة: العمل في وقت "الصيام" مجهد لكن أجره مضاعف!`;
        saveDB(db);
        return api.sendMessage(menu, threadID, messageID);
    }

    switch (cmd) {
        case "خيمة":
            let tentMsg = `⛺ 【 خيمتك الرمضانية - ليفل ${u.tentLevel} 】\n`;
            tentMsg += `--------------------------\n`;
            tentMsg += `🏮 الفوانيس المعلقة: ${u.lanterns}\n`;
            tentMsg += `👥 سعة الضيوف: ${u.tentLevel * 5}\n`;
            tentMsg += `✨ الجمالية: ${u.lanterns > 10 ? "مبهرة ✨" : "عادية"}\n\n`;
            tentMsg += `🛠️ لترقية الخيمة (سعر: ${u.tentLevel * 5000} نقطة) رد بـ 'ترقية'`;
            return api.sendMessage(tentMsg, threadID, (err, info) => {
                global.client.handleReply.push({ name: "رمضان", type: "UPGRADE_TENT", author: senderID, cost: u.tentLevel * 5000, messageID: info.messageID });
            });

        case "سوق":
            let market = `🛒 【 سوق الرمضانية المركزي 】\n`;
            market += `━━━━━━━━━━━━━━━━━━━━\n`;
            market += `1. كرتون تمر 🥥 : ${db.market.prices.dates} نقطة\n`;
            market += `2. ذبيحة لحم 🍖 : ${db.market.prices.meat} نقطة\n`;
            market += `3. شراب فيمتو 🍷 : ${db.market.prices.juice} نقطة\n`;
            market += `4. فانوس ملكي 🏮 : 500 نقطة\n`;
            market += `━━━━━━━━━━━━━━━━━━━━\n`;
            market += `💡 رد برقم الصنف لشراءه.`;
            return api.sendMessage(market, threadID, (err, info) => {
                global.client.handleReply.push({ name: "رمضان", type: "MARKET_BUY", author: senderID, messageID: info.messageID });
            });

        case "عمل":
            const now = Date.now();
            if (now - u.lastWork < 3600000) return api.sendMessage(`⚠️ أنت مجهد! ارتح قليلاً. (تحتاج ${Math.floor((3600000 - (now - u.lastWork)) / 60000)} دقيقة)`, threadID);
            
            let gainPoints = 0;
            let workMsg = "";
            if (status === "صيام") {
                gainPoints = Math.floor(Math.random() * 800) + 200;
                workMsg = `⚒️ اشتغلت في نهار رمضان تحت الشمس.. تعبت لكن حصلت على ${gainPoints} نقطة!`;
            } else {
                gainPoints = Math.floor(Math.random() * 400) + 100;
                workMsg = `🌙 اشتغلت في وردية ليلية هادئة وحصلت على ${gainPoints} نقطة.`;
            }
            u.points += gainPoints;
            u.lastWork = now;
            saveDB(db);
            return api.sendMessage(workMsg, threadID);

        case "مائدة":
            if (status === "صيام") return api.sendMessage("☀️ ما زال الوقت باكراً! المائدة تفتح بعد المغرب.", threadID);
            let feastMsg = `🍱 【 تجهيز مائدة ${status === "إفطار" ? "الإفطار" : "السحور"} 】\n`;
            feastMsg += `المخزن: (تمر: ${u.inventory.dates} | لحم: ${u.inventory.meat} | عصير: ${u.inventory.juice})\n\n`;
            feastMsg += `1. تقديم تمر وعصير (تحصل على 200 حسنة)\n`;
            feastMsg += `2. تقديم مأدبة لحم (تحصل على 1000 حسنة)\n`;
            return api.sendMessage(feastMsg, threadID, (err, info) => {
                global.client.handleReply.push({ name: "رمضان", type: "SERVE_FOOD", author: senderID, messageID: info.messageID });
            });

        case "صدقة":
            const amount = parseInt(args[2]);
            if (!amount || amount <= 0) return api.sendMessage("📝 اكتب المبلغ: رمضان صدقة 100", threadID);
            if (u.points < amount) return api.sendMessage("❌ نقاطك غير كافية.", threadID);
            u.points -= amount;
            u.deeds += amount * 1.5;
            saveDB(db);
            return api.sendMessage(`🤝 تقبل الله منك! تبرعت بـ ${amount} ونلت ${amount * 1.5} حسنة.`, threadID);

        case "انا":
            let me = `👤 【 بطاقة التعريف الرمضانية 】\n`;
            me += `━━━━━━━━━━━━━━━━━━━━\n`;
            me += `🏅 الرتبة: ${getRank(u.deeds)}\n`;
            me += `🌙 الحسنات: ${u.deeds.toLocaleString()}\n`;
            me += `💰 النقاط: ${u.points.toLocaleString()}\n`;
            me += `⛺ ليفل الخيمة: ${u.tentLevel}\n`;
            me += `🏮 الفوانيس: ${u.lanterns}\n`;
            me += `📦 المخزن: [تمر: ${u.inventory.dates}, لحم: ${u.inventory.meat}, عصير: ${u.inventory.juice}]\n`;
            me += `━━━━━━━━━━━━━━━━━━━━\n`;
            return api.sendMessage(me, threadID);

        case "توب":
            let topD = Object.keys(db.users).map(i => ({ id: i, deeds: db.users[i].deeds })).sort((a,b) => b.deeds - a.deeds).slice(0, 10);
            let topMsg = `🏆 【 قائمة أباطرة الخير V7 】 🏆\n`;
            topD.forEach((v, i) => topMsg += `${i+1}. [👤] ${v.deeds.toLocaleString()} حسنة\n`);
            return api.sendMessage(topMsg, threadID);

        default:
            return api.sendMessage("⚠️ الأمر غير موجود. اكتب 'رمضان' فقط للقائمة.", threadID);
    }
};

// --- [ 💬 معالج الردود المتسلسل V7 ] ---
module.exports.handleReply = async function({ api, event, handleReply }) {
    const { body, senderID, threadID } = event;
    if (senderID !== handleReply.author) return;
    let db = loadDB();
    const u = db.users[senderID];

    // [1] شراء من السوق
    if (handleReply.type === "MARKET_BUY") {
        const p = db.market.prices;
        if (body === "1") {
            if (u.points < p.dates) return api.sendMessage("❌ مالك ما يكفي.", threadID);
            u.points -= p.dates; u.inventory.dates++;
            api.sendMessage("✅ اشتريت تمر.", threadID);
        } else if (body === "2") {
            if (u.points < p.meat) return api.sendMessage("❌ مالك ما يكفي.", threadID);
            u.points -= p.meat; u.inventory.meat++;
            api.sendMessage("✅ اشتريت لحم.", threadID);
        } else if (body === "3") {
            if (u.points < p.juice) return api.sendMessage("❌ مالك ما يكفي.", threadID);
            u.points -= p.juice; u.inventory.juice++;
            api.sendMessage("✅ اشتريت فيمتو.", threadID);
        } else if (body === "4") {
            if (u.points < 500) return api.sendMessage("❌ مالك ما يكفي.", threadID);
            u.points -= 500; u.lanterns++;
            api.sendMessage("✅ اشتريت فانوس.", threadID);
        }
    }

    // [2] ترقية الخيمة
    if (handleReply.type === "UPGRADE_TENT") {
        if (body.toLowerCase() === "ترقية") {
            if (u.points < handleReply.cost) return api.sendMessage("❌ النقاط لا تكفي للترقية.", threadID);
            u.points -= handleReply.cost;
            u.tentLevel++;
            api.sendMessage(`🎊 مبروك! خيمتك الآن ليفل ${u.tentLevel}. زادت المساحة والجمالية!`, threadID);
        }
    }

    // [3] تقديم الطعام
    if (handleReply.type === "SERVE_FOOD") {
        if (body === "1") {
            if (u.inventory.dates < 1 || u.inventory.juice < 1) return api.sendMessage("❌ ينقصك تمر أو عصير من السوق.", threadID);
            u.inventory.dates--; u.inventory.juice--; u.deeds += 200;
            api.sendMessage("🍱 قدمت وجبة خفيفة للضيوف. نلت 200 حسنة.", threadID);
        } else if (body === "2") {
            if (u.inventory.meat < 1) return api.sendMessage("❌ لا يوجد لحم في مخزنك.", threadID);
            u.inventory.meat--; u.deeds += 1000;
            api.sendMessage("🍖 قدمت وليمة فاخرة! انتشر صيت خيمتك ونلت 1000 حسنة.", threadID);
        }
    }

    saveDB(db);
};

// --- [ 🔄 معالج التحديثات التلقائية ] ---
module.exports.run = async function({ api, event }) {
    api.sendMessage("🌙 نظام 'رمضان V7' المطور يعمل الآن! إمبراطورية الخير تبدأ من هنا.", event.threadID);
};
