const axios = require('axios');
const crypto = require("crypto");

module.exports.config = {
  name: "برومبوت",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "استخراج وصف (Prompt) الصورة وتحليلها مع حواف هندسية",
  commandCategory: "الذكاء الصناعي",
  usages: "[رد على صورة]",
  cooldowns: 10
};

// --- وظائف الـ API الخاصة بالاستخراج ---
async function startSession(imgUrl) {
  let sessionID = crypto.randomBytes(4).toString("hex").toUpperCase();
  let data = JSON.stringify({
    data: [null, null, imgUrl, 0.3, 0.85, "threshold", 25, 10, false, false],
    event_data: null, fn_index: 2, trigger_id: 26, session_hash: sessionID
  });

  return {
    data: (await axios.post('https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/join', data, {
      headers: { 'Content-Type': 'application/json' }
    })).data,
    sessionID
  };
}

async function getResult(sessionID) {
  const res = await axios.get(`https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/data?session_hash=${sessionID}`);
  return res.data;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  
  let imageUrl = event.type === "message_reply" ? event.messageReply.attachments[0]?.url : event.attachments[0]?.url;

  if (!imageUrl) {
    return api.sendMessage(
      "┌──────────────┐\n" +
      "│  ⚠️ يرجى الرد على صورة  │\n" +
      "└──────────────┘", 
      threadID, messageID
    );
  }

  api.setMessageReaction("🔍", messageID, () => {}, true);
  
  const loadingMsg = await new Promise(res => api.sendMessage(
    "┌─── [ ⚙︎ LOADING ] ───┐\n" +
    "│ جاري تحليل بيانات الصورة │\n" +
    "└──────────────────┘", 
    threadID, (err, info) => res(info)));

  try {
    const session = await startSession(imageUrl);
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    const data = await getResult(session.sessionID);

    const match = data.match(/"output":\{"data":\["([^"]+)","([^"]+)","([^"]+)"/);
    
    if (match) {
      const prompt = match[1];            
      const character = (match[2] && match[2] !== '—') ? match[2] : "Unknown"; 
      const series = (match[3] && match[3] !== '—') ? match[3] : "Unknown"; 

      const result = 
        `┌──── • 💠 بـرومـبـوت 💠 • ────┐\n` +
        `│ 🎬 السلسلة: ${series}\n` +
        `│ 👤 الشخصية: ${character}\n` +
        `├───────────────────\n` +
        `│ 📝 الـوصـف (PROMPT):\n` +
        `│\n` +
        `│ ${prompt}\n` +
        `│\n` +
        `├───────────────────\n` +
        `│ ⚙︎ ڪايࢪوس ͡🦋͜ 𝑩𝑶𝑻\n` +
        `└───────────────────┘`;

      api.unsendMessage(loadingMsg.messageID);
      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(result, threadID, messageID);
    } else {
      throw new Error("Analysis failed");
    }

  } catch (error) {
    api.unsendMessage(loadingMsg.messageID);
    api.setMessageReaction("❌", messageID, () => {}, true);
    return api.sendMessage(
      "┌─── [ ⚠️ ERROR ] ───┐\n" +
      "│ تعذر العثور على برومبت  │\n" +
      "└──────────────────┘", 
      threadID, messageID
    );
  }
};
