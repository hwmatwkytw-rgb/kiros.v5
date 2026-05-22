const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "قران",
    version: "2.6.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "الاستماع إلى القرآن الكريم كريكورد ومقاطع مرئية بستايل كايروس مع المواعظ والعبر",
    commandCategory: "الدينية",
    usages: "[صوت / فيديو]",
    cooldowns: 5
  },

  // مصفوفة العبر والمواعظ لتغذية رسائل التسليم برمجياً
  quotes: [
    "📌 إنَّ الدُّنْيَا رِحْلَةٌ قَصِيرَةٌ، فَاجْعَلْهَا فِي طَاعَةِ اللَّهِ تُصْبِحْ جَنَّةً دَائِمَةً.",
    "📌 لَا تَقْلَقْ مِنْ ضِيقِ الرِّزْقِ، فَإِنَّ اللَّهَ هُوَ الرَّزَّاقُ ذُو الْقُوَّةِ الْمَتِينُ.",
    "📌 الْقُرْآنُ هُوَ الصَّاحِبُ الَّذِي لَا يَخْذُلُكَ أَبَدًا، كُلَّمَا ابْتَعَدْتَ عَنْهُ ضَاقَتْ عَلَيْكَ الدُّنْيَا.",
    "📌 إِذَا أَحَبَّ اللَّهُ عَبْدًا ابْتَلَاهُ، فَاصْبِرْ لِتَنَالَ أَجْرَ الصَّابِرِينَ بِغَيْرِ حِسَابٍ.",
    "📌 الدُّعَاءُ سِهَامٌ لَا تُخْطِئُ أَبَدًا، وَلَكِنَّهَا تَحْتَاجُ إِلَى وَقْتٍ لِتُصِيبَ الْهَدَفَ فَأَبْشِرْ.",
    "📌 مَا مَضَى قَدْ فَاتَ، وَمَا سَيَأْتِي قَدْ كُتِبَ، فَقُلْ 'الْحَمْدُ لِلَّهِ' وَتَوَكَّلْ عَلَى الْعَزِيزِ الرَّحِيمِ.",
    "📌 اجْعَلْ حَيَاتَكَ مَلِيئَةً بِالِاسْتِغْفَارِ، فَإِنَّهُ يَفْتَحُ الْأَبْوَابَ الْمُغْلَقَةَ وَيَزِيدُ الرِّزْقَ."
  ],

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body.trim());
    api.unsendMessage(handleReply.messageID); // تنظيف القائمة فوراً

    if (handleReply.type === "audio_surah") {
      if (isNaN(choice) || choice < 1 || choice > handleReply.data.length) {
        return api.sendMessage("⚠ خيار غير صحيح. يرجى اختيار رقم السورة من القائمة.", threadID, messageID);
      }
      const surah = handleReply.data[choice - 1];
      return module.exports.sendAudio({ api, threadID, messageID, url: surah.url, name: surah.name });
    }

    if (handleReply.type === "video_clip") {
      if (isNaN(choice) || choice < 1 || choice > handleReply.data.length) {
        return api.sendMessage("⚠ خيار غير صحيح. يرجى اختيار رقم المقطع الصحيح.", threadID, messageID);
      }
      const video = handleReply.data[choice - 1];
      return module.exports.sendVideo({ api, threadID, messageID, url: video.url, title: video.title });
    }
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const subCommand = args[0]?.toLowerCase();

    if (subCommand === "صوت") {
      api.setMessageReaction("🕌", messageID, () => {}, true);
      
      const surahs = [
        { name: "الفاتحة", url: "https://server8.mp3quran.net/afs/001.mp3" },
        { name: "البقرة (كاملة)", url: "https://server8.mp3quran.net/afs/002.mp3" },
        { name: "الكهف", url: "https://server8.mp3quran.net/afs/018.mp3" },
        { name: "يس", url: "https://server8.mp3quran.net/afs/036.mp3" },
        { name: "الملك", url: "https://server8.mp3quran.net/afs/067.mp3" },
        { name: "الرحمن", url: "https://server8.mp3quran.net/afs/055.mp3" }
      ];

      let msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🕋 ∘ اختر السورة المراد الاستماع إليها كريكورد:\n\n`;
      
      surahs.forEach((s, i) => msg += `【 ${i + 1} 】∘ سورة ${s.name}\n`);
      msg += `\n💬 رد برقم السورة المطلوبة لتشغيلها.\n\n ⎔ الـنـظـام : ڪايروس`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "audio_surah",
          data: surahs
        });
      }, messageID);
    }

    if (subCommand === "فيديو") {
      api.setMessageReaction("🎬", messageID, () => {}, true);

      const backupVideos = [
        { title: "راحة نفسية - سورة الإسراء خاشعة", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
        { title: "منصور السالمي - موعظة مؤثرة تهز القلوب", url: "https://v.redd.it/v9hszm9p6b0c1/DASH_720.mp4" }
      ];

      let msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖵 𝖨 𝖣 𝖤 𝖮\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎬 ∘ اختر المقطع المرئي المراد تحميله وعرضه:\n\n`;
      
      backupVideos.forEach((v, i) => msg += `【 ${i + 1} 】∘ ${v.title}\n`);
      msg += `\n💬 رد برقم المقطع المراد تحميله كفيديو.\n\n ⎔ الـنـظـام : ڪايروس`;

      return api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "video_clip",
          data: backupVideos
        });
      }, messageID);
    }

    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⚠ الاستخدام الصحيح للأمر:\n• `/قران صوت` : للاستماع للسور كريكورد.\n• `/قران فيديو` : لمشاهدة مقاطع فيديو دينية.", threadID, messageID);
  },

  // منظومة الإرسال المحدثة بالستايل النظيف والوعظ التلقائي للريكوردات
  sendAudio: async function ({ api, threadID, messageID, url, name }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const audioPath = path.join(__dirname, "..", "..", "cache", `quran_${Date.now()}.mp3`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(response.data, "utf-8"));

      // اختيار حكمة دينية عشوائية من المصفوفة
      const randomQuote = module.exports.quotes[Math.floor(Math.random() * module.exports.quotes.length)];

      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `📖 ∘ تـم مـعـالـجـة : سورة ${name}\n\n` +
        `💡 ∘ عِـبْـرَةٌ وَمَوْعِظَةٌ :\n${randomQuote}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("🕌", messageID, () => {}, true);
      return api.sendMessage({
        body: deliveryMessage,
        attachment: fs.createReadStream(audioPath)
      }, threadID, () => {
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }, messageID);

    } catch (error) {
      console.error(error);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ تعذر سحب الملف الصوتي من السيرفر، حاول لاحقاً.", threadID, messageID);
    }
  },

  // منظومة الإرسال المحدثة بالستايل النظيف والوعظ التلقائي للفيديوهات
  sendVideo: async function ({ api, threadID, messageID, url, title }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const videoPath = path.join(__dirname, "..", "..", "cache", `quran_vid_${Date.now()}.mp4`);

    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(videoPath, Buffer.from(response.data, "utf-8"));

      // اختيار حكمة دينية عشوائية من المصفوفة
      const randomQuote = module.exports.quotes[Math.floor(Math.random() * module.exports.quotes.length)];

      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖵 𝖨 𝖣 𝖤 𝖮\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎬 ∘ تـم مـعـالـجـة : ${title}\n\n` +
        `💡 ∘ عِـبْـرَةٌ وَمَوْعِظَةٌ :\n${randomQuote}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: deliveryMessage,
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }, messageID);

    } catch (error) {
      console.error(error);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ حدث خطأ أثناء تحميل مقطع الفيديو، حاول لاحقاً.", threadID, messageID);
    }
  }
};
