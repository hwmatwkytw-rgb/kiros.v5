const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "سلوت",
    version: "4.5.0",
    hasPermssion: 0,
    credits: "VICTOR",
    description: "نظام عجلة الحظ المتكامل بتأثير الدوران الحركي والتصنيف الهندسي",
    commandCategory: "ترفيه",
    usages: "سلوت",
    cooldowns: 4
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    // ─── [ 1. نظام تخزين البيانات الداخلي والمحاكاة ] ───
    const dataPath = path.join(__dirname, "cache", "slots_data.json");
    if (!fs.existsSync(path.join(__dirname, "cache"))) {
      fs.ensureDirSync(path.join(__dirname, "cache"));
    }
    
    let db = {};
    if (fs.existsSync(dataPath)) {
      try { db = fs.readJsonSync(dataPath); } catch (e) { db = {}; }
    }

    if (!db[senderID]) {
      db[senderID] = { xp: 0, level: 1, wins: 0, loses: 0, totalSpins: 0, lastSpin: 0 };
    }
    let user = db[senderID];

    // ─── [ 2. مصفوفة الرموز المتقدمة واحتمالاتها ] ───
    const items = [
      { emoji: "🔵", weight: 30, name: "البلوغرانا الأزرق" },
      { emoji: "🔴", weight: 30, name: "البلوغرانا الأحمر" },
      { emoji: "⚽", weight: 25, name: "الكرة الذهبية" },
      { emoji: "⚔️", weight: 15, name: "سيف الحسم" },
      { emoji: "👑", weight: 8,  name: "التاج الملكي" },
      { emoji: "💎", weight: 5,  name: "الماس النادر" }
    ];

    // دالة السحب بناءً على الأوزان (الاحتمالات)
    function getRandomItem() {
      let totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.random() * totalWeight;
      for (let i = 0; i < items.length; i++) {
        randomNum -= items[i].weight;
        if (randomNum <= 0) return items[i].emoji;
      }
      return items[0].emoji;
    }

    // ─── [ 3. إعداد إطارات الحركة التخيلية (Spinning Frames) ] ───
    const frames = [
      `[  ⏳  |  ⏳  |  ⏳  ]\n\n 🎰 جـاري تـدويـر الـبـكـرات...\n 🫵 ثـبـت عـيـنـك هـنـا`,
      `[  🔴  |  ⚡  |  🔵  ]\n\n 👇 الـعـجـلـة تـتـبـاطـأ الآن...\n 🫵 تـهـيـأ لـلـنـتـيـجـة`,
      `[  💎  |  👑  |  ⚔️  ]\n\n 🎰 يـتـم الآن الـتـقـاط الـرمـوز...\n 🫵 الـحـظ يـخـتـارك`
    ];

    const introMsg = `╭─── • ⎔ • ───╮\n   sʟᴏᴛ ᴍᴀᴄʜɪɴᴇ\n╰─── • ⎔ • ───╯\n\n${frames[0]}\n\n ══════════════\n " جاري بدء المحاكاة الرقمية "`;

    // إرسال الإطار الأول والبدء في الحركة والتعديل التلقائي
    api.sendMessage(introMsg, threadID, async (err, info) => {
      if (err) return;
      const targetMessageID = info.messageID;

      // الإطار الحركي الثاني بعد 700 ملي ثانية
      setTimeout(() => {
        const frame2 = `╭─── • ⎔ • ───╮\n   sʟᴏᴛ ᴍᴀᴄʜɪَن\n╰─── • ⎔ • ───╯\n\n${frames[1]}\n\n ══════════════\n " جاري معالجة المصفوفات "`;
        api.editMessage(frame2, targetMessageID);
      }, 700);

      // الإطار الحركي الثالث بعد 1400 ملي ثانية
      setTimeout(() => {
        const frame3 = `╭─── • ⎔ • ───╮\n   sʟᴏᴛ ᴍᴀᴄʜɪɴᴇ\n╰─── • ⎔ • ───╯\n\n${frames[2]}\n\n ══════════════\n " لحظة الاختيار والتحليل "`;
        api.editMessage(frame3, targetMessageID);
      }, 1400);

      // حساب النتيجة النهائية وإظهارها بعد 2200 ملي ثانية
      setTimeout(async () => {
        const slot1 = getRandomItem();
        const slot2 = getRandomItem();
        const slot3 = getRandomItem();

        let status = "";
        let prize = "";
        let xpGained = 0;

        // حساب الفوز والخسارة وتوزيع الخبرة XP
        if (slot1 === slot2 && slot2 === slot3) {
          status = "🎰 فـوز سـاحـق ⌁ Jᴀᴄᴋᴘᴏᴛ";
          prize = "تطابق كلي خارق! لقد حطمت العجلة بالكامل واستحوذت على الجائزة الكبرى ✨";
          xpGained = 150;
          user.wins += 1;
        } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
          status = "🎉 فـوز مـتـوسـط ⌁ Wɪɴ";
          prize = "تطابق ثنائي ممتاز! كسبت جولة سريعة ورفعت رصيد حظك ⚡";
          xpGained = 50;
          user.wins += 1;
        } else {
          status = "💀 لـقـد خـسـرت ⌁ Lᴏsᴇ";
          prize = "لم تطبق الرموز بالشكل المطلوب. عُد للميدان وحاول مجدداً 🪵";
          xpGained = 15;
          user.loses += 1;
        }

        // تحديث نظام اللفل والخبرة والتصنيفات
        user.xp += xpGained;
        user.totalSpins += 1;
        
        const nextLevelXp = user.level * 350;
        if (user.xp >= nextLevelXp) {
          user.level += 1;
          user.xp = user.xp - nextLevelXp;
        }

        // حفظ التحديثات في ملف الكاش
        fs.writeJsonSync(dataPath, db, { spaces: 2 });

        // تحديد لقب الرتبة هندسياً بناءً على اللفل
        let rank = "مبتدئ ⌁ Rook";
        if (user.level >= 5) rank = "مقاتل ⌁ Fighter";
        if (user.level >= 10) rank = "محترف ⌁ Elite";
        if (user.level >= 20) rank = "أسطوري ⌁ Legend";
        if (user.level >= 40) rank = "خارق ⌁ Immortal";

        // بناء الواجهة النهائية المستقرة بدقة بالغة وبأسلوب نحيف حاد
        const finalMsg = `╭─── • ⎔ • ───╮\n   sʟᴏᴛ ᴍᴀᴄʜɪɴᴇ\n╰─── • ⎔ • ───╯\n\n 🫵 [  ${slot1}  |  ${slot2}  |  ${slot3}  ] 👇\n\n ✥ الـحـالـة ⌁ ${status}\n ✥ الـنـتـيـجـة ⌁ ${prize}\n\n─── • الإحـصـائـيـات الـرقـمـيـة • ───\n 📊 الـمـسـتـوى ⌁ Lᴠ ${user.level} [ ${user.xp}/${user.level * 350} XP ]\n 👑 الـرُّتـبـة ⌁ ${rank}\n ⚔️ الـمـحـاولات ⌁ ${user.totalSpins}\n 📈 الـفـوز/الـخـسـارة ⌁ W: ${user.wins} | L: ${user.loses}\n ══════════════\n " Visca el Barça i visca Catalunya "`;

        api.editMessage(finalMsg, targetMessageID);
      }, 2200);
    }, messageID);
  }
};
