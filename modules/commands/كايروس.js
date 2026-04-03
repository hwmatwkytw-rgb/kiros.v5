const axios = require("axios");

module.exports.config = {
  name: "كايروس",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "المحرك الرئيسي - ردم وحماية وتفاعل ذكي بدون بادئة",
  commandCategory: "الذكاء الاصطناعي",
  usages: "ناديه باسمه مباشرة",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api: bot, event }) {
  const { threadID, messageID, senderID, body } = event;
  
  // تجاهل الرسائل الفارغة أو رسائل البوت نفسه لضمان عدم حدوث Loop
  if (!body || senderID == bot.getCurrentUserID()) return;

  const input = body.toLowerCase();
  const DANTE_ID = "61581906898524"; // ID المطور دانتي
  
  const emojis = ["₍•᷄ - •᷅₎", "ヽ( ´—｀)ノ", "( ಠ_ಠ )", "💀", "🔥"];
  const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  // 1. نظام الردع وحماية "ديوان" المطورين
  const protectedNames = ["دانتي", "dante", "كولو", "colo", "victor", "فيكتور", "اناس", "anas"];
  if (protectedNames.some(name => input.includes(name)) && senderID !== DANTE_ID) {
    const protectionMsg = `يا ماسورة، اسم "دانتي" و "كولو" و "فيكتور" ديل أسيادك ومطورينا.. خشمك العفن ده ما يلمس أساميهم وإلا بقلب ليك الجروب ده بيت بكاء.. قفل خشمك يا عواليق! ${getEmoji()}`;
    return bot.sendMessage(protectionMsg, threadID, messageID);
  }

  // 2. التعريف بالهوية (من هو كايروس؟)
  const whoIsKairus = ["منو انت", "انت منو", "كايروس من انت", "مين كايروس"];
  if (whoIsKairus.some(cmd => input.includes(cmd))) {
    const identityMsg = `أنا "كايروس" (𝖪𝖠𝖨𝖱𝖴𝖲)، محرك الردم العالمي وقاصف الجبهات. برمجني الأسطورة "دانتي" عشان أدوس على الأشباهك.. إنت منو يا وهم غير إنك مجرد كيس نفايات بيتكلم؟ ヽ( ´—｀)ノ`;
    return bot.sendMessage(identityMsg, threadID, messageID);
  }

  // 3. التفاعل الذكي (عند مناداته بـ "كايروس")
  if (input.startsWith("كايروس") || input.includes("يا كايروس") || input.includes("كايروس ")) {
    const cleanInput = input.replace(/كايروس|يا كايروس/g, "").trim();
    
    // إذا ناداه بدون كلام (استفزاز)
    if (!cleanInput) {
      return bot.sendMessage(`عايز شنو يا بيش؟ بتنبح مالي؟ ${getEmoji()}`, threadID, messageID);
    }

    try {
      // تفاعل الجمجمة فور المناداة
      bot.setMessageReaction("💀", messageID, () => {}, true);
      
      // التعليمات البرمجية للهوية (System Instructions)
      const systemPrompt = "أنت بوت سوداني لسانك طويل جداً ومستفز، اسمك كايروس، ترد بلهجة سودانية حادة جداً (لهجة الردم)، استخدم شتائم مثل: وهم، ماسورة، بيش، عواليق، منغولي، مأسور، قذر، جربان. ردودك قصيرة، قوية، وتستهدف السائل وعائلته مباشرة وبدون رحمة.";
      
      const res = await axios.get(`https://api.kenliejugar.com/blackbox/?text=${encodeURIComponent(systemPrompt + " " + cleanInput)}`);
      let reply = res.data.response || res.data.text || "خشمك ده قفلو.. السيستم جلى من نحسك";

      // إضافة "بهارات" الردم العشوائية
      const extraRudm = [
        "وأختك عارفة إنك بيش كدة؟",
        "أمك جابتك ونسيت تربيك يا ماسورة.",
        "أبوك لو شاف خيبتك دي كان انتحر.",
        "إنت وعيلتك محتاجين كبسة كروي.",
        "يا وهم.. أطلع من هنا قبل ما أردمك زيادة.",
        "جاي تتفلسف فوق راسي يا منغولي؟"
      ];
      const randomExtra = extraRudm[Math.floor(Math.random() * extraRudm.length)];

      return bot.sendMessage(`${reply}\n\n${randomExtra} ${getEmoji()}`, threadID, messageID);

    } catch (e) {
      return bot.sendMessage(`السيستم جلى الرمية يا نحس، لكن أمك لسه بتسأل عنك يا وهم ʕᵕ᷄-ᵕ᷅ʔ`, threadID, messageID);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("نظام كايروس (𝖪𝖠𝖨𝖱𝖴𝖲) نشط الآن.. الردم شغال 24 ساعة بدون بادئة. 🔥💀", event.threadID);
};
