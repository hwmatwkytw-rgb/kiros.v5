const eco = require('./economyDB'); 

module.exports = {
  config: {
    name: "اقتصاد",
    version: "2.1.0",
    role: 0,
    category: "الاقتصاد",
    description: "كسب المال والمراهنة"
  },

  onStart: async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const action = args[0];
    const userName = await Users.getNameUser(senderID);
    const user = await eco.getUser(senderID, userName);

    if (action === "عمل") {
        const cooldown = 3600000;
        if (Date.now() - (user.lastWork || 0) < cooldown) {
            const rem = Math.floor((cooldown - (Date.now() - user.lastWork)) / 60000);
            return api.sendMessage(`○ عد للعمل بعد ${rem} دقيقة.`, threadID, messageID);
        }
        const reward = Math.floor(Math.random() * 401) + 100;
        await eco.saveUser(senderID, { balance: user.balance + reward, lastWork: Date.now() });
        return api.sendMessage(`🝓 حصلت على ${reward} عملة مقابل عملك اليوم!`, threadID, messageID);
    }

    if (action === "يومية") {
        const cooldown = 86400000;
        if (Date.now() - (user.lastDaily || 0) < cooldown) return api.sendMessage("○ استلمت مكافأتك بالفعل.", threadID, messageID);
        const daily = 1000;
        await eco.saveUser(senderID, { balance: user.balance + daily, lastDaily: Date.now() });
        return api.sendMessage(`🝓 تم إضافة ${daily} عملة لرصيدك اليومي!`, threadID, messageID);
    }

    if (action === "رهان" || action === "قمار") {
        const bet = parseInt(args[1]);
        if (!bet || bet < 50) return api.sendMessage("○ الحد الأدنى 50 عملة.", threadID, messageID);
        if (user.balance < bet) return api.sendMessage("○ لا تملك هذا المبلغ.", threadID, messageID);
        const win = Math.random() > 0.6;
        if (win) {
            await eco.saveUser(senderID, { balance: user.balance + bet });
            return api.sendMessage(`🝓 محظوظ! ربحت وضاعفت مبلغك!`, threadID, messageID);
        } else {
            await eco.saveUser(senderID, { balance: user.balance - bet });
            return api.sendMessage(`📿 خسرت أموالك.. القمار لا يفيد 🗿`, threadID, messageID);
        }
    }

    const activityUI = `╮───────∙⋆⋅ ※ ⋅⋆∙───────╭
    قـائـمـة الأنـشـطـة والـمخاطرة
╯───────∙⋆⋅ ※ ⋅⋆∙───────╰

╮────∙⋆⋅「 الـمـهـام 」
│ › اقتصاد عمل 
│ › اقتصاد يومية
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈

╮────∙⋆⋅「 الـمخـاطـرة 🗿 」
│ › اقتصاد رهان [المبلغ]
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈

╮───────∙⋆⋅ ※ ⋅⋆∙───────◈
│ الـرصـيـد : ${user.balance} ▱
│ الـمـطور : DANTE
│ اسـتـخــدم : اقتصاد [الامر] 
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈`;

    return api.sendMessage(activityUI, threadID, messageID);
  }
};
