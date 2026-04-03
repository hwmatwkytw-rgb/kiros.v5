const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const Youtube = require('youtube-search-api');
const FormData = require('form-data');

module.exports.config = {
  name: "اغنية",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "تحميل الموسيقى عبر سيرفر كايروس الخاص وإرسالها كبصمة",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();

  if (!input) {
    return api.sendMessage(`╮── ▽ 「 تنبيه 」\n│ يرجى كتابة اسم الأغنية يا ملك ○\n╯────────────── 🝓`, threadID, messageID);
  }

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    // البحث باستخدام المكتبة الموجودة في ملفك
    const searchResults = await Youtube.GetListByKeyword(input, false, 6);
    const items = searchResults.items;

    if (!items || items.length === 0) return api.sendMessage("○ لم أجد نتائج مطابقة لطلبك", threadID, messageID);

    let msg = `╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖯 𝖫 𝖠 𝖸 𝖤 𝖱\n╯─────── 🝓 ───────╰\n\n`;
    let links = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const duration = item.length ? item.length.simpleText : "??:??";
      links.push({ id: item.id, title: item.title });
      msg += `│  ▱  ${i + 1}  ○  ${item.title.substring(0, 30)}...\n`;
      msg += `│      ⏲️ المدة: ${duration}\n`;
      if (i < items.length - 1) msg += `│\n`;
    }

    msg += `\n╮─────── 🝓 ───────╭\n│ رد برقم الأغنية لتحويلها لبصمة ○\n╯────────────── 🝓`;

    return api.sendMessage(msg, threadID, (error, info) => {
      global.client.handleReply.push({
        type: 'reply',
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        links
      });
    }, messageID);

  } catch (e) {
    return api.sendMessage(`╮── ▽ 「 خطأ 」\n│ فشل محرك البحث في الوصول ليوتيوب\n╯────────────── 🝓`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  api.unsendMessage(handleReply.messageID);
  const target = handleReply.links[index - 1];
  const videoUrl = `https://www.youtube.com/watch?v=${target.id}`;
  const cachePath = path.join(__dirname, 'cache', `${Date.now()}.m4a`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    const loadingMsg = await api.sendMessage(`╮─── ▽ 「 جاري المعالجة 」\n│ يتم الآن سحب الصوت عبر سيرفر كايروس الخاص ○\n╯────────────── 🝓`, threadID);

    // 1. استخدام API خارجي للتحميل
    const downloadApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(downloadApi);
    
    if (!res.data || !res.data.result || !res.data.result.download) throw new Error("فشل الرابط");

    // 2. تحميل الملف مؤقتاً في تريمكس لرفعه لسيرفرك (اختياري لضمان الاستقرار) أو إرساله مباشرة
    const fileRes = await axios.get(res.data.result.download, { responseType: "arraybuffer" });
    fs.ensureDirSync(path.join(__dirname, 'cache'));
    fs.writeFileSync(cachePath, Buffer.from(fileRes.data));

    // 3. رفع البصمة لسيرفرك الخاص للحفاظ على نسخة (اختياري)
    const form = new FormData();
    form.append('image', fs.createReadStream(cachePath)); // السيرفر يقبل الملفات في حقل 'image'
    await axios.post('https://kiros-api-22.onrender.com/api/upload', form, {
      headers: form.getHeaders()
    }).catch(() => console.log("رفع النسخة الاحتياطية للسيرفر فشل، لكن سأرسل الملف للمستخدم"));

    api.unsendMessage(loadingMsg.messageID);

    // إرسال كبصمة صوتية (m4a)
    await api.sendMessage({
      body: `✅ تم التحويل بنجاح يا ملك ○\n🎵: ${target.title}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      api.setMessageReaction("🎤", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    console.error(e);
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل تحويل الأغنية.. حاول لاحقاً\n╯────────────── 🝓", threadID, messageID);
  }
};
