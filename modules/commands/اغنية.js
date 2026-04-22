const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// جلب رابط الـ API المتغير لضمان الاستمرارية
const getBaseApi = async () => {
  try {
    const res = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
    return res.data.api;
  } catch (e) {
    return "https://api.d1p70.xyz"; // رابط احتياطي
  }
};

module.exports.config = {
  name: "اغنية",
  version: "8.0.0",
  credits: "Dante Sparda & Gemini",
  description: "تحميل الموسيقى باستخدام سيرفر مستقر",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية / رابط]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");
  if (!input) return api.sendMessage("○ اكتب اسم الأغنية يا ملك أو ضع رابطاً", threadID, messageID);

  const checkUrl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/)/;

  try {
    const apiUrl = await getBaseApi();

    // حالة الرابط المباشر
    if (checkUrl.test(input)) {
      api.sendMessage("📥 جاري معالجة الرابط، انتظر قليلاً...", threadID);
      try {
        const { data } = await axios.get(`${apiUrl}/ytDl3?link=${encodeURIComponent(input)}&format=mp3`);
        const audioPath = path.join(__dirname, 'cache', `${Date.now()}.mp3`);
        const stream = await getStream(data.downloadLink, audioPath);
        
        return api.sendMessage({ 
          body: `✅ تـم الـتـحميل\n🎵 العنوان: ${data.title}`, 
          attachment: stream 
        }, threadID, () => fs.unlinkSync(audioPath), messageID);
      } catch (err) {
        return api.sendMessage("❌ فشل تحميل الرابط، قد يكون الفيديو طويل جداً", threadID, messageID);
      }
    }

    // حالة البحث بالاسم
    api.sendMessage("🔍 جاري البحث عن الأغنية...", threadID, async (err, info) => {
      try {
        const res = await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(input)}`);
        const results = res.data.slice(0, 6);

        if (results.length === 0) return api.sendMessage("❌ لم أجد نتائج لهذا البحث", threadID, messageID);

        let msg = `╮─── 𝖪𝖠𝖨𝖱𝖴𝖲 𝖯𝖫𝖠𝖸𝖤𝖱 ───╭\n`;
        results.forEach((item, i) => {
          msg += `│ ${i + 1}. ${item.title.substring(0, 30)}...\n│ ⏱️ المدة: ${item.time}\n`;
        });
        msg += `╯────────────── 🝓\nرد برقم الأغنية ○`;

        api.unsendMessage(info.messageID);
        return api.sendMessage(msg, threadID, (err, nextInfo) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: nextInfo.messageID,
            author: senderID,
            results
          });
        }, messageID);
      } catch (e) {
        api.sendMessage("❌ حدث خطأ أثناء البحث", threadID, messageID);
      }
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ السيرفر لا يستجيب حالياً", threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.results.length) return;

  const target = handleReply.results[index - 1];
  api.unsendMessage(handleReply.messageID);
  
  const audioPath = path.join(__dirname, 'cache', `${Date.now()}.mp3`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    const apiUrl = await getBaseApi();
    const { data } = await axios.get(`${apiUrl}/ytDl3?link=${target.id}&format=mp3`);
    
    const stream = await getStream(data.downloadLink, audioPath);

    api.sendMessage({ 
      body: `✅ ${target.title}\n✨ استمتاعاً طيباً`, 
      attachment: stream 
    }, threadID, () => {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }, messageID);

  } catch (e) {
    api.sendMessage("❌ فشل تحميل الأغنية، حاول مرة أخرى", threadID, messageID);
  }
};

// دالة مساعدة لتحويل الرابط إلى Stream
async function getStream(url, filePath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.outputFileSync(filePath, Buffer.from(res.data));
  return fs.createReadStream(filePath);
}
