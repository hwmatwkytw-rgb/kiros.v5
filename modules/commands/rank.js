const Canvas = require('canvas');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "رانك",
    version: "3.5.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "عرض بطاقة تفاعلك ومستواك المحلي أو العالمي بالجروب",
    commandCategory: "الخدمات",
    usages: "[-g / -l] [@منشن / بالرد]",
    cooldowns: 10
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    
    // جلب قائمة المشاركين في الشات بشكل آمن لتفادي أخطاء القراءة
    const threadInfo = await api.getThreadInfo(threadID);
    const participantIDs = threadInfo.participantIDs;

    let savePath = "";
    let avatarPath = "";

    try {
      // 1. معالجة خيار عرض قائمة المتصدرين الكاملة (all)
      if (args.some(e => e.toLowerCase() == '-a' || e.toLowerCase() == 'all')) {
        let _listOf = args.some(e => e.toLowerCase() == '-g' || e.toLowerCase() == 'global') ? 'global' : 'local';
        
        const allData = _listOf == 'global' ?
          Array.from(global.data.users.values()).map(e => ({ userID: e.userID, exp: e.data?.exp || 1 })) :
          (global.data.threads.get(String(threadID))?.info?.members) || [];

        if (allData.length == 0) return api.sendMessage("⚠ لا توجد بيانات تفاعل مسجلة حتى الآن.", threadID, messageID);

        const sortedData = allData
          .filter(e => participantIDs.includes(e.userID))
          .map(e => ({ userID: e.userID, exp: e.exp || (_listOf == 'global' ? 1 : 0) }))
          .sort((a, b) => a.exp == b.exp ? a.userID.localeCompare(b.userID) : b.exp - a.exp);

        const allData_withName = await Promise.all(sortedData.map(async e => {
          const name = (await global.controllers.Users.getInfo(e.userID))?.name || e.userID;
          return { ...e, name };
        }));

        const senderExp = allData_withName.find(e => e.userID == senderID)?.exp || 0;
        const senderRank = allData_withName.findIndex(e => e.userID == senderID) + 1;

        let leaderboardMessage = "";
        if (_listOf == 'global') {
          leaderboardMessage = `╭─  ───  ───  ───  ───  ─╮\n     𝖪 𝖳 𝖮 𝖯   𝖦 𝖫 𝖮 𝖡 𝖠 𝖫\n╰─  ───  ───  ───  ───  ─╯\n\n🏆 ∘ رانكك العالمي: #${senderRank} (${senderExp} exp)\n\n📊 ∘ أفضل 20 متفاعل عالمياً:\n`;
        } else {
          leaderboardMessage = `╭─  ───  ───  ───  ───  ─╮\n     𝖪 𝖳 𝖮 𝖯   𝖫 𝖮 𝖢 𝖠 𝖫\n╰─  ───  ───  ───  ───  ─╯\n\n🏆 ∘ رانكك في المجموعه: #${senderRank} (${senderExp} exp)\n\n📊 ∘ لوحة تفاعل الأعضاء:\n`;
        }

        const targetSlice = _listOf == 'global' ? allData_withName.slice(0, 20) : allData_withName;
        leaderboardMessage += targetSlice.map((e, i) => `【 ${i + 1} 】∘ ${e.name} - ${e.exp} exp`).join('\n');
        leaderboardMessage += `\n\n ⎔ الـنـظـام : ڪايروس`;

        return api.sendMessage(leaderboardMessage, threadID, messageID);
      }

      // 2. معالجة كرت الرانك الصوري الفردي (Canvas Card)
      api.setMessageReaction("⏳", messageID, () => {}, true);

      let targetID = type == 'message_reply' ? messageReply.senderID : Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
      let _listOf = args[0]?.toLowerCase();
      _listOf = (_listOf == '-g' || _listOf == 'global') ? 'global' : 'local';

      const allData = _listOf == 'global' ?
        Array.from(global.data.users.values()).map(e => ({ userID: e.userID, exp: e.data?.exp || 1 })) :
        (global.data.threads.get(String(threadID))?.info?.members) || [];

      if (allData.length == 0 || !allData.some(e => e.userID == targetID)) {
        return api.sendMessage("⚠ العضو المستهدف ليس لديه سجل تفاعل مسجل.", threadID, messageID);
      }

      const targetData = await global.controllers.Users.get(targetID);
      if (!targetData || !targetData.info || !targetData.info.thumbSrc) {
        return api.sendMessage("❌ فشل جلب بيانات العضو وصورته الشخصية.", threadID, messageID);
      }

      const sortedData = allData
        .filter(e => participantIDs.includes(e.userID))
        .map(e => ({ userID: e.userID, exp: e.exp || (_listOf == 'global' ? 1 : 0) }))
        .sort((a, b) => a.exp == b.exp ? a.userID.localeCompare(b.userID) : b.exp - a.exp);

      const rank = sortedData.findIndex(e => e.userID == targetID) + 1;
      const exp = sortedData[rank - 1].exp || 1;
      const level = global.expToLevel(exp);

      const currentExp = exp - global.levelToExp(level);
      const expToNextLevel = global.levelToExp(level + 1) - global.levelToExp(level);

      savePath = path.join(global.cachePath, `rank_${targetID}_${Date.now()}.png`);
      avatarPath = path.join(global.cachePath, `rank_avatar_${targetID}_${Date.now()}.jpg`);

      // تحميل الصورة الشخصية مؤقتاً ومعالجة البطاقة
      await global.downloadFile(avatarPath, targetData.info.thumbSrc);
      let result = await this.makeCard({ savePath, avatarPath, name: targetData.info.name, rank, exp: currentExp, level, expToNextLevel });

      if (!result) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("❌ حدث خطأ أثناء تصميم كرت الرانك صوريًا.", threadID, messageID);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: `📊 ∘ كرت مستوى المتفاعل: 【 ${targetData.info.name} 】\n ⎔ الـنـظـام : ڪايروس`,
        attachment: fs.createReadStream(savePath)
      }, threadID, () => {
        this.cleanup(savePath, avatarPath);
      }, messageID);

    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
      this.cleanup(savePath, avatarPath);
      return api.sendMessage("❌ خطأ داخلي في استخراج وتصميم الرانك.", threadID, messageID);
    }
  },

  // ميثود رسم وتكوين بطاقة الرانك الاحترافية
  makeCard: async function (data) {
    const { savePath, avatarPath, name, rank, exp, level, expToNextLevel } = data;
    try {
      const template = await Canvas.loadImage(path.join(global.assetsPath, 'rank_card.png'));
      const avatar = await Canvas.loadImage(avatarPath);
      const circledAvatar = global.circle(avatar, avatar.width / 2, avatar.height / 2, avatar.width / 2);

      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(template, 0, 0);
      ctx.drawImage(circledAvatar, 15, 21, 101, 101);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, 136, 43);

      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Rank ${rank}`, 136, 66);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Lv.${level}`, 136, 87);

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${exp}/${expToNextLevel}`, 270, 87);

      let percent = (exp / expToNextLevel) * 100;
      percent = percent > 0 ? percent % 5 === 0 ? percent : Math.round(percent / 5) * 5 : 0;

      this.progressBar(ctx, 134, 98, 230, 7, percent);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(savePath, buffer);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // محرك رسم شريط التقدم التفاعلي (Progress Bar)
  progressBar: function (ctx, x, y, width, radius, progress) {
    ctx.fillStyle = '#d2d2d2';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y + radius * 2, x + width - radius, y + radius * 2);
    ctx.lineTo(x + radius, y + radius * 2);
    ctx.quadraticCurveTo(x, y + radius * 2, x, y + radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    if (progress === 0) return;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + (width * progress / 100) - radius, y);
    ctx.quadraticCurveTo(x + (width * progress / 100), y, x + (width * progress / 100), y + radius);
    ctx.lineTo(x + (width * progress / 100), y + radius);
    ctx.quadraticCurveTo(x + (width * progress / 100), y + radius * 2, x + (width * progress / 100) - radius, y + radius * 2);
    ctx.lineTo(x + radius, y + radius * 2);
    ctx.quadraticCurveTo(x, y + radius * 2, x, y + radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  // تصفير وتنظيف مسارات الكاش فوراً لحفظ مساحة التخزين في السيرفر
  cleanup: function (savePath, avatarPath) {
    try {
      if (savePath && fs.existsSync(savePath)) fs.unlinkSync(savePath);
      if (avatarPath && fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    } catch (e) {
      console.error(e);
    }
  }
};
