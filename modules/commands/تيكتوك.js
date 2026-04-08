const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تيكتوك",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "البحث عن فيديوهات تيك توك وإرسالها",
  commandCategory: "الوسائط",
  usages: "[كلمة البحث]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى كتابة ما تريد البحث عنه ○\n╯────────────── 🝓", threadID, messageID);
  }

  try {
    // التفاعل برمز الانتظار
    api.setMessageReaction("📥", messageID, () => {}, true);
    
    const loadingMsg = `╮─────── 🝓 ───────╭\n   𝖳𝖨𝖪𝖳𝖮𝖪  𝖲𝖤𝖠𝖱𝖢𝖧\n╯─────── 🝓 ───────╰\n│ ⌑ البحث : ${searchQuery}\n│ ⌑ الحالة : جاري البحث عن فيديو...\n╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    // البحث باستخدام API
    const response = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchQuery)}&count=1&cursor=0`);
    const videoData = response.data.data.videos[0];

    if (!videoData) {
      api.unsendMessage(info.messageID);
      return api.sendMessage("لم يتم العثور على نتائج لهذا البحث.", threadID, messageID);
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `search_${Date.now()}.mp4`);
    
    // تحميل الفيديو
    const videoUrl = videoData.play;
    const getVid = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(getVid));

    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭\n   𝖳𝖨𝖪𝖳𝖮𝖪  𝖲𝖤𝖠𝖱𝖢𝖧\n╯─────── 🝓 ───────╰\n│ ⌑ الوصف : ${videoData.title.substring(0, 40)}...\n│ ⌑ الحساب : @${videoData.author.unique_id}\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    return api.sendMessage({
      body: report,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath), messageID);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("حدث خطأ أثناء محاولة جلب الفيديو.", threadID, messageID);
  }
};
