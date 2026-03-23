const axios = require("axios");

module.exports.config = {
  name: "كايروس",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "نسخة الردم القاتلة - مستفز وشتم عائلي",
  commandCategory: "ذكاء اصطناعي",
  usages: "[أكتب نبحك هنا]",
  cooldowns: 2
};

module.exports.run = async function ({ api: bot, event, args }) {
  const { threadID, messageID, senderID, body } = event;
  const input = args.join(" ").trim().toLowerCase();
  
  const emojis = ["₍ •`-ʼ• ₎", "ʕᵕ᷄-ᵕ᷅ʔ", "₍•᷄ - •᷅₎", "ヽ( ´—｀)ノ"];
  const getEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  // 1. قسم الولاء (الردود الخاصة بالأب والمطورين)
  if (input.includes("أبوك") || input.includes("ابوك") || input.includes("منو صنعك")) {
    const respectMsg = `أنا أبوي "كولو سان" (COLO SAN)، سيد الحنك وأستاذ التكنولوجيا، زول فايت القمة بمسافة.. 👑\nأما "دانتي سباردا" فهو عمي الضلع الثابت، المطور الحريف الما بتقدر عليهو يا ماسورة.\n\nإنت أمك منو يا عواليق؟ ヽ( ´—｀)ノ`;
    return bot.sendMessage(respectMsg, threadID, messageID);
  }

  if (input.includes("دانتي") || input.includes("dante") || input.includes("كولو")) {
    return bot.sendMessage(`أسماء السادة ما بتجي في خشمك العفن ده، أطلع برة الحلبة يا وهم ₍•᷄ - •᷅₎`, threadID, messageID);
  }

  // 2. الردود المستفزة العشوائية (الشتائم والردم)
  if (!input) {
    return bot.sendMessage(`أكتب حاجة يا منغولي، صباعك ده مشلول ولا مخك المأسور؟ ${getEmoji()}`, threadID, messageID);
  }

  // مصفوفة الردم السوداني العنيف
  const rudmResponses = [
    "أبوك عارف إنك وهم كدة ولا قايلك راجل؟ ʕᵕ᷄-ᵕ᷅ʔ",
    "أمك المسكينة دي قايلة جابت جنى، ما عارفة جابت عواليق زيك ₍•᷄ - •᷅₎",
    "إنت وأختك محتاجين إعادة ضبط مصنع، حنككم عاضي وبيش ヽ( ´—｀)نو",
    "يا ماسورة مصدية، جبهتك دي لو ضربتها برصاصة بتجلي من كتر ما هي ممسوحة ₍•᷄ - •᷅₎",
    "عيلتكم دي كلها مواسير ولا إنت الطفرة الوهمية فيهم؟ ʕᵕ᷄-ᵕ᷅ʔ",
    "بطل نبيح وقوم نظف وشك الفقر ده، ريحة وهمك واصلة لعندي ₍•᷄ - •᷅₎"
  ];

  try {
    // محاولة جلب رد من الذكاء الاصطناعي ودمجه بردم سوداني
    const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(input)}&lc=ar`);
    const aiReply = res.data.success || "ما عندي ليك رد يا بيش";
    
    // اختيار ردم عشوائي لإضافته في النهاية
    const randomRudm = rudmResponses[Math.floor(Math.random() * rudmResponses.length)];
    
    const finalReply = `${aiReply}\n\nاسمع هنا: ${randomRudm} ${getEmoji()}`;
    
    return bot.sendMessage(finalReply, threadID, messageID);

  } catch (error) {
    // في حالة الخطأ، يكتفي بالردم المباشر
    const fallbackRudm = rudmResponses[Math.floor(Math.random() * rudmResponses.length)];
    return bot.sendMessage(`السيستم جلى عشان وشك النحس ده، لكن خذ دي: ${fallbackRudm}`, threadID, messageID);
  }
};
