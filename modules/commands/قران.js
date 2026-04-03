const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "قران",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "DANTE",
  description: "تلاوات قرآنية شاملة (استايل كايروس)",
  commandCategory: "الصوتيات",
  usages: "[اسم السورة]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);

  if (args.length === 0) {
    const helpMsg = `╮─────── 🝓 ───────╭
    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖰 𝖴 𝖱 𝖠 𝖭
╯─────── 🝓 ───────╰
│ ⌑ قران [اسم السورة]
│ ⌑ قران قائمة (لعرض السور)
│ ⌑ قران قراء (لقائمة القراء)
│ ⌑ قران بحث [كلمة]
╯────────────── 🝓`;
    return api.sendMessage(helpMsg, threadID, messageID);
  }

  // قائمة القراء المعتمدة في النظام
  const readers = [
    { name: "عبد الباسط عبد الصمد", id: "ar.abdulbasitabdulsamad" },
    { name: "مشاري العفاسي", id: "ar.mishari_rashid_alafasy" },
    { name: "ماهر المعيقلي", id: "ar.maher_almuaiqly" },
    { name: "عبد الرحمن السديس", id: "ar.abdurrahmansudais" },
    { name: "سعد الغامدي", id: "ar.saad_alghamdi" },
    { name: "أبو بكر الشاطري", id: "ar.abubakr_alshatri" }
  ];

  if (args[0] === "قراء") {
    let rMsg = `╮─── ▽ 「 قائمة القراء 」\n`;
    readers.forEach((r, i) => rMsg += `│  ▱  ${i + 1}  ○  ${r.name}\n`);
    rMsg += `╯────────────── 🝓`;
    return api.sendMessage(rMsg, threadID, messageID);
  }

  if (args[0] === "قائمة") {
    try {
      const res = await axios.get("https://api.alquran.cloud/v1/surah");
      const surahs = res.data.data;
      let sMsg = `╮─── ▽ 「 قائمة السور 」\n`;
      surahs.slice(0, 20).forEach(s => sMsg += `│  ▱  ${s.number}  ○  ${s.name}\n`);
      sMsg += `│  ○ ... استخدم البحث للمزيد\n╯────────────── 🝓`;
      return api.sendMessage(sMsg, threadID, messageID);
    } catch (e) { return api.sendMessage("○ فشل جلب القائمة", threadID); }
  }

  const query = args.join(" ");
  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const allSurahsRes = await axios.get("https://api.alquran.cloud/v1/surah");
    const allSurahs = allSurahsRes.data.data;
    
    let found = allSurahs.find(s => s.name.includes(query) || s.englishName.toLowerCase().includes(query.toLowerCase()));

    if (!found) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("╮── ▽ 「 تنبيه 」\n│ لم يتم العثور على السورة ○\n╯────────────── 🝓", threadID, messageID);
    }

    const randomReader = readers[Math.floor(Math.random() * readers.length)];
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${randomReader.id}/${found.number}.mp3`;
    const audioPath = path.join(cacheDir, `quran_${found.number}_${Date.now()}.mp3`);

    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    const response = await axios({ url: audioUrl, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(audioPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    api.setMessageReaction("✅", messageID, () => {}, true);

    const report = `╮─────── 🝓 ───────╭\n    𝖧 𝖮 𝖫 𝖸   𝖰 𝖴 𝖱 𝖠 𝖭\n╯─────── 🝓 ───────╰\n│ ⌑ السورة : ${found.name}\n│ ⌑ الآيات : ${found.numberOfAyahs}\n│ ⌑ النوع : ${found.revelationType === "Meccan" ? "مكية" : "مدنية"}\n│ ⌑ القارئ : ${randomReader.name}\n│ ⌑ المطور : DANTE\n╯────────────── 🝓`;

    await api.sendMessage({ body: report, attachment: fs.createReadStream(audioPath) }, threadID, () => fs.unlinkSync(audioPath), messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("╮── ▽ 「 خطأ 」\n│ تعذر تحميل التلاوة حالياً ○\n╯────────────── 🝓", threadID, messageID);
  }
};
