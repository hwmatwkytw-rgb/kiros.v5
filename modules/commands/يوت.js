const axios = require("axios");

module.exports.config = {
  name: "يوت",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "تحميل فيديو من اليوتيوب برابط مباشر",
  commandCategory: "الوسائط والتحميل",
  usages: "[رابط الفيديو]",
  cooldowns: 10
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  const videoUrl = args[0];

  if (!videoUrl || !videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
    return api.sendMessage("أرمي لي رابط يوتيوب حقيقي يا ماسورة، ما تستهبل علي ʕᵕ᷄-ᵕ᷅ʔ", threadID, messageID);
  }

  api.sendMessage("جاري سحب الفيديو من اليوتيوب.. أصبر لي شوية يا وهم ⏳", threadID, messageID);

  try {
    // استخدام API تحميل مباشر وسريع
    const res = await axios.get(`https://api.samir.xyz/download/yt?url=${encodeURIComponent(videoUrl)}`);
    
    if (res.data && res.data.status === true) {
      const data = res.data.result;
      const downloadUrl = data.download_url || data.video_url;
      const title = data.title || "فيديو يوتيوب";

      const stream = (await axios.get(downloadUrl, { responseType: "stream" })).data;

      return api.sendMessage({
        body: `تم التحميل يا فردة ₍ •\`-ʼ• ₎\n🎬 العنوان: ${title}`,
        attachment: stream
      }, threadID, messageID);
    } else {
      throw new Error("API Failed");
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("الفيديو ده تقيل على السيرفر أو الرابط خربان، جرب واحد غيره يا عواليق ₍•᷄ - •᷅₎", threadID, messageID);
  }
};
