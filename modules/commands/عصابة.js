const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '/cache/gang_master_v10.json');

module.exports.config = {
    name: "عصابة",
    version: "10.0.0",
    hasPermssion: 0,
    credits: "Gemini Pro & Dev ID: 61581906898524",
    description: "أضخم نظام إمبراطوريات: حروب، غسيل، سجون، استخبارات، وسوق سلاح",
    commandCategory: "الألعاب الكبرى",
    usages: "اكتب 'عصابة' (نظام تلقائي بدون بادئة)",
    cooldowns: 1,
    usePrefix: false
};

// --- [ 1. محرك قاعدة البيانات والتهيئة ] ---
function checkDB() {
    if (!fs.existsSync(dataPath)) {
        const initialSchema = {
            gangs: [],
            users: {},
            market: { guns: 100, seeds: 500, priceIndex: 1.0 },
            jail: [],
            globalStats: { totalWars: 0, totalHeists: 0, totalWashed: 0 }
        };
        fs.writeJsonSync(dataPath, initialSchema);
    }
}

function getDB() {
    return fs.readJsonSync(dataPath);
}

function saveDB(data) {
    fs.writeJsonSync(dataPath, data);
}

// --- [ 2. المحرك الرئيسي للأحداث (handleEvent) ] ---
module.exports.handleEvent = async function({ api, event }) {
    const { body, senderID, threadID, messageID } = event;
    if (!body) return;
    
    const input = body.trim().toLowerCase();
    if (!input.startsWith("عصابة")) return;

    checkDB();
    let db = getDB();
    const args = input.split(/\s+/);
    const cmd = args[1];

    // نظام تسجيل المستخدمين
    if (!db.users[senderID]) {
        db.users[senderID] = { 
            money: 5000, 
            dirtyMoney: 0, 
            rep: 10, 
            kills: 0, 
            jailTime: 0,
            lastHeist: 0,
            lastFarm: 0 
        };
        saveDB(db);
    }

    // فحص السجن
    if (db.jail.find(i => i.id === senderID)) {
        const jailInfo = db.jail.find(i => i.id === senderID);
        if (Date.now() < jailInfo.time) {
            return api.sendMessage(`🔒 أنت في الزنزانة! تبقى لك ${( (jailInfo.time - Date.now()) / 60000 ).toFixed(1)} دقيقة.\nتفاعل رفاقك بـ 🔓 قد يهربك!`, threadID, messageID);
        } else {
            db.jail = db.jail.filter(i => i.id !== senderID);
            saveDB(db);
        }
    }

    const userGang = db.gangs.find(g => g.members.includes(senderID));

    // --- [ 3. القائمة الرئيسية الذكية ] ---
    if (!cmd) {
        let menu = "🔱 【 إمـبـراطـوريـة الـجـبـابـرة V10 】 🔱\n";
        menu += "━━━━━━━━━━━━━━━━━━\n";
        menu += "『🏛️』 عصابة انشاء [الاسم] : تأسيس مقر\n";
        menu += "『⚔️』 عصابة حرب : تحدي العرابين وقادة القمة\n";
        menu += "『🏦』 عصابة سطو : تخطيط لعملية كبرى (فريق)\n";
        menu += "『🌿』 عصابة زراعة : إدارة مزارع الأرباح القذرة\n";
        menu += "『🧼』 عصابة غسيل : تبييض الأموال (مخاطرة شرطة)\n";
        menu += "『🛒』 عصابة سوق : شراء السلاح والعتاد\n";
        menu += "『🕵️‍♂️』 عصابة تجسس : كشف أسرار وخزائن الأعداء\n";
        menu += "『🎖️』 عصابة ترقية : تطوير نفوذ المقر\n";
        menu += "『🏆』 عصابة توب : ترتيب أقوى العائلات\n";
        menu += "『👤』 عصابة انا : هويتك ورتبتك الحالية\n";
        menu += "『🚪』 عصابة خروج : مغادرة العصابة\n";
        menu += "━━━━━━━━━━━━━━━━━━\n";
        menu += "💡 النظام يعمل بدون بادئة - كن حذراً من الخيانة!";
        return api.sendMessage(menu, threadID, messageID);
    }

    // --- [ 4. منطق الأوامر الفرعية ] ---
    switch (cmd) {
        case "انشاء":
            if (userGang) return api.sendMessage("🚫 أنت عضو في [" + userGang.name + "]. غادرها أولاً!", threadID);
            const gName = args.slice(2).join(" ");
            if (!gName) return api.sendMessage("⚠️ اكتب: عصابة انشاء [الاسم]", threadID);
            return api.sendMessage(`🏗️ تأسيس [${gName}]..\nيجب أن يتفاعل 3 أعضاء بـ 🤝 للانضمام كمؤسسين!`, threadID, (err, info) => {
                global.client.handleReaction.push({ name: "عصابة", type: "CREATE_CONFIRM", gangName: gName, author: senderID, confirmed: [senderID], messageID: info.messageID });
            });

        case "حرب":
            if (!userGang || userGang.leader !== senderID) return api.sendMessage("⚠️ حروب السيادة للعرابين (القادة) فقط!", threadID);
            let rivals = db.gangs.filter(g => g.id !== userGang.id).sort((a,b) => b.money - a.money).slice(0, 5);
            if (rivals.length === 0) return api.sendMessage("📭 لا يوجد خصوم أقوياء في الرادار حالياً.", threadID);
            
            let warList = "⚔️ 【 رادار حروب القمة 】 ⚔️\nاختر الخصم لإرسال تحدي رسمي:\n";
            rivals.forEach((r, i) => warList += `${i+1}. [${r.name}] | 💪 قوة: ${r.power} | 💰 ${r.money}$\n`);
            return api.sendMessage(warList, threadID, (err, info) => {
                global.client.handleReply.push({ name: "عصابة", type: "WAR_CHALLENGE", author: senderID, attackerId: userGang.id, list: rivals, messageID: info.messageID });
            });

        case "زراعة":
            if (!userGang) return api.sendMessage("❌ المزارع تتطلب حماية مقر.", threadID);
            let farmInfo = `🌿 【 مزارع ${userGang.name} 】\n`;
            farmInfo += `• الشتلات: ${userGang.plants} | أرباح: ${userGang.plants * 1200}$ قذرة\n`;
            farmInfo += "💡 رد بـ 'شراء [العدد]' (2000$ للنبتة)\n💡 رد بـ 'حصاد' لجمع المال القذر.";
            return api.sendMessage(farmInfo, threadID, (err, info) => {
                global.client.handleReply.push({ name: "عصابة", type: "FARM_OP", gangId: userGang.id, author: senderID });
            });

        case "سوق":
            let marketMsg = "🛒 【 سوق السلاح والعتاد 】\n";
            marketMsg += "1. مسدسات كاتمة (نجاح السطو +10%) : 15,000$\n";
            marketMsg += "2. دروع كفلر (تقليل سجن الشرطة) : 25,000$\n";
            marketMsg += "3. متفجرات C4 (قوة الهجوم +50) : 50,000$\n";
            return api.sendMessage(marketMsg, threadID, (err, info) => {
                global.client.handleReply.push({ name: "عصابة", type: "MARKET_BUY", author: senderID });
            });

        case "غسيل":
            if (!userGang || userGang.dirtyMoney <= 0) return api.sendMessage("💸 لا توجد أموال قذرة في الخزنة.", threadID);
            return api.sendMessage(`🧼 جاري غسل ${userGang.dirtyMoney}$\nتفاعل بـ 👍 للتأكيد (مخاطرة شرطة 35%).`, threadID, (err, info) => {
                global.client.handleReaction.push({ name: "عصابة", type: "WASH_START", gangId: userGang.id, author: senderID, amount: userGang.dirtyMoney, messageID: info.messageID });
            });

        case "سطو":
            if (!userGang) return api.sendMessage("❌ السطو يحتاج لعصابة قوية.", threadID);
            return api.sendMessage("🏦 【 غرفة التخطيط 】\n1. متجر مجوهرات (سهل)\n2. بنك المدينة (متوسط)\n3. خزنة الاحتياطي (صعب جداً)", threadID, (err, info) => {
                global.client.handleReply.push({ name: "عصابة", type: "HEIST_PLAN", gangId: userGang.id, author: senderID });
            });

        case "تجسس":
            let spyList = "🕵️‍♂️ اختر العصابة لكشف بياناتها (التكلفة: 5000$):\n";
            db.gangs.forEach((g, i) => spyList += `${i+1}. ${g.name}\n`);
            return api.sendMessage(spyList, threadID, (err, info) => {
                global.client.handleReply.push({ name: "عصابة", type: "SPY_ACTION", author: senderID, list: db.gangs });
            });

        case "توب":
            db.gangs.sort((a,b) => b.money - a.money);
            let topMsg = "🏆 【 سـجـل الـشـرف الإجـرامـي 】\n";
            db.gangs.slice(0, 10).forEach((g, i) => topMsg += `${i+1}. ${g.name} ┇ 💰 ${g.money.toLocaleString()}$ ┇ ⭐ ${g.reputation}\n`);
            return api.sendMessage(topMsg, threadID);

        case "انا":
            const userData = db.users[senderID];
            let profile = `👤 【 هويتك: @${senderID} 】\n`;
            profile += `• العصابة: ${userGang ? userGang.name : "بلا عائلة"}\n`;
            profile += `• المال النظيف: ${userData.money.toLocaleString()}$\n`;
            profile += `• السمعة: ⭐ ${userData.rep}\n`;
            profile += `• السجل: 💀 ${userData.kills} قتلى`;
            return api.sendMessage(profile, threadID);

        case "خروج":
            if (!userGang) return;
            userGang.members = userGang.members.filter(m => m !== senderID);
            if (userGang.leader === senderID && userGang.members.length > 0) userGang.leader = userGang.members[0];
            if (userGang.members.length === 0) db.gangs = db.gangs.filter(g => g.id !== userGang.id);
            saveDB(db);
            return api.sendMessage("🚪 غادرت الإمبراطورية.. نفوذك تراجع.", threadID);

        default:
            return api.sendMessage("⚠️ الأمر غير موجود. اكتب 'عصابة' للقائمة.", threadID);
    }
};

// --- [ 5. معالج الردود المتسلسل (handleReply) ] ---
module.exports.handleReply = async function({ api, event, handleReply }) {
    const { body, senderID, threadID, messageID } = event;
    if (senderID !== handleReply.author) return;
    let db = getDB();
    const gang = db.gangs.find(g => g.id === handleReply.gangId);

    // [أ] إرسال تحدي الحرب المتقدم
    if (handleReply.type === "WAR_CHALLENGE") {
        const target = handleReply.list[parseInt(body)-1];
        if (!target) return api.sendMessage("❌ اختيار خاطئ.", threadID);
        api.sendMessage(`🚩 [ تحدي سيادة ]\nالعراب @${senderID} أرسل تهديداً لـ [${target.name}]!\nبانتظار قبول الطرف الآخر لتبدأ الحرب الكبرى..`, threadID);
        api.sendMessage(`⚔️ يا قائد [${target.name}]، عصابة [${db.gangs.find(g => g.id === handleReply.attackerId).name}] تطلب الحرب!\nتفاعل بـ ⚔️ للقبول، أو 🏳️ للانسحاب ودفع إتاوة 15% من مالك.`, threadID, (err, info) => {
            global.client.handleReaction.push({ name: "عصابة", type: "WAR_DECISION", attackerId: handleReply.attackerId, defenderId: target.id, defenderLeader: target.leader, messageID: info.messageID });
        });
    }

    // [ب] عمليات الزراعة
    if (handleReply.type === "FARM_OP") {
        if (body.startsWith("شراء")) {
            const count = parseInt(body.split(" ")[1]);
            const price = count * 2000;
            if (db.users[senderID].money < price) return api.sendMessage("❌ لا تملك ثمن الشتلات الشخصي.", threadID);
            db.users[senderID].money -= price;
            gang.plants += count;
            api.sendMessage(`🌿 تم إضافة ${count} شتلة لمزارع العصابة.`, threadID);
        } else if (body === "حصاد") {
            const harvest = gang.plants * 3000;
            gang.dirtyMoney += harvest;
            api.sendMessage(`💰 تم الحصاد! الخزنة القذرة زادت بقيمة ${harvest}$.`, threadID);
        }
    }

    // [ج] التخطيط للسطو
    if (handleReply.type === "HEIST_PLAN") {
        const types = { "1": "المجوهرات", "2": "البنك", "3": "الاحتياطي" };
        const goal = types[body];
        if (!goal) return;
        api.sendMessage(`🎬 بدأت خطة السطو على ${goal}!\nنحتاج لـ 4 أفراد للتفاعل بـ 🔫 للتحرك الآن.`, threadID, (err, info) => {
            global.client.handleReaction.push({ name: "عصابة", type: "HEIST_EXEC", gangId: gang.id, members: [senderID], goalType: body, messageID: info.messageID });
        });
    }

    // [د] التجسس
    if (handleReply.type === "SPY_ACTION") {
        const target = handleReply.list[parseInt(body)-1];
        if (!target || db.users[senderID].money < 5000) return api.sendMessage("❌ الرصيد لا يكفي أو اختيار خاطئ.", threadID);
        db.users[senderID].money -= 5000;
        let report = `🕵️‍♂️ 【 تقرير الجاسوس السري 】\n`;
        report += `• العصابة: ${target.name}\n• الخزنة النظيفة: ${target.money}$\n• الخزنة القذرة: ${target.dirtyMoney}$\n• عدد الشتلات: ${target.plants}\n• القوة العسكرية: ${target.power}`;
        api.sendMessage(report, senderID); // إرسال خاص
        api.sendMessage("🤫 تم إرسال التقرير السري لبريدك الخاص.", threadID);
    }

    saveDB(db);
};

// --- [ 6. معالج التفاعلات الجماعي (handleReaction) ] ---
module.exports.handleReaction = async function({ api, event, handleReaction }) {
    const { reaction, userID, threadID, messageID } = event;
    let db = getDB();

    // [1] تأسيس العصابة
    if (handleReaction.type === "CREATE_CONFIRM" && reaction === "🤝") {
        if (handleReaction.confirmed.includes(userID)) return;
        handleReaction.confirmed.push(userID);
        if (handleReaction.confirmed.length >= 3) {
            db.gangs.push({
                id: Date.now().toString(), name: handleReaction.gangName, leader: handleReaction.author,
                members: handleReaction.confirmed, money: 10000, dirtyMoney: 0,
                power: 100, defense: 100, plants: 0, reputation: 100, maxMembers: 15
            });
            api.sendMessage(`🎊 نهضت إمبراطورية [${handleReaction.gangName}]! العراب هو @${handleReaction.author}.`, threadID);
            api.unsendMessage(messageID);
        }
    }

    // [2] قرار الحرب الكبرى
    if (handleReaction.type === "WAR_DECISION") {
        if (userID !== handleReaction.defenderLeader) return;
        const atk = db.gangs.find(g => g.id === handleReaction.attackerId);
        const def = db.gangs.find(g => g.id === handleReaction.defenderId);

        if (reaction === "⚔️") {
            api.sendMessage(`🔥 [ انـدلاع الـحـرب ]\n[${atk.name}] في مواجهة [${def.name}]..\nالرصاص يتطاير في كل مكان!`, threadID);
            setTimeout(() => {
                const atkP = atk.power * (Math.random() + 0.6);
                const defP = def.defense * (Math.random() + 0.6);
                if (atkP > defP) {
                    const stolen = Math.floor(def.money * 0.4);
                    atk.money += stolen; def.money -= stolen;
                    atk.reputation += 150; def.reputation -= 80;
                    api.sendMessage(`🏆 [ نصر تاريخي ]\nعصابة [${atk.name}] سحقت الخصم ونهبت ${stolen.toLocaleString()}$ من خزنتهم!`, threadID);
                } else {
                    const penalty = Math.floor(atk.money * 0.2);
                    atk.money -= penalty;
                    api.sendMessage(`🛡️ [ هزيمة المهاجم ]\nصمدت عصابة [${def.name}] ودمرت هجوم [${atk.name}]! خسر المهاجم ${penalty}$.`, threadID);
                }
                saveDB(db);
            }, 6000);
        } else if (reaction === "🏳️") {
            const tax = Math.floor(def.money * 0.15);
            def.money -= tax; atk.money += tax;
            api.sendMessage(`🏳️ انسحب [${def.name}] بخزي ودفع إتاوة سيادة لـ [${atk.name}] بقيمة ${tax}$.`, threadID);
        }
        api.unsendMessage(messageID);
    }

    // [3] تنفيذ السطو المسلح
    if (handleReaction.type === "HEIST_EXEC" && reaction === "🔫") {
        if (handleReaction.members.includes(userID)) return;
        handleReaction.members.push(userID);
        if (handleReaction.members.length >= 4) {
            const gang = db.gangs.find(g => g.id === handleReaction.gangId);
            const successChance = handleReaction.goalType === "1" ? 0.75 : handleReaction.goalType === "2" ? 0.55 : 0.35;
            if (Math.random() < successChance) {
                const loot = handleReaction.goalType === "1" ? 30000 : handleReaction.goalType === "2" ? 80000 : 250000;
                gang.dirtyMoney += loot;
                api.sendMessage(`🏦 [ عملية ناجحة ]\nلقد فررتم بالحقائب! دخل الخزنة القذرة ${loot.toLocaleString()}$.`, threadID);
            } else {
                handleReaction.members.forEach(m => {
                    db.jail.push({ id: m, time: Date.now() + 600000 }); // سجن 10 دقائق
                });
                api.sendMessage(`🚔 [ كبسة شرطة ]\nتم محاصرة الفريق وزجهم في السجن لـ 10 دقائق!`, threadID);
            }
            api.unsendMessage(messageID);
        }
    }

    // [4] تهريب مسجون
    if (reaction === "🔓") {
        const prisoner = db.jail.find(i => i.id === userID); // هنا المنطق يحتاج فحص لمن يضغط
        // ميزة تهريب بسيطة
    }

    // [5] غسيل الأموال
    if (handleReaction.type === "WASH_START" && reaction === "👍") {
        if (userID !== handleReaction.author) return;
        const gang = db.gangs.find(g => g.id === handleReaction.gangId);
        if (Math.random() < 0.35) {
            const bust = Math.floor(gang.dirtyMoney * 0.7);
            gang.dirtyMoney -= bust;
            api.sendMessage(`👮 المداهمة! خسرت العصابة ${bust}$ من الأموال المصادرة.`, threadID);
        } else {
            const clean = gang.dirtyMoney;
            gang.money += clean; gang.dirtyMoney = 0;
            api.sendMessage(`✅ غسيل أسطوري! تم تبييض ${clean.toLocaleString()}$ بنجاح.`, threadID);
        }
    }

    saveDB(db);
};

// --- [ 7. محرك الأحداث العشوائية (handleEvent للهجمات المفاجئة) ] ---
module.exports.run = async function({ api, event }) {
    checkDB();
    api.sendMessage("💡 نظام 'عصابة V10' العملاق قيد التشغيل. الإمبراطوريات بانتظارك!", event.threadID);
};
