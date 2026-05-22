const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "قران",
    version: "4.0.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "الاستماع إلى الـ 114 سورة كاملة لأشهر القراء كريكورد مباشر",
    commandCategory: "الدينية",
    usages: "[اسم القارئ] أو تصفح القائمة",
    cooldowns: 3
  },

  // ربط السيرفرات المباشرة لـ Mp3Quran لكل قارئ (المجلدات الرسمية لـ 114 سورة)
  reciters: {
    "ناصر القطامي": "https://server6.mp3quran.net/qtm/",
    "عبد الرحمن مسعد": "https://server16.mp3quran.net/a_musad/",
    "ماهر المعيقلي": "https://server12.mp3quran.net/maher/",
    "علي جابر": "https://server11.mp3quran.net/a_jabr/",
    "إسلام صبحي": "https://server14.mp3quran.net/islam/"
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const input = body.trim();

    // المرحلة الثانية: اختيار السورة بعد اختيار القارئ
    if (handleReply.type === "choose_surah") {
      const surahNum = parseInt(input);
      if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
        return api.sendMessage("⚠️ يرجى إدخال رقم سورة صحيح بين 1 و 114.", threadID, messageID);
      }

      api.unsendMessage(handleReply.messageID); // حذف القائمة لتنظيف الشات
      
      // تحويل رقم السورة إلى صيغة 3 خانات (مثلاً: 1 يرجع 001)
      const formattedSurah = String(surahNum).padStart(3, '0');
      const audioUrl = `${handleReply.serverUrl}${formattedSurah}.mp3`;

      return module.exports.sendAudio({ 
        api, 
        threadID, 
        messageID, 
        url: audioUrl, 
        surahNum, 
        reciter: handleReply.reciterName 
      });
    }

    // المرحلة الأولى: اختيار القارئ من القائمة
    if (handleReply.type === "choose_reciter") {
      const choice = parseInt(input);
      const keys = Object.keys(this.reciters);
      
      if (isNaN(choice) || choice < 1 || choice > keys.length) return;

      api.unsendMessage(handleReply.messageID);
      const selectedReciter = keys[choice - 1];
      const serverUrl = this.reciters[selectedReciter];

      let msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎙️ ∘ القارئ: الشيخ 【 ${selectedReciter} 】\n\n` +
        `📖 ∘ أرسل رقم السورة المراد تشغيلها كريكورد مباشرة (من 1 إلى 114):\n` +
        `💡 أمثلة: (1: الفاتحة | 2: البقرة | 18: الكهف | 114: الناس)\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "choose_surah",
          serverUrl: serverUrl,
          reciterName: selectedReciter
        });
      }, messageID);
    }
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    api.setMessageReaction("🕌", messageID, () => {}, true);

    const keys = Object.keys(this.reciters);
    let msg = 
      `╭─  ───  ───  ───  ───  ─╮\n` +
      `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
      `╰─  ───  ───  ───  ───  ─╯\n\n` +
      `🎙️ ∘ اختر الشيخ والقارئ المطلوب بالرد على الرسالة:\n\n`;

    keys.forEach((r, i) => msg += `【 ${i + 1} 】∘ الشيخ ${r}\n`);
    msg += `\n ⎔ الـنـظـام : ڪايروس`;

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "choose_reciter"
      });
    }, messageID);
  },

  sendAudio: async function ({ api, threadID, messageID, url, surahNum, reciter }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const audioPath = path.join(__dirname, "..", "..", "cache", `quran_${Date.now()}.mp3`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(response.data, "utf-8"));

      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `📖 ∘ تـم الـتـحـمـيـل : السورة رقم [ ${surahNum} ]\n` +
        `🎙️ ∘ الـقـارئ : الشيخ ${reciter}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("🕌", messageID, () => {}, true);
      return api.sendMessage({
        body: deliveryMessage,
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }, messageID);

    } catch (error) {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ تعذر تحميل هذه السورة، قد يكون الشيخ لم يسجلها بالكامل في هذا السيرفر.", threadID, messageID);
    }
  }
};
