module.exports.config = {
  name: "كنيات",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Gemini",
  description: "تغيير كنيات الأعضاء بسرعة مع تقارير مرحلية",
  commandCategory: "المطور",
  usages: "[الكنية تحتوي على كلمة اسم]",
  cooldowns: 20
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const adminID = "61570782968645"; 

  if (senderID !== adminID) {
    return api.sendMessage("⚠️ عذراً، هذا الأمر مخصص لمطور البوت فقط.", threadID, messageID);
  }

  const format = args.join(" ");
  if (!format || !format.includes("اسم")) {
    return api.sendMessage("⚠️ يرجى كتابة التنسيق المطلوب.\nمثال: كنيات الفخم اسم", threadID, messageID);
  }

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const userIDs = threadInfo.participantIDs.slice(0, 250);
    let successCount = 0;

    // التفاعل بانتظار
    api.setMessageReaction("⌚", messageID, () => {}, true);
    api.sendMessage(`🚀 بدأت العملية لـ ${userIDs.length} عضو...\nسأقوم بإعلامك كل 50 كنية.`, threadID);

    // دالة لتغيير الكنية مع معالجة الأخطاء
    const changeName = async (id) => {
      try {
        const userInfo = await api.getUserInfo(id);
        const firstName = userInfo[id].name.split(" ")[0] || "User";
        const newNickname = format.replace(/[\(\[\{\<\«]*اسم[\)\}\]\>\»]*/g, firstName);
        
        return new Promise((resolve) => {
          api.changeNickname(newNickname, threadID, id, (err) => {
            if (!err) successCount++;
            resolve();
          });
        });
      } catch (e) {
        return Promise.resolve();
      }
    };

    // معالجة المجموعات (سرعة أعلى)
    for (let i = 0; i < userIDs.length; i += 5) {
      const batch = userIDs.slice(i, i + 5);
      await Promise.all(batch.map(id => changeName(id)));
      
      // إرسال حالة العملية كل 50 عضو
      if ((i + 5) % 50 === 0 || (i + 5) >= userIDs.length) {
          const progress = Math.min(i + 5, userIDs.length);
          api.sendMessage(`🔄 حالة التحديث: تم معالجة ${progress}/${userIDs.length} عضو...`, threadID);
      }

      // فاصل زمني بسيط بين المجموعات لتفادي الحظر
      await new Promise(res => setTimeout(res, 2000));
    }

    // التفاعل عند الانتهاء
    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage(`✅ اكتملت المهمة بنجاح!\n🔹 تم تغيير: ${successCount} كنية.\n🔹 التنسيق: ${format}`, threadID, messageID);

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ خطأ في النظام: " + e.message, threadID, messageID);
  }
};
