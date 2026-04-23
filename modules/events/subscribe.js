const fs = require("fs-extra");
const path = require("path");
const blacklistPath = path.join(__dirname, "..", "commands", "cache", "blacklist.json");

module.exports.config = {
  name: "subscribeNotification",
  eventType: ["log:subscribe"],
  version: "1.1.1",
  credits: "ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ",
  description: "تنبيه المطور عند إضافة البوت - وضع الصمت التام للمطور"
};

module.exports.run = async function({ api, event, Threads }) {
  const developerID = "61573334176409";
  const { threadID, author, logMessageData } = event;
  
  // التحقق مما إذا كان البوت هو المنضم
  if (logMessageData.addedParticipants.some(p => p.userFbId == api.getCurrentUserID())) {
    
    // 1. إذا كان المضيف هو المطور (وضع الصمت التام 🔕)
    if (author === developerID) {
      // لا رسائل، لا تغيير لقب، لا شيء.
      return; 
    }

    // 2. التحقق من القائمة السوداء (Blacklist) للمستخدمين الآخرين
    let blacklist = fs.existsSync(blacklistPath) ? fs.readJsonSync(blacklistPath) : [];
    if (blacklist.includes(threadID)) {
      api.sendMessage("🚫 نـعتذر، هـذه الـمجموعة مـحـظـورة بـأمر مـن المطور ᎠᎯᏁᎢᎬ ᏚᎮᎯᏒᎠᎯ.", threadID);
      return api.removeUserFromGroup(api.getCurrentUserID(), threadID);
    }

    // 3. إذا كان المضيف شخصاً آخر (نظام الطلبات المعتاد)
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "لا يوجد اسم";
      const memberCount = threadInfo.participantIDs.length;

      // رسالة للمجموعة
      const groupMsg = `📥 【 طـلب تـفعيل جـديـد 】\n━━━━━━━━━━━━━\n❏ الـحـالة: قـيـد الـتـدقيق ⏳\n❏ الـمـعرف: #${threadID.substring(0, 8)}\n❏ الـمطور: ڪولو سـان\n━━━━━━━━━━━━━\n⚠️ سـيتم مـراجـعة الـمجموعة مـن قـبل الـمطور. فـي حـال الـموافـقة سـيتم تـشغيل الأوامـر تـلـقائـيـاً.`;
      api.sendMessage(groupMsg, threadID);

      // إشعار تفصيلي للمطور (عبر الخاص)
      const devMsg = `🚩 🔔 【 إشـعـار انـضـمـام جـديـد 】\n━━━━━━━━━━━━━\n👤 الـمضيف: ${author}\n👥 الـمجموعة: ${threadName}\n🆔 ID: ${threadID}\n👨‍👩‍👧‍👦 الأعـضاء: ${memberCount}\n🔗 الـرابط: facebook.com/${threadID}\n━━━━━━━━━━━━━\n• لـلموافقة: .تفعيل ${threadID}\n• لـلرفض: .طرد ${threadID}`;
      api.sendMessage(devMsg, developerID);

    } catch (err) {
      console.error("Error in subscribeNotification:", err);
    }
  }
};
