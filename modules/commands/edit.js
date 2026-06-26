const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ايدت",
    version: "3.0.0",
    hasPermission: 0,
    credits: "DANTE SPARDA",
    description: "نظام جلب إيديت ذكي (عربي/إنجليزي)",
    commandCategory: "الترفيه",
    usages: "[ايدت] أو [ايدت + اسم التصميم]",
    cooldowns: 5
  },

  // قاعدة بيانات ذكية (يمكنك إضافة المزيد بنفس التنسيق)
  editsDatabase: [
    { title: "Cyberpunk Action", tags: ["سايبربانك", "cyberpunk", "قتال", "action"], url: "https://files.catbox.moe/g239s1.mp4" },
    { title: "Dark Anime Vibes", tags: ["أنمي", "حزين", "anime", "dark", "sad"], url: "https://files.catbox.moe/o9s2a1.mp4" },
    { title: "Street Racing Night", tags: ["سيارات", "طوكيو", "cars", "drift", "tokyo"], url: "https://files.catbox.moe/k39s1a.mp4" },
    { title: "Joker Dark Edit", tags: ["جوكر", "joker", "غموض", "dark"], url: "https://files.catbox.moe/8b7v6z.mp4" }
  ],

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ").toLowerCase();

    // البحث الذكي: مطابقة الكلمة المدخلة مع الوسوم (Tags)
    let selectedEdit = query 
      ? this.editsDatabase.find(e => e.tags.some(tag => query.includes(tag.toLowerCase())))
      : this.editsDatabase[Math.floor(Math.random() * this.editsDatabase.length)];

    if (!selectedEdit) {
      return api.sendMessage("❌ ∘ لم يتم العثور على إيديت بهذا الاسم، جرب كلمات أخرى.", threadID, messageID);
    }

    return this.sendVideoFile({ api, threadID, messageID, url: selectedEdit.url, title: selectedEdit.title });
  },

  sendVideoFile: async function ({ api, threadID, messageID, url, title }) {
    const cachePath = path.join(__dirname, "..", "..", "cache", `edit_${Date.now()}.mp4`);
    
    // إشعار بالتحميل
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

      const msg = 
        `╭─  ───  ───  ───  ───  ─╮\n` +
        `     𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖬 𝖤 𝖣 𝖨 𝖳\n` +
        `╰─  ───  ───  ───  ───  ─╯\n\n` +
        `📝 ∘ الـوصـف : ${title}\n` +
        `🔥 ∘ الـحـالـة : جاهز للمشاهدة\n\n` +
        ` ⎔ الـنـظـام : ڪايروس`;

      await api.sendMessage({ body: msg, attachment: fs.createReadStream(cachePath) }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

      api.setMessageReaction("🔥", messageID, () => {}, true);

    } catch (error) {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("⚠️ حدث خطأ أثناء معالجة الإيديت.", threadID, messageID);
    }
  }
};
