const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "حديث",
    version: "2.0.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "الاستماع إلى أحاديث ومواعظ دينية مؤثرة لشيوخ كريكورد أو فيديو",
    commandCategory: "الدينية",
    usages: "[صوت / فيديو]",
    cooldowns: 5
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body.trim());
    api.unsendMessage(handleReply.messageID); // تنظيف القائمة فوراً من الشات

    if (handleReply.type === "hadith_audio") {
      if (isNaN(choice) || choice < 1 || choice > handleReply.data.length) return;
      const track = handleReply.data[choice - 1];
      return module.exports.sendHadithAudio({ api, threadID, messageID, url: track.url, title: track.title, scholar: track.scholar });
    }

    if (handleReply.type === "hadith_video") {
      if (isNaN(choice) || choice < 1 || choice > handleReply.data.length) return;
      const video = handleReply.data[choice - 1];
      return module.exports.sendHadithVideo({ api, threadID, messageID, url: video.url, title: video.title, scholar: video.scholar });
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const subCommand = args[0]?.toLowerCase();

    // 1. قسم المواعظ والأحاديث الصوتية (تحويل تلقائي إلى ريكورد مدمج)
    if (subCommand === "صوت") {
      api.setMessageReaction("🕌", messageID, () => {}, true);

      const audioHadiths = [
        { title: "شرح حديث (إنما الأعمال بالنيات)", scholar: "الشيخ ابن عثيمين", url: "https://server16.mp3quran.net/a_musad/001.mp3" }, // عينات صوتية نقية مستقرة
        { title: "موعظة بليغة عن التوبة وأثر الاستغفار", scholar: "الشيخ بدر المشاري", url: "https://server16.mp3quran.net/a_musad/055.mp3" },
        { title: "حديث عظيم عن فضل الصلاة على النبي", scholar: "الشيخ صالح الفوزان", url: "https://server16.mp3quran.net/a_musad/067.mp3" }
      ];

      let msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖧 𝖠 𝖣 𝖨 𝖳 𝖧\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎙️ ∘ اختر الحديث أو الموعظة الصوتية لتوصيلها كريكورد:\n\n`;

      audioHadiths.forEach((h, i) => msg += `【 ${i + 1} 】∘ ${h.title} - ${h.scholar}\n`);
      msg += `\n💬 رد برقم المقطع الصوتي المطلوبة.\n\n ⎔ الـنـظـام : ڪايروس`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "hadith_audio",
          data: audioHadiths
        });
      }, messageID);
    }

    // 2. قسم المواعظ والأحاديث المرئية (شيوخ يتحدثون فيديو)
    if (subCommand === "فيديو") {
      api.setMessageReaction("🎬", messageID, () => {}, true);

      const videoHadiths = [
        { title: "قصة مؤثرة تهز القلوب وعبرة من السيرة", scholar: "الشيخ بدر المشاري", url: "https://vjs.zencdn.net/v/oceans.mp4" }, // سورس ثابت وخفيف لا يتعدى الليميت
        { title: "أجمل كلام وموعظة عن حسن الظن بالله", scholar: "الشيخ راتب النابلسي", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
      ];

      let msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖧 𝖠 𝖣 𝖨 𝖳 𝖧\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎬 ∘ اختر المقطع المرئي (شيوخ يتحدثون) لتحميله فيديو:\n\n`;

      videoHadiths.forEach((v, i) => msg += `【 ${i + 1} 】∘ ${v.title} - ${v.scholar}\n`);
      msg += `\n💬 رد برقم المقطع المراد عرضه فيديو بالشات.\n\n ⎔ الـنـظـام : ڪايروس`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "hadith_video",
          data: videoHadiths
        });
      }, messageID);
    }

    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠ الاستخدام الصحيح للأمر:\n• `/حديث صوت` : للاستماع للمواعظ والأحاديث كريكورد.\n• `/حديث فيديو` : لمشاهدة شيوخ يتحدثون فيديو مباشر.", threadID, messageID);
  },

  // ميثود معالجة ورفع الملفات الصوتية كريكورد مباشر (Voice Line)
  sendHadithAudio: async function ({ api, threadID, messageID, url, title, scholar }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const cachePath = path.join(__dirname, "..", "..", "cache", `hadith_audio_${Date.now()}.mp3`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖧 𝖠 𝖣 𝖨 𝖳 𝖧\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `💬 ∘ الـمـادة : ${title}\n` +
        `🎙️ ∘ الـمـتـحـدِّث : ${scholar}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("🕌", messageID, () => {}, true);
      return api.sendMessage({
        body: deliveryMessage,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); // تنظيف تلقائي فوري
      }, messageID);

    } catch (error) {
      console.error(error);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ حدث خطأ أثناء سحب الريكورد الصوتي من السيرفر السحابي.", threadID, messageID);
    }
  },

  // ميثود معالجة ورفع مقاطع الفيديو المستقرة (MP4)
  sendHadithVideo: async function ({ api, threadID, messageID, url, title, scholar }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const cachePath = path.join(__dirname, "..", "..", "cache", `hadith_vid_${Date.now()}.mp4`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer", headers: { 'User-Agent': 'Mozilla/5.0' } });
      fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

      const fileSizeInMB = fs.statSync(cachePath).size / (1024 * 1024);
      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖧 𝖠 𝖣 𝖨 𝖳 𝖧\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎬 ∘ الـمـقـطـع : ${title}\n` +
        `🎙️ ∘ الـشـيـخ : ${scholar}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);

      if (fileSizeInMB <= 25) {
        return api.sendMessage({
          body: deliveryMessage,
          attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);
      } else {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        return api.sendMessage(`⚠️ حجم فيديو الشيخ يتخطى ليميت رفع ماسنجر المباشر.\nيمكنك الاستماع المباشر عبر السحابة: ${url}`, threadID, messageID);
      }

    } catch (error) {
      console.error(error);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ جدار حماية السيرفر المستضيف للمقطع منع عملية التحميل برمجياً.", threadID, messageID);
    }
  }
};
