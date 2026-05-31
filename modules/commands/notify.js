const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "اشعار",
  version: "2.1.0",
  hasPermssion: 2,
  credits: "DANTE",
  description: "إرسال إشعار وسائط أو نص لجميع المجموعات باستايل هادئ وخفيف",
  commandCategory: "المطور",
  usages: "[الرسالة] أو بالرد على وسائط",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Threads }) {
  const { threadID, messageID, senderID, messageReply } = event;
  const devID = "61570782968645";

  // التحقق من هوية المطور كايࢪوس
  if (senderID !== devID) return api.sendMessage("✨ هذا الأمر مخصص للمطور فقط.", threadID, messageID);

  const content = args.join(" ");
  if (!content && !messageReply) return api.sendMessage("❌ يرجى كتابة رسالة أو الرد على وسائط (صورة/فيديو).", threadID, messageID);

  // جلب قائمة المجموعات التي يتواجد بها البوت
  const allThreads = await api.getThreadList(100, null, ["INBOX"]);
  const threads = allThreads.filter(t => t.isGroup && t.threadID !== threadID);

  let attachment = [];
  // معالجة الوسائط في حال الرد (Reply) على صورة أو فيديو
  if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
    for (let file of messageReply.attachments) {
      const path = __dirname + `/cache/${Date.now()}_${file.filename}`;
      const getFile = (await axios.get(file.url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(getFile, "utf-8"));
      attachment.push(fs.createReadStream(path));
    }
  }

  let success = 0;
  let failed = 0;

  // حلقة لإرسال الإشعار لكل مجموعة
  for (const thread of threads) {
    try {
      await api.sendMessage({
        body: 
`╮───────⎯  ◇  ⎯───────╭
       إشــــعــار الــمــطــور
╯───────⎯  ◇  ⎯───────╰

╮────⎯  「 الـرسـالـة 」
│ ${content || "إشعار وسائط مصور"}
╯───────⎯  ◇  ⎯───────◈

╮────⎯  「 الــمـطـور 」
│ › المطور : @DANTE
╯───────⎯  ◇  ⎯───────◈`,
        mentions: [{ tag: "@DANTE", id: devID }],
        attachment: attachment
      }, thread.threadID);
      success++;
    } catch (e) {
      failed++;
    }
  }

  // تنظيف ملفات الكاش بعد الإرسال
  attachment.forEach(file => {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  });

  return api.sendMessage(`✅ تم نشر الإشعار بنجاح:\n🟢 مجموعات: ${success}\n🔴 فشل: ${failed}`, threadID, messageID);
};
