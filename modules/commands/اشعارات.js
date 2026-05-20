const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "اشعارات",
    version: "4.6.0",
    hasPermission: 1,
    credits: "DANTE SPARDA",
    description: "منظومة إشعارات المستويات المتقدمة مع خيارات تحكم ذكية وعكسية",
    commandCategory: "النظام",
    cooldowns: 2
  },

  handleEvent: async function ({ api, event, Currencies, Users, Threads }) {
    let { threadID, senderID, messageID } = event;
    if (!threadID || !senderID) return;

    threadID = String(threadID);
    senderID = String(senderID);

    const threadData = (await Threads.getData(threadID))?.data || {};
    if (threadData.rankup === false) return;

    // جلب بيانات العملات والتفاعل الحالي
    let userCurrency = await Currencies.getData(senderID) || {};
    let exp = userCurrency.exp || 0;
    exp = exp + 1;

    if (isNaN(exp)) return;

    // معادلة حساب المستويات الهندسية
    const curLevel = Math.floor(Math.sqrt(1 + (4 * exp / 3) + 1) / 2);
    const level = Math.floor(Math.sqrt(1 + (4 * (exp + 1) / 3) + 1) / 2);

    // تحديث نقاط الخبرة في السيرفر
    await Currencies.setData(senderID, { exp });

    // تفعيل الإشعار عند قفز المستوى
    if (level > curLevel && level !== 1) {
      const name = (global.data.userName.get(senderID)) || await Users.getNameUser(senderID);
      
      // حسابات برمجية دقيقة لإحصائيات العضو
      const nextLevelExp = Math.floor((Math.pow(2 * (level + 1) - 1, 2) - 1) * 3 / 4);
      const currentLevelExp = Math.floor((Math.pow(2 * level - 1, 2) - 1) * 3 / 4);
      
      const progress = exp - currentLevelExp;
      const needed = nextLevelExp - currentLevelExp;
      const remaining = nextLevelExp - exp;

      // شريط التقدم الهندسي
      const barLength = 10;
      const completedBlocks = Math.min(barLength, Math.floor((progress / needed) * barLength));
      const progressBar = "▰".repeat(completedBlocks) + "▱".repeat(barLength - completedBlocks);

      // صياغة التصميم الهندسي للمظهر والبيانات
      const outputMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖳 𝖴 𝖲   𝖫 𝖤 𝖵 𝖤 𝖫   𝖴 𝖯\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `👑 ∘ تـهـانـيـنـا : ${name}\n` +
        `⚡ ∘ الـمـسـتـوى الـجـديـد : 【 ${level} 】\n\n` +
        `   📊 𝖲 𝖳 𝖤 𝖳 𝖲   𝖨 𝖭 𝖥 𝖮 :\n` +
        ` ⊞ الـتـقـدم ∘ ${progressBar}\n` +
        ` ⊞ الـخـبـرة الـحـالـيـة ∘ ${exp} XP\n` +
        ` ⊞ الـمـتـبـقـي للـقـفـز ∘ ${remaining} رسالة\n\n` +
        ` ⎔ الـنـظـام : ڪايروس الفخم`;

      const backgrounds = [
        "https://i.ibb.co/DffbB7x/2-7-BDCACE.png",
        "https://i.ibb.co/606p1ZF/1-C0-CF112.png",
        "https://i.ibb.co/54b5KY6/3-10100-BC.png",
        "https://i.ibb.co/4RHd3mM/4-AB4-CF2-B.png",
        "https://i.ibb.co/7WHKF0H/9-498-C5-E0.png",
        "https://i.ibb.co/nPfY3HN/8-ADA7767.png",
        "https://i.ibb.co/Ldctgw4/5-49-F92-DC.png",
        "https://i.ibb.co/J29hdFW/6-EB49-EF4.png"
      ];
      const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      const imgPath = path.join(__dirname, "..", "..", "cache", `lvl_${senderID}.png`);

      try {
        api.setMessageReaction("👑", messageID, () => {}, true);

        const response = await axios.get(randomBg, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data, "utf-8"));

        return api.sendMessage({
          body: outputMessage,
          mentions: [{ tag: name, id: senderID }],
          attachment: fs.createReadStream(imgPath)
        }, threadID, () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

      } catch (e) {
        return api.sendMessage(outputMessage, threadID);
      }
    }
  },

  // نظام التحكم الذكي بالأمر الرئيسي
  run: async function ({ api, event, args, Threads }) {
    const { threadID, messageID } = event;
    let thread = await Threads.getData(threadID) || {};
    let data = thread.data || {};

    const choice = args[0]?.trim();

    // 1. حالة كتابة "/اشعارات تشغيل"
    if (choice === "تشغيل") {
      data.rankup = true;
      api.setMessageReaction("✅", messageID, () => {}, true);
      await Threads.setData(threadID, { data });
      return api.sendMessage("🔔 تم تفعيل منظومة إشعارات المستويات (Rankup) داخل هذه المجموعة.", threadID, messageID);
    }

    // 2. حالة كتابة "/اشعارات ايقاف"
    if (choice === "ايقاف") {
      data.rankup = false;
      api.setMessageReaction("❌", messageID, () => {}, true);
      await Threads.setData(threadID, { data });
      return api.sendMessage("🔕 تم تعطيل إشعارات المستويات لهذه المجموعة.", threadID, messageID);
    }

    // 3. حالة كتابة "/اشعارات" فقط (النظام العكسي التلقائي)
    if (!choice) {
      if (typeof data.rankup === "undefined" || data.rankup === false) {
        data.rankup = true;
        api.setMessageReaction("✅", messageID, () => {}, true);
        await Threads.setData(threadID, { data });
        return api.sendMessage("🔔 [نظام عكسي] تم تفعيل إشعارات المستويات للمجموعة.", threadID, messageID);
      } else {
        data.rankup = false;
        api.setMessageReaction("❌", messageID, () => {}, true);
        await Threads.setData(threadID, { data });
        return api.sendMessage("🔕 [نظام عكسي] تم إيقاف إشعارات المستويات للمجموعة.", threadID, messageID);
      }
    }

    // في حال كتابة خيار آخر خاطئ
    return api.sendMessage("❓ خيار غير صحيح. استخدم: [اشعارات تشغيل / اشعارات ايقاف] أو اكتب [اشعارات] فقط للعكس.", threadID, messageID);
  }
};
