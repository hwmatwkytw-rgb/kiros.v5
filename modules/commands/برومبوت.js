const axios = require('axios');
const crypto = require("crypto");

module.exports.config = {
  name: "برومبوت",
  version: "1.7.0",
  hasPermssion: 0,
  credits: "ڪايࢪوس",
  description: "استخراج وصف الصورة مباشرة",
  commandCategory: "الذكاء الصناعي",
  usages: "[رد على صورة]",
  cooldowns: 10
};

async function startSession(imgUrl) {
  let sessionID = crypto.randomBytes(4).toString("hex").toUpperCase();
  let data = JSON.stringify({
    data: [null, null, imgUrl, 0.3, 0.85, "threshold", 25, 10, false, false],
    event_data: null, fn_index: 2, trigger_id: 26, session_hash: sessionID
  });

  const response = await axios.post('https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/join', data, {
    headers: { 'Content-Type': 'application/json' }
  });
  return { data: response.data, sessionID };
}

async function getResult(sessionID) {
  const res = await axios.get(`https://pixai-labs-pixai-tagger-demo.hf.space/gradio_api/queue/data?session_hash=${sessionID}`);
  return res.data;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  let imageUrl = event.type === "message_reply" ? event.messageReply.attachments[0]?.url : event.attachments[0]?.url;

  if (!imageUrl) return;

  api.setMessageReaction("⏳", messageID, () => {}, true);
  
  try {
    const session = await startSession(imageUrl);
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    const data = await getResult(session.sessionID);

    const match = data.match(/"output":\{"data":\["([^"]+)","([^"]+)","([^"]+)"/);
    
    if (match) {
      const prompt = match[1].replace(/\\n/g, "\n");
      const character = (match[2] && match[2] !== '—') ? match[2] : "Unknown"; 
      const series = (match[3] && match[3] !== '—') ? match[3] : "Unknown"; 

      const result = `Series: ${series}\nCharacter: ${character}\n\n${prompt}`;

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(result, threadID, messageID);
    }
  } catch (error) {
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};
