module.exports.config = {
  name: "قران",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "YourName",
  description: "تلاوات قرآنية مع اسم القارئ وصورة",
  commandCategory: "الصوتيات",
  usages: "قران [اسم السورة]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");

  // إنشاء مجلد cache إذا لم يكن موجوداً
  const cacheDir = path.join(__dirname, "cache");
  await fs.ensureDir(cacheDir);

  if (args.length === 0) {
    const helpMsg = `
╭─── · · 📖 · · ───╮
     القرآن الكريم
╰─── · · · · · ───╯

📋 **الأوامر المتوفرة:**
• قران [اسم السورة]
• قران قائمة
• قران بحث [كلمة]
• قران قراء

🌟 **أمثلة:**
• قران الفاتحة
• قران يس
• قران الكهف
• قران الرحمن
`.trim();
    return api.sendMessage(helpMsg, event.threadID);
  }

  // أمر عرض قائمة القراء
  if (args[0] === "قراء") {
    const readersList = `
╭─── · · 🎙️ · · ───╮
   قائمة القراء
╰─── · · · · · ───╯

1. عبد الباسط عبد الصمد
2. مشاري العفاسي
3. ماهر المعيقلي
4. عبد الرحمن السديس
5. سعد الغامدي
6. أبو بكر الشاطري
7. ياسر الدوسري
8. ناصر القطامي
    `;
    return api.sendMessage(readersList, event.threadID);
  }

  // أمر عرض قائمة السور
  if (args[0] === "قائمة") {
    try {
      const response = await axios.get("https://api.alquran.cloud/v1/surah");
      const surahs = response.data.data;
      
      let msg = "╭─── · · 📋 · · ───╮\n   قائمة السور\n╰─── · · · · · ───╯\n\n";
      let group = "";
      
      for (let i = 0; i < surahs.length; i++) {
        group += `${surahs[i].number}. ${surahs[i].name}\n`;
        if ((i + 1) % 10 === 0 || i === surahs.length - 1) {
          msg += group + "\n";
          group = "";
        }
      }
      
      msg += "🔍 للبحث: قران بحث [كلمة]";
      return api.sendMessage(msg, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ حدث خطأ في جلب القائمة", event.threadID);
    }
  }

  // أمر البحث
  if (args[0] === "بحث") {
    const searchTerm = args.slice(1).join(" ").toLowerCase();
    
    try {
      const response = await axios.get("https://api.alquran.cloud/v1/surah");
      const allSurahs = response.data.data;
      
      const results = allSurahs.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.englishName.toLowerCase().includes(searchTerm)
      );

      if (results.length === 0) {
        return api.sendMessage("❌ لا توجد نتائج للبحث", event.threadID);
      }

      let resultMsg = "╭─── · · 🔍 · · ───╮\n     نتائج البحث\n╰─── · · · · · ───╯\n\n";
      results.slice(0, 5).forEach(s => {
        resultMsg += `• ${s.name}\n  رقم: ${s.number}\n\n`;
      });

      return api.sendMessage(resultMsg, event.threadID);
    } catch (error) {
      return api.sendMessage("❌ حدث خطأ في البحث", event.threadID);
    }
  }

  // البحث عن السورة المطلوبة
  const surahName = args.join(" ").trim();
  
  // تفاعل البحث
  api.setMessageReaction("🔍", event.messageID, () => {}, true);

  try {
    // جلب جميع السور
    const allSurahsResponse = await axios.get("https://api.alquran.cloud/v1/surah");
    const allSurahs = allSurahsResponse.data.data;
    
    // البحث عن السورة
    let foundSurah = null;
    for (let surah of allSurahs) {
      if (surah.name.includes(surahName) || 
          surah.englishName.toLowerCase().includes(surahName.toLowerCase()) ||
          surahName.includes(surah.name)) {
        foundSurah = surah;
        break;
      }
    }

    if (!foundSurah) {
      return api.sendMessage(
        "❌ لم يتم العثور على السورة\n" +
        "تأكد من الاسم أو استخدم: قران قائمة",
        event.threadID
      );
    }

    // قائمة القراء
    const readers = [
      { 
        name: "عبد الباسط عبد الصمد", 
        reciterId: "ar.abdulbasitabdulsamad",
        style: "مجود"
      },
      { 
        name: "مشاري العفاسي", 
        reciterId: "ar.mishari_rashid_alafasy",
        style: "مرتل"
      },
      { 
        name: "ماهر المعيقلي", 
        reciterId: "ar.maher_almuaiqly",
        style: "الحرم المكي"
      },
      { 
        name: "عبد الرحمن السديس", 
        reciterId: "ar.abdurrahmansudais",
        style: "الحرم المكي"
      },
      { 
        name: "سعد الغامدي", 
        reciterId: "ar.saad_alghamdi",
        style: "مرتل"
      },
      { 
        name: "أبو بكر الشاطري", 
        reciterId: "ar.abubakr_alshatri",
        style: "مرتل"
      }
    ];

    // اختيار قارئ عشوائي
    const randomReader = readers[Math.floor(Math.random() * readers.length)];

    // تفاعل التحميل
    api.setMessageReaction("⬇️", event.messageID, () => {}, true);

    // رابط التلاوة
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${randomReader.reciterId}/${foundSurah.number}.mp3`;
    
    // تحميل الملف الصوتي
    const audioPath = path.join(cacheDir, `surah_${foundSurah.number}_${Date.now()}.mp3`);
    
    // التحقق من الرابط
    const checkResponse = await axios.head(audioUrl).catch(() => null);
    if (!checkResponse) {
      // جرب رابط بديل
      const altUrl = `https://download.quranicaudio.com/quran/${randomReader.reciterId.replace('ar.', '')}/${foundSurah.number}.mp3`;
      const altCheck = await axios.head(altUrl).catch(() => null);
      if (!altCheck) {
        throw new Error("رابط التلاوة غير متاح");
      }
    }

    const audioResponse = await axios({
      url: audioUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 30000
    });
    
    const audioWriter = fs.createWriteStream(audioPath);
    audioResponse.data.pipe(audioWriter);
    
    await new Promise((resolve, reject) => {
      audioWriter.on('finish', resolve);
      audioWriter.on('error', reject);
    });

    // تفاعل النجاح
    api.setMessageReaction("✅", event.messageID, () => {}, true);

    // تنسيق الرسالة
    const message = `
╭─── · · 📖 · · ───╮
     سورة ${foundSurah.name}
╰─── · · · · · ───╯

┌─ 🌟 التفاصيل
│ • 🏷️ الاسم: ${foundSurah.name}
│ • 📊 رقم السورة: ${foundSurah.number}
│ • 📖 عدد الآيات: ${foundSurah.numberOfAyahs}
│ • 🕌 النوع: ${foundSurah.revelationType === "Meccan" ? "مكية" : "مدنية"}
└───────────────

┌─ 🎙️ القارئ
│ • 👤 ${randomReader.name}
│ • 🎼 ${randomReader.style}
└───────────────

┌─ 📜 معلومات إضافية
│ • ✨ الجزء: ${Math.ceil(foundSurah.number / 20)}
│ • 📖 الحزب: ${Math.ceil(foundSurah.number / 4)}
└───────────────

「 جـزاك الله خـيـراً 」
    `.trim();

    // إرسال الرسالة
    await api.sendMessage(message, event.threadID);

    // إرسال التسجيل الصوتي
    await api.sendMessage({
      body: `🎙️ تلاوة سورة ${foundSurah.name} - ${randomReader.name}`,
      attachment: fs.createReadStream(audioPath)
    }, event.threadID);

    // تنظيف الملف الصوتي
    await fs.unlink(audioPath);

  } catch (error) {
    console.error("خطأ:", error);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    
    return api.sendMessage(
      "❌ حدث خطأ أثناء تحميل التلاوة\n" +
      "الأسباب المحتملة:\n" +
      "• اسم السورة غير صحيح\n" +
      "• مشكلة في الاتصال بالإنترنت\n" +
      "• الرابط غير متاح حالياً\n\n" +
      "💡 جرب: قران قائمة",
      event.threadID
    );
  }
};
