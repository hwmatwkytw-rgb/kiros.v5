const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "تيك",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحميل فيديوهات تيك توك بدون علامة مائية",
  commandCategory: "الوسائط",
  usages: "[رابط الفيديو]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const url = args[0];

  if (!url) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يرجى وضع رابط الفيديو ○\n╯────────────── 🝓", threadID, messageID);
  }

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const loadingMsg = `╮─────── 🝓 ───────╭\n    𝖳 𝖨 𝖪 𝖳 𝖮 𝖪   𝖣 𝖮 𝖶 𝖭\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : جاري جلب الفيديو...\n│ ⌑ المصدر : TikTok Engine\n╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const data = res.data.data;
    if (!data) throw new Error();

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);
    const getVid = (await axios.get(data.play, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(getVid));

    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭\n    𝖳 𝖨 𝖪 𝖳 𝖮 𝖪   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳\n╯─────── 🝓 ───────╰\n│ ⌑ الوصف : ${data.title.substring(0, 30)}...\n│ ⌑ الحساب : @${data.author.unique_id}\n│ ⌑ المشاهدات : ${data.play_count.toLocaleString()}\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    return api.sendMessage({ body: report, attachment: fs.createReadStream(filePath) }, threadID, () => fs.unlinkSync(filePath), messageID);
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل التحميل.. تأكد من الرابط ○\n╯────────────── 🝓", threadID, messageID);
  }
};
