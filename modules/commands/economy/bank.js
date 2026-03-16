const eco = require('./economyDB'); 

module.exports = {
  config: {
    name: "بنك",
    version: "2.5.0",
    role: 0,
    category: "الاقتصاد",
    description: "إدارة الحساب البنكي بستايل كايروس"
  },

  onStart: async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const action = args[0];
    const amount = parseInt(args[1]);
    const userName = await Users.getNameUser(senderID);
    const user = await eco.getUser(senderID, userName);

    if (action === "ايداع") {
        if (!amount || amount <= 0) return api.sendMessage("○ حدد مبلغاً صالحاً للإيداع.", threadID, messageID);
        if (user.balance < amount) return api.sendMessage("○ رصيدك النقدي غير كافٍ.", threadID, messageID);
        await eco.saveUser(senderID, { balance: user.balance - amount, bank: user.bank + amount });
        return api.sendMessage(`🝓 تم إيداع ${amount} عملة بنجاح.`, threadID, messageID);
    }

    if (action === "سحب") {
        if (!amount || amount <= 0) return api.sendMessage("○ حدد مبلغاً صالحاً للسحب.", threadID, messageID);
        if (user.bank < amount) return api.sendMessage("○ رصيدك في البنك لا يكفي.", threadID, messageID);
        await eco.saveUser(senderID, { balance: user.balance + amount, bank: user.bank - amount });
        return api.sendMessage(`🝓 تم سحب ${amount} عملة بنجاح.`, threadID, messageID);
    }

    if (action === "قرض") {
        if (user.debt > 0) return api.sendMessage(`○ سدد دينك السابق أولاً (${user.debt}).`, threadID, messageID);
        const loan = 5000;
        await eco.saveUser(senderID, { balance: user.balance + loan, debt: loan });
        return api.sendMessage(`📿 تم منحك قرضاً بقيمة ${loan} عملة.`, threadID, messageID);
    }

    if (action === "تسديد") {
        if (user.debt <= 0) return api.sendMessage("○ لا توجد ديون مسجلة عليك.", threadID, messageID);
        if (user.balance < user.debt) return api.sendMessage("○ رصيدك النقدي لا يكفي للتسديد.", threadID, messageID);
        const debtVal = user.debt;
        await eco.saveUser(senderID, { balance: user.balance - debtVal, debt: 0 });
        return api.sendMessage(`🝓 تم تسديد الدين بقيمة ${debtVal} عملة.`, threadID, messageID);
    }

    if (action === "تحويل") {
        const targetID = Object.keys(event.mentions)[0] || args[1];
        const tAmount = parseInt(args[2]);
        if (!targetID || !tAmount || tAmount <= 0) return api.sendMessage("○ استخدم: بنك تحويل [منشن] [المبلغ]", threadID, messageID);
        if (user.balance < tAmount) return api.sendMessage("○ رصيدك لا يكفي للتحويل.", threadID, messageID);
        const targetUser = await eco.getUser(targetID);
        await eco.saveUser(senderID, { balance: user.balance - tAmount });
        await eco.saveUser(targetID, { balance: (targetUser.balance || 0) + tAmount });
        return api.sendMessage(`🝓 تم تحويل ${tAmount} عملة إلى الحساب المحدد.`, threadID, messageID);
    }

    const bankUI = `╮───────∙⋆⋅ ※ ⋅⋆∙───────╭
    الـمـركـز الـمـالـي الـرئـيـسي
╯───────∙⋆⋅ ※ ⋅⋆∙───────╰

╮────∙⋆⋅「 حـسـابـي 」
│ › الـنـقـد : ${user.balance} ▱
│ › الـبنـك : ${user.bank} ▱
│ › الـديـن : ${user.debt} ▱
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈

╮────∙⋆⋅「 الـعـمـلـيـات 」
│ › بنك ايداع [المبلغ]
│ › بنك سحب [المبلغ]
│ › بنك تحويل [منشن] [المبلغ]
│ › بنك قرض | بنك تسديد
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈

╮───────∙⋆⋅ ※ ⋅⋆∙───────◈
│ الـحـالـة : ${user.debt > 0 ? "مطلوب مالياً ⚠" : "مستقر بنكياً ✓"}
│ الـمـطور : DANTE
│ اسـتـخــدم : بنك [الامر] 
╯───────∙⋆⋅ ※ ⋅⋆∙───────◈`;

    return api.sendMessage(bankUI, threadID, messageID);
  }
};
