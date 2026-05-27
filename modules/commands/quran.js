const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "قران",
    version: "5.5.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "جلب تلاوات ولقطات خاشعة عشوائية عبر API خارجي خفيف ومستقر بركورد مباشر",
    commandCategory: "الدينية",
    usages: "[رد باختيار الشيخ]",
    cooldowns: 3
  },

  // معرفات القراء الحقيقية على سيرفرات الـ API الشهيرة
  recitersAPI: {
    "ناصر القطامي": "https://اللهم-صل-على-محمد.com/api/quran/reciter/qtm", // مثال لربط الروابط المباشرة السريعة
    "عبد الرحمن مسعد": "https://server16.mp3quran.net/a_musad/",
    "ماهر المعيقلي": "https://server12.mp3quran.net/maher/",
    "علي جابر": "https://server11.mp3quran.net/a_jabr/",
    "إسلام صبحي": "https://server14.mp3quran.net/islam/"
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    if (handleReply.type === "choose_reciter") {
      const choice = parseInt(body.trim());
      const keys = Object.keys(this.recitersAPI);
      
      if (isNaN(choice) || choice < 1 || choice > keys.length) return;

      api.unsendMessage(handleReply.messageID); // تنظيف الشات
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const selectedReciter = keys[choice - 1];
      const baseUrl = this.recitersAPI[selectedReciter];
      
      // توليد رقم سورة عشوائي قصير بين (78 إلى 114) لضمان أن المقاطع قصيرة وخفيفة جداً على السيرفر
      const shortSurahs = [1, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];
      const randomSurah = shortSurahs[Math.floor(Math.random() * shortSurahs.length)];
      const formattedSurah = String(randomSurah).padStart(3, '0');
      
      // دمج الرابط المباشر للـ API السريع
      const finalAudioUrl = `${baseUrl}${formattedSurah}.mp3`;
      const audioPath = path.join(__dirname, "..", "..", "cache", `quran_api_${Date.now()}.mp3`);

      try {
        const response = await axios.get(finalAudioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, Buffer.from(response.data, "utf-8"));

        const deliveryMessage = 
          `╭─  ───  ───  ───  ───  ─╮\n` +
          `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
          `╰─  ───  ───  ───  ───  ─╯\n\n` +
          `🎙️ ∘ الـقـارئ : الشيخ ${selectedReciter}\n` +
          `📖 ∘ الـتـلاوة : مقطع قصير مستدعى تلقائياً عشوائي\n\n` +
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
        return api.sendMessage("❌ تعذر الاتصال بالخادم، يرجى إعادة المحاولة لاحقاً.", threadID, messageID);
      }
    }
  },

  run: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    api.setMessageReaction("🕌", messageID, () => {}, true);

    const keys = Object.keys(this.recitersAPI);
    let msg = 
      `╭─  ───  ───  ───  ───  ─╮\n` +
      `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
      `╰─  ───  ───  ───  ───  ─╯\n\n` +
      `🎙️ ∘ اختر الشيخ المطلوب بالرد على الرسالة برقم القارئ:\n` +
      `💡 (سيقوم النظام بسحب آية أو تلاوة قصيرة تلقائياً)\n\n`;

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
  }
};
