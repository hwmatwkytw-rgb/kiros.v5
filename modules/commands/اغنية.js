const axios = require('axios');
const fs = require('fs-extra');
const Youtube = require('youtube-search-api');

module.exports.config = {
  name: "اغنية",
  version: "7.0.0",
  credits: "Dante Sparda",
  description: "تحميل الموسيقى وإرسالها كبصمة صوتية",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(" ");
  if (!input) return api.sendMessage("○ اكتب اسم الأغنية يا ملك", event.threadID);

  try {
    const search = await Youtube.GetListByKeyword(input, false, 5);
    const items = search.items;
    let msg = `╮─── 𝖪𝖠𝖨𝖱𝖴𝖲 𝖯𝖫𝖠𝖸𝖤𝖱 ───╭\n`;
    let links = [];
    items.forEach((item, i) => {
      links.push({ id: item.id, title: item.title });
      msg += `│ ${i+1}. ${item.title.substring(0,25)}...\n`;
    });
    msg += `╯────────────── 🝓\nرد برقم الأغنية ○`;
    
    return api.sendMessage(msg, event.threadID, (err, info) => {
      global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: event.senderID, links });
    }, event.messageID);
  } catch (e) { api.sendMessage("❌ خطأ في البحث", event.threadID); }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  if (handleReply.author != event.senderID) return;
  const index = parseInt(event.body);
  if (isNaN(index) || index < 1 || index > handleReply.links.length) return;

  api.unsendMessage(handleReply.messageID);
  const target = handleReply.links[index-1];
  const audioPath = `${__dirname}/cache/${Date.now()}.m4a`;

  try {
    api.setMessageReaction("📥", event.messageID, () => {}, true);
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=https://www.youtube.com/watch?v=${target.id}`);
    const download = await axios.get(res.data.result.download, { responseType: "arraybuffer" });
    fs.outputFileSync(audioPath, Buffer.from(download.data));

    api.sendMessage({ body: `✅ ${target.title}`, attachment: fs.createReadStream(audioPath) }, event.threadID, () => {
      fs.unlinkSync(audioPath);
    }, event.messageID);
  } catch (e) { api.sendMessage("❌ فشل التحميل", event.threadID); }
};
