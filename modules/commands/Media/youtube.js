const axios = require('axios');
const ytdl = require('ytdl-core');
const formatter = require('../../../utils/formatter');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "فيديو",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "N-Dora Team",
  description: "تنزيل فيديوهات من YouTube",
  commandCategory: "وسائط",
  usages: "[رابط YouTube]",
  cooldowns: 10,
  envConfig: {
    autoUnsend: false
  }
};

module.exports.languages = {
  "ar": {
    "loading": "جاري تنزيل الفيديو...",
    "error": "عذراً، حدث خطأ في تنزيل الفيديو",
    "noInput": "يرجى إدخال رابط YouTube صحيح",
    "invalidUrl": "الرابط غير صحيح أو غير مدعوم",
    "success": "تم تنزيل الفيديو بنجاح",
    "fileSize": "حجم الملف",
    "duration": "مدة الفيديو",
    "quality": "الجودة"
  },
  "en": {
    "loading": "Downloading video...",
    "error": "Sorry, there was an error downloading the video",
    "noInput": "Please enter a valid YouTube link",
    "invalidUrl": "Invalid or unsupported link",
    "success": "Video downloaded successfully",
    "fileSize": "File Size",
    "duration": "Duration",
    "quality": "Quality"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const url = args.join(" ");

  if (!url) {
    return api.sendMessage(
      formatter.error(getText("noInput")),
      threadID,
      messageID
    );
  }

  // Validate URL
  if (!ytdl.validateURL(url)) {
    return api.sendMessage(
      formatter.error(getText("invalidUrl")),
      threadID,
      messageID
    );
  }

  const loadingMsg = await api.sendMessage(
    formatter.loading(getText("loading")),
    threadID
  );

  try {
    // Get video info
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const videoDuration = info.videoDetails.lengthSeconds;
    const videoAuthor = info.videoDetails.author.name;

    // Get best audio format
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const bestAudio = audioFormats.sort((a, b) => b.audioBitrate - a.audioBitrate)[0];

    if (!bestAudio) {
      throw new Error('لم يتم العثور على صيغة صوتية');
    }

    // Download video
    const downloadPath = path.join(__dirname, '../../../cache/videos');
    await fs.ensureDir(downloadPath);

    const fileName = `${videoTitle.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    const filePath = path.join(downloadPath, fileName);

    const stream = ytdl(url, { quality: 'highest' });
    const writeStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('end', resolve);
      stream.on('error', reject);
      writeStream.on('error', reject);
    });

    // Format response
    const fileStats = await fs.stat(filePath);
    const formattedResponse = `
${formatter.header('تنزيل من YouTube')}
${formatter.emojis.video} العنوان: ${formatter.bold(videoTitle)}
${formatter.emojis.user} المنتج: ${videoAuthor}
${formatter.emojis.hourglass} المدة: ${formatDuration(videoDuration)}
${formatter.emojis.image} الحجم: ${formatter.formatSize(fileStats.size)}
${formatter.emojis.rocket} الجودة: HD
${formatter.borders.simple}
    `;

    // Delete loading message
    api.unsendMessage(loadingMsg.messageID);

    // Send video
    return api.sendMessage({
      body: formattedResponse,
      attachment: fs.createReadStream(filePath)
    }, threadID, messageID);

  } catch (error) {
    console.error('YouTube Download Error:', error);
    api.unsendMessage(loadingMsg.messageID);
    
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
};

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

module.exports.handleEvent = function ({ api, event, getText }) {
  // Optional: Handle events
};
