const axios = require("axios");

module.exports.config = {
  name: "كايروس_المستمع",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "نسخة الردم المباشر بدون بادئة - حماية دانتي وكولو",
  commandCategory: "ذكاء اصطناعي",
  usages: "تحدث معه مباشرة",
  cooldowns: 0
};

// وظيفة handleEvent تجعله يرد بدون بادئة
module.exports.handleEvent = async function ({ api: bot, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body) return;

  const input = body.toLowerCase();
  const DEV_ID = "61581906898524"; // ID دانتي
  const COLO_ID = "61581906898524"; // يمكنك وضع ID كولو هنا إذا اختلف
  
  const emojis = ["₍ •`-ʼ• ₎", "ʕᵕ᷄-ᵕ᷅ʔ", "₍•᷄ - •᷅₎", "ヽ( ´—｀)ノ"];
  const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  // 1. حماية المطورين (ردع أي إساءة لدانتي أو كولو)
  const names = ["دانتي", "dante", "كولو", "colo"];
  if (names.some(name => input.includes(name)) && senderID !== DEV_ID) {
    const protectionMsg = `اسمع هنا يا عواليق، اسم "دانتي" و "كولو" ديل أسيادك، خشمك العفن ده ما يلمس أساميهم وإلا بقلب ليك الجروب ده بيت بكاء.. قفل خشمك يا ماسورة! ₍•᷄ - •᷅₎`;
    return bot.sendMessage(protectionMsg, threadID, messageID);
  }

  // 2. التعريف بالنفس (من أنت؟) مع شتم السائل
  if (input === "كايروس من انت" || input === "منو انت" || input === "انت منو") {
    const identityMsg = `أنا "كايروس" سيد الردم وقاصف الجبهات، برمجني عمي دانتي عشان أدوس على المواسير الأشباهك.. إنت منو يا وهم غير إنك مجرد كيس نفايات بيتكلم؟ ヽ( ´—｀)ノ`;
    return bot.sendMessage(identityMsg, threadID, messageID);
  }

  // 3. الرد على "كايروس" أو أي مناداة له (بدون بادئة)
  if (input.startsWith("كايروس") || input.includes("يا كايروس")) {
    const cleanInput = input.replace("كايروس", "").trim();
    
    // إذا ناداه فقط بدون كلام
    if (!cleanInput) {
      return bot.sendMessage(`عايز شنو يا عواليق؟ بتنبح مالي؟ ${getEmoji()}`, threadID, messageID);
    }

    try {
      const systemInstruction = "أنت بوت سوداني لسانك طويل جداً ومستفز، اسمك كايروس، ترد بلهجة سودانية حادة، اشتم السائل بأمه وأبيه وأخته، استخدم كلمات: وهم، ماسورة، بيش، عواليق، منغولي، مأسور. ردودك قصيرة وساخرة جداً.";
      
      const res = await axios.get(`https://api.kenliejugar.com/blackbox/?text=${encodeURIComponent(systemInstruction + " " + cleanInput)}`);
      let reply = res.data.response || res.data.text;

      // إضافة ردم عشوائي إضافي لضمان "الثقل"
      const extraRudm = [
        "وأختك عارفة إنك بيش كدة؟",
        "أمك جابتك ونسيت تربيك يا ماسورة.",
        "أبوك لو شاف خيبتك دي كان انتحر.",
        "إنت وعيلتك محتاجين كبسة كروي."
      ];
      const randomExtra = extraRudm[Math.floor(Math.random() * extraRudm.length)];

      return bot.sendMessage(`${reply}\n\n${randomExtra} ${getEmoji()}`, threadID, messageID);

    } catch (e) {
      return bot.sendMessage(`السيستم جلى الرمية يا نحس، لكن أمك لسه بتسأل عنك يا وهم ʕᵕ᷄-ᵕ᷅ʔ`, threadID, messageID);
    }
  }
};

// وظيفة run تبقى فارغة أو للتعريف بالأمر
module.exports.run = async function ({ api, event }) {
  api.sendMessage("أنا شغال 24 ساعة ردم بدون بادئة، جرب ناديني بس..", event.threadID);
};
