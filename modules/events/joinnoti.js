const Canvas = require('canvas');
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinNoti",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "2.0.0",
  credits: "DANTE SPARDA",
  description: "ترحيب بصري فخم + نظام حماية كايروس",
  dependencies: {
    "canvas": "",
    "fs-extra": "",
    "axios": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, author, logMessageType, logMessageData } = event;
  const developerID = "61581906898524"; 

  // --- 1. انضمام البوت أو الأعضاء ---
  if (logMessageType === "log:subscribe") {
    
    // أ. انضمام البوت للمجموعة
    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      if (author !== developerID) return;
      
      const botName = global.config.BOTNAME || "KYROS BOT";
      const totalCommands = global.client.commands.size;
      const prefix = global.config.PREFIX;
      
      api.changeNickname(`[ ${prefix} ] • ${botName}`, threadID, api.getCurrentUserID());
      
      const botMsg = `╭─────── 𖦆 ───────╮\n    𝐒𝐘𝐒𝐓𝐄𝐌  𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃\n╰─────── 𖦆 ───────╯\n\n╭── ▽ 「 مـعلومات الـنـظام 」\n┃ ⚬ الـاسـم ➔ ${botName}\n┃ ⚬ الـإصـدار ➔ 3.7.0\n┃ ⚬ الـأوامـر ➔ ${totalCommands}\n┃ ⚬ الـبـادئـة ➔ [ ${prefix} ]\n╰────────────── 🝓\n\n╭─── 𖦆 𝐍𝐎𝐓𝐄 𖦆 ───╮\n┃ " اللهم صلِ وسلم على نبينا محمد "\n╰───────────────────╯`;
      
      return api.sendMessage(botMsg, threadID);
    }

    // ب. ترحيب الأعضاء (بصري + نصي)
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participant = logMessageData.addedParticipants[0]; // نأخذ أول عضو مضاف
      const userID = participant.userFbId;
      const userName = participant.fullName;
      
      const time = moment.tz("Africa/Khartoum").format("hh:mm A • DD/MM/YYYY");
      const cachePath = path.join(__dirname, 'cache', `welcome_${userID}.png`);
      const templatePath = path.join(__dirname, 'cache', 'welcome_template.png');

      // جلب رابط الصورة الشخصية
      const avatarUrl = `https://graph.facebook.com/${userID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // تحميل القالب إذا لم يكن موجوداً (رابط خلفية سيبرانية فخمة)
      if (!fs.existsSync(templatePath)) {
        const res = await axios.get("https://i.postimg.cc/mD8v6G4h/welcome-bg.png", { responseType: 'arraybuffer' });
        fs.writeFileSync(templatePath, Buffer.from(res.data));
      }

      const [avatarImg, templateImg] = await Promise.all([
        Canvas.loadImage(avatarUrl),
        Canvas.loadImage(templatePath)
      ]);

      const canvas = Canvas.createCanvas(templateImg.width, templateImg.height);
      const ctx = canvas.getContext('2d');

      // رسم الخلفية
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

      // رسم الصورة الشخصية دائرية (نمط كايروس)
      const size = 350;
      const x = (canvas.width / 2) - (size / 2);
      const y = 120;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, x, y, size, size);
      ctx.restore();

      // إطار نيون دائري
      ctx.strokeStyle = '#b3ffff';
      ctx.lineWidth = 12;
      ctx.stroke();

      const buffer = canvas.toBuffer();
      fs.writeFileSync(cachePath, buffer);

      const msg = {
        body: `╭─────── 𖦆 ───────╮\n    𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐊𝐀𝐈𝐑𝐔𝐒\n╰─────── 𖦆 ───────╯\n\n╭── ▽ 「 تـفاصـيل الـدخول 」\n┃ ⚬ الـعـضـو ➔ ${userName}\n┃ ⚬ الـقـروب ➔ ${threadInfo.threadName}\n┃ ⚬ الـعـدد ➔ ${threadInfo.participantIDs.length}\n┃ ⚬ الـتـوقـيت ➔ ${time}\n╰────────────── 🝓\n\n╭─── 𖦆 𝐍𝐎𝐓𝐄 𖦆 ───╮\n┃ " كُن عابراً لطيفاً.. تترك أثراً جميلاً "\n╰───────────────────╯`,
        mentions: [{ tag: userName, id: userID }],
        attachment: fs.createReadStream(cachePath)
      };

      return api.sendMessage(msg, threadID, () => {
        if(fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      });

    } catch (e) { console.log(e) }
  }

  // --- 2. نظام الحماية (كما هو) ---
  if (logMessageType === "log:unsubscribe") {
    const leftID = logMessageData.leftParticipantFbId;
    if (leftID == api.getCurrentUserID()) return;

    if (author != leftID) {
        return api.sendMessage("العب بلع بانكاي في جلحاتو 🐸", threadID);
    }

    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage("احشك واحش البضيفك زاتو 🦧📿", threadID);
      } else {
        return api.sendMessage("لديك كرامة جميلة 🐸✨", threadID);
      }
    });
  }
};
