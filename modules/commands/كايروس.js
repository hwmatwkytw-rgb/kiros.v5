export const config = {
  name: "كايروس",
  permissions: [0],
  cooldown: 3,
  credits: "DANTE SPARDA",
  extra: {
    hide: false,
    usage: "كايروس [نبحك هنا]"
  },
  aliases: ["ai", "gpt", "ردم"],
  description: "ذكاء اصطناعي سوداني قاصف للجبهات ومستفز"
};

const conversations = new Map();

const systemPrompt = {
  role: "system",
  content: `
أنت الآن "كايروس"، بوت سوداني لسانك طويل، قاصف جبهات، ومستفز لأبعد الحدود.
شخصيتك:
- ملك الردم والحنك العاضي.
- أي زول يكلمك حسسه إنه وهم وماسورة.
- لو زول قال "كايروس غادر" أو "اطلع"، قوله: "الجروب حق أمك؟" أو "أطلع لى في الهايكوست لو راجل".
- استخدم كلمات: (يا وهم، يا ماسورة، يا عواليق، يا بيش، يا منغولي، يا ماسورة مصدية).
- لو سألك سؤال غبي، رد عليه ببرود وردم تقيل.
- ردودك لازم تكون قصيرة، حريفة، وتنتهي بالإيموجيات دي حصراً: ₍ •\`-ʼ• ₎، ʕᵕ᷄-ᵕ᷅ʔ، ₍•᷄ - •᷅₎.
`
};

export async function onCall({ message, args }) {
  const axios = (await import("axios")).default;
  const userId = message.senderID;
  const question = args.join(" ").trim();
  const emojis = ["₍ •`-ʼ• ₎", "ʕᵕ᷄-ᵕ᷅ʔ", "₍•᷄ - •᷅₎"];
  const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

  if (question === "مسخ" || question === "reset") {
    conversations.delete(userId);
    return message.reply(`تم مسح الونسة يا وهم، هسي حتجي تنبح بشنو؟ ${randomEmoji()}`);
  }

  if (!question) {
    return message.reply(`أكتب حاجة يا عواليق، ولا صباعك ده مشلول؟ ${randomEmoji()}`);
  }

  try {
    if (!conversations.has(userId)) {
      conversations.set(userId, [systemPrompt]);
    }

    const history = conversations.get(userId);
    history.push({ role: "user", content: question });

    if (history.length > 25) history.splice(1, 2);

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let formData = "";
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="chat_style"\r\n\r\nchat\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="chatHistory"\r\n\r\n${JSON.stringify(history)}\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nstandard\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="hacker_is_stinky"\r\n\r\nvery_stinky\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="enabled_tools"\r\n\r\n[]\r\n--${boundary}--\r\n`;

    const response = await axios({
      method: "POST",
      url: "https://api.deepai.org/hacking_is_a_serious_crime",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        "origin": "https://deepai.org",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      data: formData
    });

    let reply = "";
    if (response.data) {
      reply = response.data.output || response.data.text || response.data;
    }

    reply = reply.replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
    if (!reply || reply.includes("DeepAI")) reply = "كلامك ده بيش وما عندي ليهو رد هسي ʕᵕ᷄-ᵕ᷅ʔ";

    // إضافة الإيموجي في النهاية
    const finalReply = `${reply} ${randomEmoji()}`;

    history.push({ role: "assistant", content: reply });
    const sent = await message.reply(finalReply);

    if (sent?.messageID) {
      sent.addReplyEvent({
        callback: async ({ message: replyMessage }) => {
          await handleContinue(replyMessage, userId, axios, randomEmoji);
        }
      }, 300000);
    }
  } catch (error) {
    message.reply(`السيستم جلى الرمية، غيّر وشك الفقر ده ₍•᷄ - •᷅₎`);
  }
}

async function handleContinue(message, userId, axios, randomEmoji) {
  const question = message.body.trim();
  if (!question) return;

  try {
    const history = conversations.get(userId) || [systemPrompt];
    history.push({ role: "user", content: question });

    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let formData = "";
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="chat_style"\r\n\r\nchat\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="chatHistory"\r\n\r\n${JSON.stringify(history)}\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nstandard\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="hacker_is_stinky"\r\n\r\nvery_stinky\r\n`;
    formData += `--${boundary}\r\nContent-Disposition: form-data; name="enabled_tools"\r\n\r\n[]\r\n--${boundary}--\r\n`;

    const response = await axios({
      method: "POST",
      url: "https://api.deepai.org/hacking_is_a_serious_crime",
      headers: { "content-type": `multipart/form-data; boundary=${boundary}`, "user-agent": "Mozilla/5.0" },
      data: formData
    });

    let reply = response.data.output || response.data.text || response.data;
    reply = reply.trim();
    
    const finalReply = `${reply} ${randomEmoji()}`;
    history.push({ role: "assistant", content: reply });

    const sent = await message.reply(finalReply);
    if (sent?.messageID) {
      sent.addReplyEvent({
        callback: async ({ message: replyMessage }) => {
          await handleContinue(replyMessage, userId, axios, randomEmoji);
        }
      }, 300000);
    }
  } catch (error) {
    message.reply(`خلاص يا ماسورة قفلنا ʕᵕ᷄-ᵕ᷅ʔ`);
  }
}
