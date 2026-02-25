const axios = require("axios");

module.exports.config = {
  name: "اضف",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "إضافة عضو إلى المجموعة عبر الأيدي أو الرابط",
  commandCategory: "الخدمات",
  usages: "[ID / رابط الحساب]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  let input = args.join(" ");

  if (!input) return api.sendMessage("╭── • 📥 • ──╮\n يرجى وضع ID الشخص أو رابط حسابه\n╰── • 📥 • ──╯", threadID, messageID);

  api.setMessageReaction("📥", messageID, () => {}, true);

  try {
    let uid;

    // التحقق إذا كان المدخل رابطاً
    if (input.includes("facebook.com") || input.includes("fb.com")) {
      // محاولة استخراج الـ ID من الرابط (باستخدام API بسيط أو regex)
      try {
        const res = await axios.get(`https://share-v2-api.onrender.com/fb/find-uid?url=${encodeURIComponent(input)}`);
        uid = res.data.uid;
      } catch (e) {
        // إذا فشل الـ API الخارجي، نحاول استخراج الـ ID إذا كان موجوداً بوضوح في الرابط
        const regex = /(?:profile\.php\?id=|facebook\.com\/)([\d.]+)/;
        const match = input.match(regex);
        uid = match ? match[1] : null;
      }
    } else {
      // إذا كان المدخل رقماً (ID) مباشرة
      uid = input;
    }

    if (!uid || isNaN(uid)) {
      return api.sendMessage("⚠️ تعذر استخراج ID العضو من هذا الرابط. تأكد من صحته.", threadID, messageID);
    }

    // محاولة إضافة العضو للمجموعة
    api.addUserToGroup(uid, threadID, (err) => {
      if (err) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        if (err.error == 1357031) return api.sendMessage("❌ هذا الشخص موجود بالفعل في المجموعة.", threadID, messageID);
        return api.sendMessage("❌ لا يمكنني إضافة هذا الشخص. قد تكون إعدادات خصوصيته تمنع الإضافة أو لست مسؤولاً.", threadID, messageID);
      } else {
        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage(`╭── • ڪايࢪوس • ──╮\n  ⌈ تـمـت الإضـافـة ⌋\n╰── • 👤 • ──╯\n\n✅ تم إرسال دعوة للإضافة بنجاح.\n\n『 ⚙︎ ڪايࢪوس  ͡🦋͜  𝑩𝑶𝑻 』`, threadID, messageID);
      }
    });

  } catch (error) {
    return api.sendMessage("❌ حدث خطأ تقني أثناء محاولة الإضافة.", threadID, messageID);
  }
};
