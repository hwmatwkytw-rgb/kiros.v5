const characters = [
  {name:"السيف المشتعل", hp:180, power:40, speed:20, ability:"ضربة نارية +20 ضرر"},
  {name:"ظل الليل", hp:120, power:55, speed:35, ability:"هجوم مزدوج سريع"},
  {name:"الحارس الحجري", hp:250, power:25, speed:10, ability:"درع يمتص 30 ضرر"},
  {name:"الرامي الذهبي", hp:140, power:50, speed:30, ability:"سهم يخترق +15 ضرر"},
  {name:"المرتل المظلم", hp:160, power:30, speed:40, ability:"إضعاف الخصم -10 قوة"},
  {name:"الساحر الأزرق", hp:110, power:60, speed:25, ability:"موجة سحرية +25 ضرر"},
  {name:"الذئب الفضي", hp:170, power:45, speed:35, ability:"هجوم شرس +15"},
  {name:"المخالب الحديدية", hp:200, power:35, speed:20, ability:"نزيف -5 صحة كل جولة"},
  {name:"عين الصقر", hp:150, power:45, speed:30, ability:"دقة تزيد الضرر 20%"},
  {name:"ملك العاصفة", hp:130, power:55, speed:30, ability:"صاعقة +30 ضرر"}
];

let battles = {}; // لتخزين بيانات كل معركة

module.exports.config = {
  name: "هجوم",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "عمر & Gemini",
  description: "معركة حربية بالتحدي (تاغ/رد) ثم اختيار شخصيات",
  commandCategory: "العاب",
  cooldowns: 5
};

// وظيفة handleEvent للتعامل مع الموافقة بـ 👍
module.exports.handleEvent = async ({ event, api }) => {
    const { threadID, messageID, body, senderID } = event;
    if (!body || !battles[threadID]) return;

    let battle = battles[threadID];

    // المرحلة 1: انتظار التفاعل بـ 👍 من الشخص المتحدَّى فقط
    if (battle.status === "WAITING_CONFIRM" && senderID === battle.targetID && body === "👍") {
        battle.status = "CHOOSING_CHARACTERS";
        
        // منع بدء أي معركة أخرى في نفس الوقت
        return api.sendMessage("✅ تم قبول التحدي! الآن، ليختار كل منكما شخصيته بالرد على هذه الرسالة برقم الشخصية (1-10).\n\n" + getCharList(), threadID, (err, info) => {
            global.client.handleReply.push({
                type: "chooseCharacter",
                name: "هجوم",
                messageID: info.messageID
            });
        }, messageID);
    }
};

// وظيفة handleReply للتعامل مع اختيار الشخصيات
module.exports.handleReply = async ({ event, api, handleReply, Currencies }) => {
    const { threadID, messageID, senderID, body } = event;
    let battle = battles[threadID];

    if (!battle || battle.status !== "CHOOSING_CHARACTERS") return;
    
    // تأكد أن المشاركين هم فقط من يردون
    if (senderID !== battle.challengerID && senderID !== battle.targetID) return;

    if (handleReply.type === "chooseCharacter") {
        const choice = parseInt(body);
        if (isNaN(choice) || choice < 1 || choice > 10) return api.sendMessage("❌ اختيار غير صالح (1-10 فقط).", threadID, messageID);

        // منع اختيار شخصيتين لنفس اللاعب
        if (battle.players.some(p => p.id === senderID)) return api.sendMessage("⚠️ لقد اخترت شخصيتك بالفعل، انتظر الخصم.", threadID, messageID);

        const char = JSON.parse(JSON.stringify(characters[choice - 1])); // نسخة آمنة من الشخصية
        battle.players.push({ id: senderID, char: char });

        api.sendMessage(`⚔️ اختار اللاعب @${senderID} شخصية: ${char.name}.`, threadID, null, {mentions: [senderID]});

        // إذا اكتمل الطرفان، ابدأ المعركة
        if (battle.players.length === 2) {
            battle.status = "FIGHTING";
            processBattle(api, threadID, battle, Currencies);
        }
    }
};

// وظيفة run لبدء التحدي
module.exports.run = async ({ event, api }) => {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // التحقق من وجود تاغ أو رد
    let targetID = null;
    if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
    else if (messageReply) targetID = messageReply.senderID;

    if (!targetID || targetID === senderID) {
        return api.sendMessage("⚠️ يجب عليك عمل تاغ لشخص أو الرد على رسالته لبدء التحدي!", threadID, messageID);
    }
    
    // منع تحدي البوت نفسه
    if (targetID === api.getCurrentUserID()) return api.sendMessage("🤖 لا أستطيع اللعب ضد نفسي!", threadID, messageID);

    // تسجيل المعركة
    battles[threadID] = {
        challengerID: senderID,
        targetID: targetID,
        status: "WAITING_CONFIRM",
        players: []
    };

    return api.sendMessage(`⚔️ يا @${targetID}، لقد تحداك @${senderID} في معركة!\n\nللقبول، أرسل ( 👍 ) كرسالة عادية الآن.`, threadID, null, { mentions: [senderID, targetID] });
};

// دالة معالجة المعركة النهائية
async function processBattle(api, threadID, battle, Currencies) {
    const [p1, p2] = battle.players;
    
    // نظام حساب القوة (مثال: القوة + نصف السرعة)
    let p1Score = p1.char.power + (p1.char.speed * 0.5);
    let p2Score = p2.char.power + (p2.char.speed * 0.5);

    let winner, loser;
    if (p1Score > p2Score) { winner = p1; loser = p2; }
    else if (p2Score > p1Score) { winner = p2; loser = p1; }
    else {
        // في حال التعادل، يفوز من لديه HP أعلى
        winner = (p1.char.hp >= p2.char.hp) ? p1 : p2;
        loser = (winner == p1 ? p2 : p1);
    }

    // إضافة مكافأة مالية
    const reward = Math.floor(Math.random() * 3000) + 2000;
    await Currencies.increaseMoney(winner.id, reward);

    let msg = `🏆✨ ⚔️ المعركة انتهت! ⚔️✨ 🏆\n\n` +
              `🌟 الفائز: @${winner.id} \n` +
              `⚔️ شخصيته: ${winner.char.name}\n` +
              `💰 ربح: ${reward} دولار\n\n` +
              `😹 الخاسر: @${loser.id}\n` +
              `🍂 شخصيته: ${loser.char.name}\n` +
              `ضحك لقيت الحش كيف ينجص ☝🏿🐸`;

    api.sendMessage({ body: msg, mentions: [{tag: `@${winner.id}`, id: winner.id}, {tag: `@${loser.id}`, id: loser.id}]}, threadID);
    
    // مسح المعركة من الذاكرة
    delete battles[threadID];
}

// دالة عرض قائمة الشخصيات
function getCharList() {
    let list = "╭──〔 ⚔️ قائمة الأبطال 〕───\n";
    characters.forEach((c, i) => {
        list += `│ ${i + 1} • ${c.name} (HP: ${c.hp})\n`;
    });
    list += "╰──────────────────\n↯ رد برقم الشخصية لبدء القتال";
    return list;
}
