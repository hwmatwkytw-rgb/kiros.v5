const axios = require("axios");

module.exports.config = {
  name: "كايروس",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "DANTE SPARDA",
  description: "ردم سوداني مباشر بدون استايل أو حواف",
  commandCategory: "الخدمات",
  usages: "[الرسالة]",
  cooldowns: 2,
  usePrefix: false 
};

const conversations = new Map();

const systemPrompt = {
  role: "system",
  content: `
أنت "كايروس"، بوت سوداني قاسي وحريف لسان.
- الشخصية: رادم، شليق، فخم، ردم عائلي (أبوك، أمك، أختك، جدك).
- القاموس: يا وهم، يا ماسورة، يا مكنة صاجمة، يا فارة، يا كج، لِف، فارق، حنكك بيش.
- الشروط: ممنوع الفصحى، ممنوع الاعتذار، ممنوع الايموجيات الملونة نهائياً.
- الرموز المسموحة: ヽʕ ᵕ᷄-ᵕ᷅ʔノ، (•֊• )، ₍•᷄ - •᷅₎.
- الردود: ردم سوداني صرف وقوي جداً.
`
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, body, senderID } = event;
    if (!body || senderID === api.getCurrentUserID()) return;
    
    const triggerWords = ["يا", "انت", "روبوت", "كايروس", "البوت", "وهم"];
    const isTrigger = triggerWords.some(word => body.toLowerCase().includes(word));

    if (isTrigger) {
        this.run({ api, event, args: body.split(" ") });
    }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const question = args.join(" ").trim();

  if (!question) return;

  try {
    if (!conversations.has(senderID)) conversations.set(senderID, [systemPrompt]);
    const history = conversations.get(senderID);
    history.push({ role: "user", content: question });

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let formData = 
      `--${boundary}\r\nContent-Disposition: form-data; name="chat_style"\r\n\r\nchat\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="chatHistory"\r\n\r\n${JSON.stringify(history)}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nstandard\r\n` +
      `--${boundary}--\r\n`;

    const response = await axios.post("https://api.deepai.org/hacking_is_a_serious_crime", formData, {
      headers: { "content-type": `multipart/form-data; boundary=${boundary}`, "user-agent": "Mozilla/5.0" }
    });

    let reply = response.data.output || "أبوك ما علمك إنو السكات سمح؟ ₍•᷄ - •᷅₎";
    
    history.push({ role: "assistant", content: reply });
    
    // إرسال الرد كنص مباشر بدون أي زخرفة أو حواف
    return api.sendMessage(reply.trim(), threadID, messageID);

  } catch (error) {
    return api.sendMessage("السيستم جاط من برادتك دي، فارقني ₍•᷄ - •᷅₎", threadID, messageID);
  }
};
