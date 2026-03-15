const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "اصفع",
  version: "3.3.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "تصفع شخصاً بالمنشن أو عبر الرد على رسالته",
  commandCategory: "ترفيه",
  usages: "[منشن أو رد على رسالة]",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const dirMaterial = path.resolve(__dirname, 'cache', 'canvas');
  const imgPath = path.resolve(dirMaterial, 'sato.png');
  
  if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
  if (!fs.existsSync(imgPath)) {
      const getImg = await axios.get("https://i.imgur.com/dsrmtlg.jpg", { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(getImg.data, "utf-8"));
  }
}

async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage({ one, two }) {
  const root = path.resolve(__dirname, "cache", "canvas");
  const templatePath = path.resolve(root, "sato.png");
  const pathImg = path.resolve(root, `slap_${one}_${two}.png`);
  const avatarOne = path.resolve(root, `avt_${one}.png`);
  const avatarTwo = path.resolve(root, `avt_${two}.png`);

  const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
  const getAvt1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=${token}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvt1, 'utf-8'));

  const getAvt2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=${token}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvt2, 'utf-8'));

  const baseImg = await jimp.read(templatePath);
  const circleOne = await jimp.read(await circle(avatarOne));
  const circleTwo = await jimp.read(await circle(avatarTwo));

  baseImg.composite(circleOne.resize(150, 150), 80, 190)
         .composite(circleTwo.resize(150, 150), 260, 80);

  const buffer = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, buffer);

  if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
  if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);

  return pathImg;
}

module.exports.run = async function ({ event, api }) {    
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  
  let targetID;
  if (type === "message_reply") {
    targetID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else {
    return api.sendMessage("اعمل تاق للعب يا حبيبنا ₍ •`-ʼ• ₎", threadID, messageID);
  }

  try {
    const imgPath = await makeImage({ one: senderID, two: targetID });
    return api.sendMessage({ 
      body: "أبشررر بالعلقة الكاربة! 😂 👋", 
      attachment: fs.createReadStream(imgPath) 
    }, threadID, () => {
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }, messageID);
  } catch (e) {
    console.error(e);
    return api.sendMessage("حصل خطأ فني، الضارب جلى الرمية!", threadID, messageID);
  }
}
