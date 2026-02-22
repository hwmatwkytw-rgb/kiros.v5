const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { alldown } = require("rx-dawonload");

module.exports.config = {
  name: "تحميل",
  version: "2.6.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "تحميل من منصات التواصل (فيديو/صوت) مع نظام الرد",
  commandCategory: "الخدمات",
  usages: "[الرابط]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const url = args.join(" ");

  if (!url || !url.startsWith("http")) {
    return api.sendMessage("⚠️ يرجى إدخال رابط صحيح (تيك توك، فيسبوك، انستغرام... إلخ)", threadID, messageID);
  }

  // تحديد المنصة والإيموجي المناسب
  let pf = { n: "عام", e: "🔍" };
  if (/fb|facebook/.test(url)) pf = { n: "Facebook", e: "💙" };
  else if (/instagram/.test(url)) pf = { n: "Instagram", e: "📸" };
  else if (/tiktok/.test(url)) pf = { n: "TikTok", e: "🖤" };
  else if (/youtube|youtu\.be/.test(url)) pf = { n: "YouTube", e: "❤️" };
  else if (/twitter|x\.com/.test(url)) pf = { n: "X", e: "🐦" };

  api.setMessageReaction(pf.e, messageID, () => {}, true);

  try {
    const data = await alldown(url);
    if (!data || !data.data) throw new Error("لم يتم العثور على بيانات");

    // استخراج رابط الفيديو (دعم النسخ الحديثة من المكتبة)
    const videoUrl = data.data.video || data.data.high || data.data.low || data.data.url;
    const audioUrl = data.data.audio || videoUrl;

    const msg = `╭── • 📥 • ──╮\n` +
                `  ⌈ تـم الـعـثـور عـلـى الـفـيـديـو ⌋\n` +
                `╰── • ${pf.e} • ──╯\n\n` +
                `📍 المنصة: ${pf.n}\n` +
                `🎬 العنوان: ${data.data.title || "بدون عنوان"}\n\n` +
                `1️⃣ - تحميل [ فيديو ]\n` +
                `2️⃣ - تحميل [ صـوت ]\n\n` +
                `«— رد بالرقم المطلوب للتنفيذ —»`;

    return api.sendMessage(msg, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        videoUrl: videoUrl,
        audioUrl: audioUrl,
        title: data.data.title,
        platform: pf.n
      });
    }, messageID);

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("❌ فشل جلب البيانات. قد يكون الفيديو خاصاً أو الرابط غير مدعوم.", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID != handleReply.author) return;

  const choice = body.trim();
  if (choice !== "1" && choice !== "2") return;

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  const isAudio = choice === "2";
  const targetUrl = isAudio ? handleReply.audioUrl : handleReply.videoUrl;
  const ext = isAudio ? "mp3" : "mp4";
  const filePath = path.join(__dirname, "cache", `${Date.now()}.${ext}`);

  try {
    // التأكد من وجود مجلد cache
    if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

    const res = await axios.get(targetUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(res.data, "binary"));

    const stats = fs.statSync(filePath);
    if (stats.size > 83886080) { // 80MB
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return api.sendMessage("❌ الملف كبير جداً (أكبر من 80MB).", threadID, messageID);
    }

    await api.sendMessage({
      body: `✅ تـم تـحـمـيـل ${isAudio ? "الصوت" : "الفيديو"} بـنـجـاح!\n━━━━━━━━━━━━━━━\n🎬: ${handleReply.title || "بدون عنوان"}`,
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        api.setMessageReaction("✅", messageID, () => {}, true);
    }, messageID);

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return api.sendMessage("❌ حدث خطأ أثناء معالجة الملف.", threadID, messageID);
  }
};
