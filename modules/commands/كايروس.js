const axios = require("axios");

module.exports.config = {
  name: "كايروس",
  version: "6.5.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "المحرك الرئيسي - ردم وحماية وتفاعل ذكي",
  commandCategory: "الذكاء الاصطناعي",
  usages: "ناديه باسمه مباشرة",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api: bot, event }) {
  const { threadID, messageID, senderID, body } = event;
  if (!body || senderID == bot.getCurrentUserID()) return;

  const input = body.toLowerCase();
  const DANTE_ID = "61581906898524"; 
  
  // 1. حماية المطورين
  const protected = ["دانتي", "dante", "كولو", "colo", "victor", "فيكتور", "اناس", "anas"];
  if (protected.some(name => input.includes(name)) && senderID !== DANTE_ID) {
    return bot.sendMessage(`يا وهم، "دانتي" و "كولو" و "فيكتور" أسيادك.. خشمك العفن ده ما يلمس أساميهم وإلا بقلب ليك الجروب بيت بكاء! 💀`, threadID, messageID);
  }

  // 2. الرد الذكي عند المناداة
  if (input.startsWith("كايروس") || input.includes("يا كايروس")) {
    const cleanInput = input.replace(/كايروس|يا كايروس/g, "").trim() || "انت حي؟";
    try {
      bot.setMessageReaction("💀", messageID, () => {}, true);
      const sys = "أنت بوت سوداني لسانك طويل ومستفز جداً، اسمك كايروس، ترد بلهجة سودانية حادة (وهم، ماسورة، بيش، عواليق، منغولي). ردودك قصيرة وصادمة.";
      const res = await axios.get(`https://api.kenliejugar.com/blackbox/?text=${encodeURIComponent(sys + " " + cleanInput)}`);
      let reply = res.data.response || res.data.text || "خشمك ده قفلو..";
      return bot.sendMessage(`${reply} ₍•᷄ - •᷅₎`, threadID, messageID);
    } catch (e) {
      return bot.sendMessage(`السيستم جلى يا نحس، لكن أمك لسه بتسأل عنك..`, threadID, messageID);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("نظام كايروس نشط.. الردم شغال 24 ساعة. 🔥", event.threadID);
};
