const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "autoLeave",
  eventType: ["log:subscribe"],
  version: "1.2.0",
  credits: "Dante Sparda",
  description: "المغادرة التلقائية عند إضافة شخص غير المطور للبوت"
};

module.exports.run = async function({ api, event }) {
  const developerID = "61570782968645";
  const { threadID, author, logMessageData } = event;
  const imageUrl = "https://i.imgur.com/DZlXRB2.jpeg";

  // التحقق مما إذا كان البوت هو العضو الجديد المنضم
  if (logMessageData.addedParticipants.some(p => p.userFbId == api.getCurrentUserID())) {
    
    // إذا كان الذي أضاف البوت هو المطور، لا يفعل شيئاً (يسمح بالبقاء)
    if (author === developerID) {
      return; 
    }

    // إذا كان المضيف شخصاً آخر: إرسال الرسالة والصورة ثم المغادرة
    try {
      // تحميل الصورة مؤقتاً لإرسالها
      const imagePath = path.join(__dirname, "cache", `leave_${threadID}.jpg`);
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.outputFileSync(imagePath, Buffer.from(response.data, "utf-8"));

      const msg = {
        body: "انكمكم جت",
        attachment: fs.createReadStream(imagePath)
      };

      // إرسال الرسالة ثم تنفيذ المغادرة
      api.sendMessage(msg, threadID, () => {
        // حذف الصورة بعد الإرسال للحفاظ على المساحة
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        
        // مغادرة المجموعة
        api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      });

    } catch (err) {
      console.error("Error in autoLeave logic:", err);
      // في حال فشل تحميل الصورة، يغادر على أي حال
      api.sendMessage("انكمكم جت", threadID, () => {
        api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      });
    }
  }
};
