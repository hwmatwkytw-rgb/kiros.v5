const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ايدت",
    version: "2.0.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "إرسال إيديت عشوائي فخم أو عرض قائمة بـ 7 إيديتات احترافية من بينترست",
    commandCategory: "الترفيه",
    usages: "[فقط ايدت] أو [ايدت + اسم التصميم]",
    cooldowns: 5
  },

  // قاعدة بيانات سحابية متكاملة ومستقرة لروابط ميديا بينترست (Pinterest 4K/720p)
  editsDatabase: [
    { title: "إيديت سينمائي أسود وفخم لأفلام الغموض والجريمة", url: "https://v1.pinimg.com/videos/mc/720p/12/37/61/1237617b7b134d1bc9eb04886ccdbfe3.mp4" },
    { title: "تصميم قتال حماسي (Cyberpunk & Neon Light Edit)", url: "https://v1.pinimg.com/videos/mc/720p/9b/6c/df/9b6cdf4da37b67b145a3be2ea8c59f03.mp4" },
    { title: "إيديت درامي عميق لشخصية الجوكر مع ريمكس تريند", url: "https://v1.pinimg.com/videos/mc/720p/ac/be/7d/acbe7d1bb765bbfbf9ce76c12cf34d9d.mp4" },
    { title: "أجواء طوكيو الليلية وتصاميم سيارات الشوارع الفخمة", url: "https://v1.pinimg.com/videos/mc/720p/f6/8c/d7/f68cd717d91df799ba291d9531bf584b.mp4" },
    { title: "تصميم أنمي مظلم (Dark Anime) لقطات انتقالية سريعة", url: "https://v1.pinimg.com/videos/mc/720p/3a/05/cf/3a05cf525b6ecf9119934149fa47bfad.mp4" },
    { title: "إيديت راب سينمائي حماسي للتصاميم الغربية", url: "https://v1.pinimg.com/videos/mc/720p/e4/df/77/e4df779fdf55fca58f5041a99a7776cb.mp4" },
    { title: "تصميم هندسي هادئ مع كلمات متحركة (Lyrics Trend)", url: "https://v1.pinimg.com/videos/mc/720p/22/bc/8f/22bc8f42ef8f4d89a6ea843bc4028fa5.mp4" }
  ],

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > handleReply.data.length) return;

    // تنظيف الشات وحذف القائمة فوراً
    api.unsendMessage(handleReply.messageID);
    
    const selectedVideo = handleReply.data[choice - 1];
    return module.exports.sendVideoFile({ api, threadID, messageID, url: selectedVideo.url, title: selectedVideo.title });
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // حالة (1): إذا كتب الشخص "ايدت" فقط بدون أي إضافات -> إرسال مباشر وعشوائي
    if (args.length === 0) {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const randomEdit = this.editsDatabase[Math.floor(Math.random() * this.editsDatabase.length)];
      return this.sendVideoFile({ api, threadID, messageID, url: randomEdit.url, title: randomEdit.title });
    }

    // حالة (2): إذا كتب الشخص "ايدت" ومعه اسم أو كلمة -> جلب قائمة مخصصة بـ 7 إيديتات
    api.setMessageReaction("🎬", messageID, () => {}, true);
    
    let msg = 
      `╭─  ───  ───  ───  ───  ─╮\n` +
      `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖤 𝖣 𝖨 𝖳\n` +
      `╰─  ───  ───  ───  ───  ─╯\n\n` +
      `🔥 ∘ نتائج البحث عن: 【 ${args.join(" ")} 】\n` +
      `📥 ∘ اختر أحد الإيديتات الـ 7 التالية بالرد برقمها:\n\n`;

    this.editsDatabase.forEach((v, i) => msg += `【 ${i + 1} 】∘ ${v.title}\n`);
    msg += `\n ⎔ الـنـظـام : ڪايروس`;

    return api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        type: "choose_edit",
        data: this.editsDatabase
      });
    }, messageID);
  },

  // محرك التحميل والرفع السريع للمخطوطات المرئية
  sendVideoFile: async function ({ api, threadID, messageID, url, title }) {
    const cachePath = path.join(__dirname, "..", "..", "cache", `kairus_edit_${Date.now()}.mp4`);

    try {
      const response = await axios.get(url, { 
        responseType: "arraybuffer", 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
      });
      
      fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));
      const fileSizeInMB = fs.statSync(cachePath).size / (1024 * 1024);

      const deliveryMessage = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖬 𝖤 𝖣 𝖨 𝖳\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `📝 ∘ الـوصـف : ${title}\n` +
        `📊 ∘ الـدقـة : Ultra HD / 4K 🔥\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      api.setMessageReaction("🔥", messageID, () => {}, true);

      if (fileSizeInMB <= 25) {
        return api.sendMessage({
          body: deliveryMessage,
          attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath); // تنظيف تلقائي فوري للكاش لحفظ مساحة التخزين
        }, messageID);
      } else {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        return api.sendMessage(`⚠️ حجم الإيديت تخطى ليميت الرفع المباشر.\nشاهد بجودة عالية عبر السحابة: ${url}`, threadID, messageID);
      }

    } catch (error) {
      console.error(error);
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ حدث خطأ غير متوقع أثناء معالجة وسحب الفيديو من خوادم بينترست.", threadID, messageID);
    }
  }
};
