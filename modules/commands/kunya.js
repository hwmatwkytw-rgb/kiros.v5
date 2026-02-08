module.exports.config = {
  name: "كنية",
  version: "1.2.0",
  hasPermssion: 1, 
  credits: "Gemini",
  description: "تعيين أو حذف كنية لعضو أو لنفسك (للأدمن فقط)",
  commandCategory: "الإدارة",
  usages: "[الكنية] أو [فارغ للحذف] بالرد أو التاغ",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  try {
    // التحقق من صلاحيات الأدمن
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    
    if (!adminIDs.includes(senderID)) return;

    let targetID;
    let nickname;

    // 1. حالة الرد على رسالة
    if (type === "message_reply") {
      targetID = messageReply.senderID;
      nickname = args.join(" "); // إذا كان args فارغ سيقوم بحذف الكنية
    } 
    // 2. حالة التاغ (المنشن)
    else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      // إزالة اسم الشخص المذكور من النص للحصول على الكنية فقط
      nickname = args.join(" ").replace(mentions[targetID], "").trim();
    } 
    // 3. حالة استهداف النفس (أو كتابة الأمر بمفرده)
    else {
      targetID = senderID;
      nickname = args.join(" ");
    }

    // التنفيذ: إذا كانت الكنية فارغة سيتم تصفيرها (حذفها)
    // القيمة "" في changeNickname تعيد الاسم الأصلي
    api.changeNickname(nickname ? nickname : "", threadID, targetID, (err) => {
      if (err) return console.error("خطأ في تغيير الكنية:", err);
    });

  } catch (e) {
    console.error("خطأ في أمر الكنية:", e);
  }
};
