const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const Youtube = require('youtube-search-api');

module.exports.config = {
  name: "اغنية",
  version: "5.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحميل الموسيقى مع عرض الحجم والمدة (استايل كايروس)",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();

  if (!input) {
    return api.sendMessage(`╮── ▽ 「 تنبيه 」\n│ يرجى كتابة اسم الأغنية يا ملك ○\n╯────────────── 🝓`, threadID, messageID);
  }

  try {
    api.setMessageReaction("🔍", messageID, () => {}, true);

    // البحث عن 6 نتائج
    const searchResults = await Youtube.GetListByKeyword(input, false, 6);
    const items = searchResults.items;

    if (!items || items.length === 0) return api.sendMessage("○ لم أجد شيئاً.. حاول بكلمات أخرى", threadID, messageID);

    let msg = `╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖯 𝖫 𝖠 𝖸 𝖤 𝖱\n╯─────── 🝓 ───────╰\n\n`;
    let links = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const duration = item.length ? item.length.simpleText : "??:??";
      links.push({ id: item.id, title: item.title });
      
      msg += `│  ▱  ${i + 1}  ○  ${item.title.substring(0, 35)}...\n`;
      msg += `│      ⏲️ الـمدة: ${duration}\n`;
      if (i < items.length - 1) msg += `│\n`;
    }

    msg += `\n╮─────── 🝓 ───────╭\n│ رد برقم الأغنية للتحميل ○\n│ المطور : DANTE\n╯─────── 🝓 ───────╰`;

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
    console.error(e);
    return api.sendMessage(`╮── ▽ 「 خطأ 」\n│ فشل محرك البحث حالياً\n╯─────── 🝓`, threadID, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { body, threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return;

  const index = parseInt(body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  // حذف قائمة البحث فور الاختيار
  api.unsendMessage(handleReply.messageID);

  const target = handleReply.links[index - 1];
  const videoUrl = `https://www.youtube.com/watch?v=${target.id}`;
  const cachePath = path.join(__dirname, 'cache', `${target.id}.mp3`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    
    const loadingMsg = await api.sendMessage(`╮─── ▽ 「 جاري التحميل 」\n│ يتم الآن معالجة: ${target.title.substring(0, 20)}...\n╯────────────── 🝓`, threadID);

    // استخدام API خارجي مستقر للتحويل لضمان تخطي قيود يوتيوب
    const downloadApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(downloadApi);
    
    if (!res.data || !res.data.result || !res.data.result.download) throw new Error("فشل الرابط");

    const fileRes = await axios.get(res.data.result.download, { responseType: "arraybuffer" });
    
    // إظهار الحجم التقريبي
    const fileSizeMB = (fileRes.data.byteLength / (1024 * 1024)).toFixed(2);
    
    if (fileSizeMB > 25) {
        api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage("⚠️ الملف كبير جداً (أكثر من 25 ميجا)", threadID, messageID);
    }

    fs.ensureDirSync(path.join(__dirname, 'cache'));
    fs.writeFileSync(cachePath, Buffer.from(fileRes.data));

    api.unsendMessage(loadingMsg.messageID);

    const report = `╮─────── 🝓 ───────╭\n    𝖣 𝖮 𝖶 𝖭 𝖫 𝖮 𝖠 𝖣   𝖮 𝖪\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : تم التحميل ○\n│ ⌑ الحجم : ${fileSizeMB} MB\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    await api.sendMessage({
      body: report,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      fs.unlinkSync(cachePath);
      api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ نعتذر.. تعذر تحميل هذا الملف حالياً\n╯─────── 🝓", threadID, messageID);
  }
};
