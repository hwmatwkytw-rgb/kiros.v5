module.exports = {
  config: {
    name: "تحميل", // اسم الأمر الذي يكتبه المستخدم
    version: "1.1.0",
    hasPermssion: 0,
    credits: "rX & YUMI",
    description: "تحميل فيديوهات من اليوتيوب، تيك توك، إنستغرام، وفيسبوك عبر الرابط",
    commandCategory: "الخدمات",
    usages: "[الرابط]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { alldown } = require("rx-dawonload");

    // التحقق من وجود رابط بعد كلمة تحميل
    const content = args.join(" ");
    if (!content || !content.startsWith("https://")) {
      return api.sendMessage("❌ يرجى وضع رابط صحيح بعد كلمة 'تحميل'\nمثال: تحميل https://tiktok.com/...", event.threadID, event.messageID);
    }

    // معرف الطلب (رقم عشوائي أو معرف الرسالة)
    const requestId = event.messageID.split("-").pop() || Math.floor(Math.random() * 1000000);

    try {
      // تحديد المنصة
      let site = "غير معروف";
      if (content.includes("youtube.com") || content.includes("youtu.be")) site = "YouTube 📺";
      else if (content.includes("tiktok.com")) site = "TikTok 🎵";
      else if (content.includes("instagram.com")) site = "Instagram 📸";
      else if (content.includes("facebook.com")) site = "Facebook 💙";

      // تفاعل البحث
      api.setMessageReaction("🔍", event.messageID, () => {}, true);

      // جلب بيانات الفيديو
      const data = await alldown(content);
      if (!data || !data.url) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("⚠️ عذراً، لم أتمكن من جلب هذا الفيديو. تأكد من أن الرابط عام وليس خاصاً.", event.threadID, event.messageID);
      }

      const title = data.title || "بدون عنوان";
      const videoUrl = data.url;

      // تفاعل التحميل
      api.setMessageReaction("⬇️", event.messageID, () => {}, true);

      // تحميل الملف
      const videoBuffer = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
      const filePath = __dirname + "/cache/" + requestId + ".mp4";
      fs.writeFileSync(filePath, Buffer.from(videoBuffer, "utf-8"));

      // إرسال الرسالة بالستايل الأنيق
      const stylishBody = 
        `✅ تم التحميل بنجاح!\n` +
        `━━━━━━━━━━━━━━━\n` +
        `🆔 معرف الطلب: ${requestId}\n` +
        `📍 المنصة: ${site}\n` +
        `🎬 العنوان: ${title}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `『 ⚙︎ 𝒀𝑼𝑴𝑰  ͡🦋͜  𝑩𝑶𝑻  』في الخدمة`;

      api.sendMessage(
        {
          body: stylishBody,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        (err) => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (!err) api.setMessageReaction("✅", event.messageID, () => {}, true);
          else api.setMessageReaction("❌", event.messageID, () => {}, true);
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("حدث خطأ تقني أثناء المحاولة.", event.threadID, event.messageID);
    }
  },
};
