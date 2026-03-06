const fs = require("fs-extra");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const search = require("youtube-search-api");

module.exports.config = {
  name: "اغاني",
  version: "2.9.5",
  hasPermssion: 0,
  credits: "محمد إدريس",
  description: "بحث وتحميل الأغاني بنمط ⚝ الموحد",
  commandCategory: "الوسائط",
  usages: "[اسم الأغنية]",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ");

  if (!input) return api.setMessageReaction("⚠️", messageID, () => {}, true);

  api.setMessageReaction("🔍", messageID, () => {}, true);

  try {
    const results = await search.GetListByKeyword(input, false, 5);
    const list = results.items;
    
    if (!list || list.length === 0) {
        return api.setMessageReaction("❌", messageID, () => {}, true);
    }

    let menu = `─── • ⌈ ⚝ ⌋ • ───\n  نـتـائـج الـبـحـث\n─── • ⌈ ⚝ ⌋ • ───\n\n`;
    list.forEach((item, i) => {
      menu += `⌈ ${i + 1} ⌋ ${item.title}\n⚝ الـمدة: ${item.length.simpleText}\n\n`;
    });
    menu += `« رد بالرقم للتحميل »\n─── • ⌈ ⚝ ⌋ • ───`;

    return api.sendMessage(menu, threadID, (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        results: list
      });
    }, messageID);
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  if (senderID != handleReply.author) return;

  const index = parseInt(body) - 1;
  if (isNaN(body) || index < 0 || index >= handleReply.results.length) return;

  api.unsendMessage(handleReply.messageID);
  api.setMessageReaction("⌛", messageID, () => {}, true);

  const videoID = handleReply.results[index].id;
  const url = `https://www.youtube.com/watch?v=${videoID}`;
  
  await downloadAudio(api, threadID, messageID, url);
};

async function downloadAudio(api, threadID, messageID, url) {
  const cachePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  try {
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "lowestaudio",
      requestOptions: {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        }
      }
    });

    const fileStream = fs.createWriteStream(cachePath);
    stream.pipe(fileStream);

    fileStream.on("finish", async () => {
      const stats = fs.statSync(cachePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);

      if (fileSize > 25) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return fs.unlinkSync(cachePath);
      }

      api.setMessageReaction("🏁", messageID, () => {}, true);
      
      await api.sendMessage({
        body: `─── • ⌈ ⚝ ⌋ • ───\n⚝ تـم الـتـحميل بـنجاح\n─── • ⌈ ⚝ ⌋ • ───\n[ ⚙︎ ڪايࢪوس ]`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, messageID);

      if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

    stream.on("error", () => {
      api.setMessageReaction("❌", messageID, () => {}, true);
    });

  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
}
