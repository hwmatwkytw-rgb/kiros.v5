const fs = require("fs-extra");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const search = require("youtube-search-api");
const axios = require("axios");

module.exports.config = {
  name: "اغاني",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "بحث وتحميل الأغاني",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 10,
  usePrefix: false
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) {
    return api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n⚠️ تنبيه\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ ادخل اسم الاغنية\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID, messageID);
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const results = await search.GetListByKeyword(input, false, 8);
    const list = results.items;
    
    if (!list || list.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ لا توجد نتائج\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID, messageID);
    }

    let menu = "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n🎵 نتائج البحث\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n";
    list.forEach((item, i) => {
      menu += `⏐ ${i + 1}. ${item.title}\n`;
      menu += `⏐ المدة: ${item.length?.simpleText || "غير معروف"}\n`;
      menu += `⏐ القناة: ${item.channelTitle || "غير معروف"}\n\n`;
    });
    menu += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n";
    menu += "⏐ رد برقم الاغنية للتحميل\n";
    menu += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯";

    return api.sendMessage(menu, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        results: list
      });
    }, messageID);
    
  } catch (err) {
    console.error("Search error:", err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ فشل البحث\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID != handleReply.author) return;

  const index = parseInt(body) - 1;
  if (isNaN(index) || index < 0 || index >= handleReply.results.length) {
    return api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ رقم غير صحيح\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID, messageID);
  }

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  const video = handleReply.results[index];
  const videoID = video.id;
  const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
  const videoTitle = video.title;

  await downloadAudio(api, threadID, messageID, videoUrl, videoTitle);
};

async function downloadAudio(api, threadID, messageID, url, title) {
  const cacheDir = path.join(__dirname, "cache");
  const fileName = `${Date.now()}.mp3`;
  const filePath = path.join(cacheDir, fileName);

  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const waitMsg = await api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n⏳ جاري التحميل\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ الرجاء الانتظار...\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID);

    const agent = ytdl.createAgent(undefined, {
      localAddress: '0.0.0.0',
      family: 4
    });

    const stream = ytdl(url, {
      quality: 'lowestaudio',
      filter: 'audioonly',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    });

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    let progress = 0;
    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = (downloaded / total) * 100;
      if (percent - progress >= 10) {
        progress = percent;
      }
    });

    writeStream.on('finish', async () => {
      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      if (stats.size > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ الملف كبير جداً (+25MB)\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID);
      }

      api.unsendMessage(waitMsg.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);

      await api.sendMessage({
        body: `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n✅ تم التحميل\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ ${title}\n⏐ الحجم: ${fileSizeMB} MB\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`,
        attachment: fs.createReadStream(filePath)
      }, threadID, messageID);

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    });

    writeStream.on('error', (err) => {
      console.error("Write error:", err);
      api.unsendMessage(waitMsg.messageID);
      api.setMessageReaction("❌", messageID, () => {}, true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ فشل التحميل\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID);
    });

  } catch (err) {
    console.error("Download error:", err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    
    try {
      await downloadFromAPI(api, threadID, messageID, url, title);
    } catch (e) {
      api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n❌ خطأ\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ تعذر تحميل الاغنية\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID);
    }
  }
}

async function downloadFromAPI(api, threadID, messageID, url, title) {
  const cacheDir = path.join(__dirname, "cache");
  const filePath = path.join(cacheDir, `${Date.now()}.mp3`);

  try {
    const waitMsg = await api.sendMessage("⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n⏳ تحميل بديل\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ جاري التحميل من خادم احتياطي...\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯", threadID);

    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    const apiUrl = `https://api.agatz.xyz/api/ytmp3?url=${videoId}`;
    
    const response = await axios.get(apiUrl, { timeout: 10000 });
    const downloadUrl = response.data.result?.downloadUrl || response.data.url || response.data.download;

    if (!downloadUrl) throw new Error("No download URL");

    const audioResponse = await axios({
      method: 'get',
      url: downloadUrl,
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const writer = fs.createWriteStream(filePath);
    audioResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    api.unsendMessage(waitMsg.messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);

    await api.sendMessage({
      body: `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n✅ تم التحميل\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n⏐ ${title}\n⏐ الحجم: ${fileSizeMB} MB\n⏐ المصدر: خادم بديل\n\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`,
      attachment: fs.createReadStream(filePath)
    }, threadID, messageID);

    setTimeout(() => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 5000);

  } catch (err) {
    console.error("API download error:", err);
    throw err;
  }
                           }
