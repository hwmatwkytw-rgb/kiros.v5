const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "يوت",
    version: "2.0.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "البحث في يوتيوب وجلب الفيديوهات مع 7 هاشتاقات والتحميل عبر الرقم أو الرابط المباشر",
    commandCategory: "الخدمات",
    usages: "[اسم المقطع / رابط المقطع]",
    cooldowns: 5
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > handleReply.searchResults.length) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠ خيار غير صحيح. يرجى اختيار رقم من القائمة المعروضة.", threadID, messageID);
    }

    const selectedVideo = handleReply.searchResults[choice - 1];
    api.unsendMessage(handleReply.messageID); // حذف قائمة البحث لتنظيف الشات

    return module.exports.downloadAndSend({ api, threadID, messageID, videoUrl: selectedVideo.url, title: selectedVideo.title });
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(" ");

    if (!input) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠ يرجى إدخال اسم المقطع أو رابط يوتيوب للبحث والتحميل.\n• مثال: /يوت عظمة توني كروس", threadID, messageID);
    }

    // التحقق إذا كان المدخل رابط يوتيوب مباشر
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (ytRegex.test(input)) {
      return module.exports.downloadAndSend({ api, threadID, messageID, videoUrl: input, title: "YouTube Video" });
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      // استخدام محرك بحث سريع وخفيف لجلب نتائج يوتيوب
      const searchRes = await axios.get(`https://api.popcat.xyz/ytsearch?q=${encodeURIComponent(input)}`);
      const results = searchRes.data;

      if (!results || results.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`🔍 لم يتم العثور على نتائج للبحث: "${input}"`, threadID, messageID);
      }

      // أخذ أول 5 نتائج فقط لتفادي ضخامة الرسالة
      const topResults = results.slice(0, 5);
      let searchMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `       𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖸 𝖮 𝖴 𝖳 𝖴 𝖡 𝖤\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🔍 نتائج البحث عن 【 ${input} 】:\n\n`;

      topResults.forEach((video, index) => {
        // توليد 7 هاشتاقات ديناميكية ذكية تناسب المقطع برمجياً
        const cleanTitle = video.title.replace(/[^\u0621-\u064A\s]/g, "").split(" ").filter(w => w.length > 2).slice(0, 4);
        const tags = [
          "#ڪايروس", "#يوتيوب", "#فيديو",
          ...(cleanTitle.map(w => `#${w}`)),
          "#ترند", "#مقطع", "#منوعات"
        ].slice(0, 7);

        const shortDesc = video.description ? (video.description.slice(0, 70) + "...") : "لا يوجد وصف متوفر للنسخة المصغرة.";

        searchMessage += 
          `【 ${index + 1} 】∘ ${video.title}\n` +
          `👤 ∘ الـقـنـاة : ${video.channel}\n` +
          `⏱️ ∘ الـمـدة : ${video.duration}\n` +
          `📝 ∘ الـوصـف : ${shortDesc}\n` +
          `🏷️ ∘ الـهـاشـتـاقـات : ${tags.join(" ")}\n` +
          `───  ───  ───\n`;
      });

      searchMessage += `💬 رد برقم المقطع المطلوب (1-5) لتحميله فوراً.\n\n ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(searchMessage, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          searchResults: topResults
        });
      }, messageID);

    } catch (error) {
      console.error("YouTube Search Error:", error.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ حدث خطأ أثناء الاتصال بمحرك بحث يوتيوب، حاول مجدداً لاحقاً.", threadID, messageID);
    }
  },

  // المنظومة البرمجية الموحدة للتحميل والإرسال النظيف
  downloadAndSend: async function ({ api, threadID, messageID, videoUrl, title }) {
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      // استدعاء السيرفر البرمجي الخارجي لمعالجة وتحميل الفيديو بجودة مستقرة ومباشرة
      const downloadRes = await axios.get(`https://api.dreaded.site/downloader/ytdl?url=${encodeURIComponent(videoUrl)}`);
      
      if (!downloadRes.data || !downloadRes.data.result) {
        throw new Error("Invalid download data");
      }

      const videoData = downloadRes.data.result;
      const directDownloadLink = videoData.download_url || videoData.url; // رابط التحميل المباشر للرد به

      const videoPath = path.join(__dirname, "..", "..", "cache", `yt_${Date.now()}.mp4`);

      // تحميل ملف الفيديو مؤقتاً في السيرفر لفحص حجمه وإرساله
      const videoBuffer = await axios.get(directDownloadLink, { responseType: "arraybuffer" });
      fs.writeFileSync(videoPath, Buffer.from(videoBuffer.data, "utf-8"));

      const stats = fs.statSync(videoPath);
      const fileSizeInBytes = stats.size;
      const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

      // تنسيق رسالة التسليم والروابط
      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖣 𝖮 𝖶 𝖭 𝖫 𝖮 𝖠 𝖣\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `🎬 ∘ تـم مـعـالـجـة : ${title}\n\n` +
        `🔗 ∘ رابـط الـتـحـمـيـل الـمـبـاشـر (السريع):\n${directDownloadLink}\n\n` +
        `${fileSizeInMegabytes > 45 ? "⚠️ تنبيه: حجم الفيديو كبير جداً وتم إرسال الرابط المباشر فقط للحفاظ على استقرار السيرفر الشات." : "📥 جاري رفع الفيديو وتوصيله الآن..."}\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("✅", messageID, () => {}, true);

      // إذا كان حجم الفيديو أقل من ليميت المسنجر (45 ميجا) يرسل الفيديو كملف مدمج + الرابط، وإذا كان أكبر يكتفي بالرابط لحماية السيرفر من الانهيار
      if (fileSizeInMegabytes <= 45) {
        return api.sendMessage({
          body: deliveryMessage,
          attachment: fs.createReadStream(videoPath)
        }, threadID, () => {
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); // تصفير ومسح كاش التخزين فوراً
        }, messageID);
      } else {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        return api.sendMessage(deliveryMessage, threadID, messageID);
      }

    } catch (error) {
      console.error("YouTube Download Error:", error.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ عذراً، تعذر تحميل المقطع برمجياً. يمكنك استخدام رابط التحميل الاحتياطي السريع عبر البحث يدويًا.`, threadID, messageID);
    }
  }
};
