const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const Youtube = require('youtube-search-api');

module.exports.config = {
  name: "اغنية",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "تحميل الموسيقى وإرسالها كبصمة صوتية (Kairus Style)",
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

    msg += `\n╮─────── 🝓 ───────╭\n│ رد برقم الأغنية للتحويل لبصمة ○\n│ المطور : DANTE\n╯─────── 🝓 ───────╰`;

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
    return api.sendMessage(`╮── ▽ 「 خطأ 」\n│ فشل محرك البحث حالياً\n╯─────── 🝓`, threadID, messageID);
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
  // تغيير الامتداد لـ m4a لضمان عمل الريكورد بشكل مثالي
  const cachePath = path.join(__dirname, 'cache', `${target.id}.m4a`);

  try {
    api.setMessageReaction("📥", messageID, () => {}, true);
    const loadingMsg = await api.sendMessage(`╮─── ▽ 「 جاري التحويل 」\n│ يتم الآن معالجة البصمة: ${target.title.substring(0, 20)}...\n╯────────────── 🝓`, threadID);

    const downloadApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(downloadApi);
    
    if (!res.data || !res.data.result || !res.data.result.download) throw new Error("فشل الرابط");

    const fileRes = await axios.get(res.data.result.download, { responseType: "arraybuffer" });
    
    fs.ensureDirSync(path.join(__dirname, 'cache'));
    fs.writeFileSync(cachePath, Buffer.from(fileRes.data));

    api.unsendMessage(loadingMsg.messageID);

    // إرسال كريكورد صوتي
    await api.sendMessage({
      body: `✅ تم تحويل "${target.title}" لبصمة بنجاح ○`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
      fs.unlinkSync(cachePath);
      api.setMessageReaction("🎤", messageID, () => {}, true);
    }, messageID);

  } catch (e) {
    console.error(e);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل تحويل الأغنية لبصمة\n╯─────── 🝓", threadID, messageID);
  }
};
