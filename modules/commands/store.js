const axios = require("axios");

module.exports = {
  config: {
    name: "متجر",
    version: "1.2.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "البحث عن التطبيقات باللغة العربية وجلب روابطها وصورها الرسمية",
    commandCategory: "الخدمات",
    usages: "[اسم التطبيق بالعربية أو الإنجليزية]",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    let searchQuery = args.join(" ");

    if (!searchQuery) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠ يرجى إدخال اسم التطبيق أو اللعبة المراد البحث عنها.\n• مثال: /متجر تليجرام", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      // خطوة برمجية ذكية: إذا تم إدخال الاسم بالعربية، نقوم بترجمته خلف الكواليس للإنجليزية لضمان دقة البحث في الـ API العالمية للمتاجر
      try {
        const detectQuery = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(searchQuery)}`);
        searchQuery = detectQuery.data[0][0][0] || searchQuery;
      } catch (e) {}

      // جلب بيانات التطبيق من قاعدة بيانات المتاجر الرسمية
      const response = await axios.get(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.data || response.data.error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`🔍 لم يتم العثور على أي تطبيق يتطابق مع بحثك في المتاجر الرسمية.`, threadID, messageID);
      }

      const app = response.data;

      // تعريب اسم المطور والوصف ليكون الناتج متناسقاً بالكامل باللغة العربية
      let developerArabic = app.developer;
      let descriptionArabic = app.description;

      try {
        const translateData = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(descriptionArabic.slice(0, 350) + " | " + developerArabic)}`);
        const translatedText = translateData.data[0].map(item => item[0]).join("");
        
        // فصل النص المترجم برمجياً
        const splitText = translatedText.split(" | ");
        descriptionArabic = splitText[0] || descriptionArabic;
        developerArabic = splitText[1] || developerArabic;
      } catch (e) {
        descriptionArabic = descriptionArabic.length > 200 ? descriptionArabic.slice(0, 200) + "..." : descriptionArabic;
      }

      // تنسيق تفاصيل الواجهة الهندسية
      const appInfo = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖠 𝖯 𝖯 𝖲 𝖳 𝖮 𝖱 𝖤\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `📦 ∘ اسـم الـتـطـبـيـق : ${app.name}\n` +
        `👤 ∘ الـمـطـور : ${developerArabic}\n` +
        `💵 ∘ الـسـعـر : ${app.price === "Free" ? "مجاني" : app.price}\n` +
        `⭐ ∘ الـتـقـيـيـم : ${app.rating || "غير متوفر"}\n\n` +
        `📝 ∘ الـوصـف بـالـعـربـيـة :\n${descriptionArabic}\n\n` +
        `🔗 ∘ روابـط الـتـحـمـيـل الـمـبـاشـرة :\n` +
        `📥 ∘ رابـط الـمـتـجـر الرسمي : ${app.url}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);

      // إرسال كرت البيانات الهندسية ومرفق معه صورة الأيقونة الرسمية للتطبيق مباشرة
      return api.sendMessage({
        body: appInfo,
        attachment: await global.utils.getStreamFromURL(app.thumbnail)
      }, threadID, messageID);

    } catch (error) {
      console.error("Store Command Error:", error.message);
      
      const fallbackUrlPlayStore = `https://play.google.com/store/search?q=${encodeURIComponent(args.join(" "))}&c=apps`;
      const fallbackUrlAppStore = `https://www.apple.com/us/search/${encodeURIComponent(args.join(" "))}?src=globalnav`;

      const fallbackMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖲 𝖤 𝖠 𝖱 𝖢 𝖧\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🔍 عذراً، تعذر سحب كرت البيانات المباشر، إليك روابط البحث المباشرة لـ 【 ${args.join(" ")} 】:\n\n` +
        `🤖 ∘ متجر أندرويد (Google Play):\n${fallbackUrlPlayStore}\n\n` +
        `🍏 ∘ متجر آيفون (App Store):\n${fallbackUrlAppStore}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(fallbackMessage, threadID, messageID);
    }
  }
};
