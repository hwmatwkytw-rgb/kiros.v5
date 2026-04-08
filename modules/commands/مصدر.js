const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "مصدر",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "DANTE", // مطور الكود الأصلي
  description: "الرد على صورة أنمي لجلب اسم الأنمي ومشهد فيديو منه",
  commandCategory: "الوسائط",
  usages: "قم بالرد على صورة بـ (مصدر)",
  cooldowns: 10
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, type, messageReply } = event;

  // 1. التحقق من أن المستخدم رد على رسالة (صورة)
  if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى الرد على صورة أنمي باستخدام الأمر ○\n╯────────────── 🝓", threadID, messageID);
  }

  const imageUrl = messageReply.attachments[0].url;

  try {
    // التفاعل برمز التحليل
    api.setMessageReaction("🔍", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭\n   𝖲𝖢𝖤𝖭𝖤  𝖥𝖨𝖭𝖣𝖤𝖱\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : جاري جلب الفيديو...\n╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    // 2. استخدام API Trace.moe لتحليل الصورة
    // نقوم بتمرير رابط الصورة مباشرة للـ API
    const traceApiUrl = `https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(traceApiUrl);
    
    if (!response.data || !response.data.result || response.data.result.length === 0) {
      throw new Error("No matches found");
    }

    // جلب أفضل نتيجة (الأكثر دقة)
    const bestMatch = response.data.result[0];

    // التأكد من أن نسبة التطابق معقولة (أكثر من 85%)
    if (bestMatch.similarity < 0.85) {
        api.unsendMessage(info.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("لم يتم العثور على تطابق دقيق. ربما ليست صورة أنمي؟", threadID, messageID);
    }

    const { video, anilist, from, to } = bestMatch;
    const animeTitle = anilist.title.english || anilist.title.romaji || anilist.title.native;

    // 3. تحميل مشهد الفيديو المؤقت الذي يوفره الـ API
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const videoPath = path.join(cacheDir, `scene_${Date.now()}.mp4`);
    
    const videoResponse = await axios.get(video, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, Buffer.from(videoResponse.data));

    // 4. إعداد التقرير وإرسال الفيديو
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    // تحويل الوقت من ثواني إلى صيغة دقيقة:ثانية
    const formatTime = (seconds) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(14, 5);
    };

    const report = `╮─────── 🝓 ───────╭\n   𝖲𝖢𝖤𝖭𝖤  𝖥𝖨𝖭𝖣𝖤𝖱\n╯─────── 🝓 ───────╰\n│ ⌑ الأنمي : ${animeTitle}\n│ ⌑ الحلقة : ${bestMatch.episode || "غير محدد"}\n│ ⌑ الوقت : من ${formatTime(from)} إلى ${formatTime(to)}\n│ ⌑ الدقة : ${(bestMatch.similarity * 100).toFixed(1)}%\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    return api.sendMessage({
      body: report,
      attachment: fs.createReadStream(videoPath)
    }, threadID, () => fs.unlinkSync(videoPath), messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("حدث خطأ أثناء محاولة تحليل الصورة أو جلب الفيديو.", threadID, messageID);
  }
};
