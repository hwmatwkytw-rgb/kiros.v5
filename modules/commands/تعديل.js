const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "تعديل",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تعديل الصور بالذكاء الاصطناعي عبر سيرفر كايروس الخاص",
  commandCategory: "الصور",
  usages: "[الوصف بالإنجليزية]",
  cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ اكتب وصف التعديل يا ملك ○\n│ مثال: تعديل anime style\n╯────────────── 🝓", threadID, messageID);
  }

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ يجب الرد على صورة أولاً ○\n╯────────────── 🝓", threadID, messageID);
  }

  const startTime = Date.now();
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const tempPath = path.join(cacheDir, `temp_${Date.now()}.jpg`);

  try {
    api.setMessageReaction("🎨", messageID, () => {}, true);
    const loadingMsg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖠 𝖨   𝖠 𝖱 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : جاري الرفع والمعالجة...
│ ⌑ الوصف : ${prompt.substring(0, 20)}...
╯────────────── 🝓`;
    const info = await api.sendMessage(loadingMsg, threadID);

    // 1. تحميل الصورة من فيسبوك
    const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(imgRes.data));

    // 2. الرفع لسيرفرك الخاص للحصول على رابط مباشر
    const form = new FormData();
    form.append('image', fs.createReadStream(tempPath));
    const uploadRes = await axios.post('https://kiros-api-22.onrender.com/api/upload', form, {
      headers: form.getHeaders()
    });
    const myServerUrl = uploadRes.data.url;

    // 3. إرسال رابط سيرفرك لـ API التعديل
    const editApi = `https://api.shayan.tech/img2img?url=${encodeURIComponent(myServerUrl)}&prompt=${encodeURIComponent(prompt)}`;
    const response = await axios.get(editApi, { responseType: "arraybuffer" });
    
    const filePath = path.join(cacheDir, `kairus_edit_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭
    𝖤 𝖣 𝖨 𝖳   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳
╯─────── 🝓 ───────╰
│ ⌑ تم التعديل عبر سيرفر كايروس ○
│ ⌑ الوقت : ${duration} ثانية
│ ⌑ المطور : DANTE
╯────────────── 🝓`;

    return api.sendMessage({
      body: report,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }, messageID);

  } catch (error) {
    console.error(error);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل السيرفر في معالجة الصورة ○\n╯─────── 🝓", threadID, messageID);
  }
};
