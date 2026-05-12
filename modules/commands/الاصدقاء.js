const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "الاصدقاء",
  version: "5.0.0",
  credits: "Victor",
  hasPermssion: 2,
  description: "إدارة طلبات الصداقة للبوت بأسلوب هندسي",
  commandCategory: "المطور",
  usages: "[احصائيات/فحص]",
  cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const developerID = "61573334176409";
  if (String(event.senderID) !== developerID) return;

  const { body, threadID, messageID } = event;
  const listRequest = handleReply.listRequest;
  const args = body.split(/\s+/);
  const action = args[0].toLowerCase();

  // نظام القبول أو الرفض
  if (action === "قبول" || action === "رفض") {
    const indices = args.slice(1);
    if (indices[0] === "الكل") {
      for (let i = 0; i < listRequest.length; i++) {
        const user = listRequest[i];
        if (action === "قبول") await api.handleFriendRequest(user.userID, true);
        else await api.handleFriendRequest(user.userID, false);
      }
      return api.sendMessage(`⎔ تـم ${action === "قبول" ? "قـبول" : "رفـض"} جـميع الـطلبات بـنجاح.`, threadID, messageID);
    }

    for (const i of indices) {
      const user = listRequest[i - 1];
      if (user) {
        if (action === "قبول") await api.handleFriendRequest(user.userID, true);
        else await api.handleFriendRequest(user.userID, false);
      }
    }
    return api.sendMessage(`⊞ تـم تـنفيذ الـعملية لـلأرقام الـمختارة.`, threadID, messageID);
  }
};

module.exports.run = async function({ api, event, args }) {
  const developerID = "61573334176409";
  if (event.senderID !== developerID) return api.sendMessage("⎔ هـذا الأمر مخصص لـ Victor فـقط.", event.threadID);

  try {
    const listRequest = await api.getFriendRequests();
    
    if (args[0] === "احصائيات") {
      return api.sendMessage(`╭─── • ◈ • ───╮\n  📊 الـإحـصائـيات\n╰─── • ◈ • ───╯\n⏀ الـطـلـبات: ${listRequest.length}\n━━━━━━━━━━━━━`, event.threadID);
    }

    if (listRequest.length === 0) return api.sendMessage("📭 لا يـوجـد طـلبات صداقة حالياً.", event.threadID);

    let msg = `╭─── • ⎔ • ───╮\n  طـلـبات الـصـداقـة\n╰─── • ⎔ • ───╯\n`;
    listRequest.forEach((user, i) => {
      msg += `⊞ [${i + 1}] 👤 ${user.name}\n🆔 ${user.userID}\n─── ─── ───\n`;
    });
    
    msg += `━━━━━━━━━━━━━\n💡 قـبول + رقـم (أو الـكل)\n💡 رفـض + رقـم (أو الـكل)\n━━━━━━━━━━━━━\n© ᏙᏆᏟᎢᎾᎡ ᏚYᏚᎢᎬᎷ`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        listRequest: listRequest
      });
    }, event.messageID);

  } catch (e) {
    return api.sendMessage("❌ فـشل فـي جـلب طـلبات الـصداقة.", event.threadID);
  }
};
