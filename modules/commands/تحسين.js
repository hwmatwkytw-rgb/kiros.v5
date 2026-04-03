const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports.config = {
  name: "تحسين",
  version: "4.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تحسين جودة الصور عبر سيرفر كايروس (4K Enhanced)",
  commandCategory: "الصور",
  cooldowns: 20
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("📸 ○ نعتذر.. يجب الرد على صورة أولاً", threadID, messageID);
  }

  const startTime = Date.now();
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const tempPath = path.join(cacheDir, `temp_upscale_${Date.now()}.jpg`);

  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);

    const loadingMsg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖤 𝖭 𝖦 𝖨 𝖭 𝖤
╯─────── 🝓 ───────╰
│ ⌑ الحالة : جاري رفع الصورة...
│ ⌑ المحرك : Real-ESRGAN 4K
│ ⌑ انتظر قليلاً يا ملك ○
╯────────────── 🝓`;

    const info = await api.sendMessage(loadingMsg, threadID);

    // 1. تحميل الصورة الأصلية وحفظها مؤقتاً
    const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: 'arraybuffer' });
    fs.writeFileSync(tempPath, Buffer.from(imgRes.data));

    // 2. الرفع لسيرفرك الخاص (لضمان وصول رابط مباشر وسريع للمحسن)
    const form = new FormData();
    form.append('image', fs.createReadStream(tempPath));
    const uploadRes = await axios.post('https://kiros-api-22.onrender.com/api/upload', form, {
      headers: form.getHeaders()
    });
    const myServerUrl = uploadRes.data.url;

    // 3. إرسال رابط سيرفرك لمحرك التحسين الاحترافي
    const upscaleUrl = `https://raihan-api.vercel.app/remini?url=${encodeURIComponent(myServerUrl)}`;
    const response = await axios.get(upscaleUrl, { responseType: "arraybuffer" });
    
    const filePath = path.join(cacheDir, `kairus_pro_${Date.now()}.png`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    api.unsendMessage(info.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭
    𝖯 𝖱 𝖪   𝖱 𝖤 𝖲 𝖴 𝖫 𝖳
╯─────── 🝓 ───────╰
│ ⌑ الحالة : تم التحسين بنجاح ○
│ ⌑ الدقة : 4K Ultra HD
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
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ فشل النظام في تحسين الصورة عبر السيرفر الخاص\n╯─────── 🝓", threadID, messageID);
  }
};
