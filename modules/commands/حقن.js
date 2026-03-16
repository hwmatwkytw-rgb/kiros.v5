const axios = require('axios');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const { resolve } = require("path");

module.exports.config = {
  name: "حقن",
  version: "1.2.5",
  hasPermssion: 2,
  credits: "DANTE",
  description: "حقن أكواد من روابط خارجية أو تصدير ملفات النظام",
  commandCategory: "المطور",
  usages: "[اسم الملف] (بالرد على رابط)",
  cooldowns: 0,
  dependencies: {
      "pastebin-api": "",
      "cheerio": "",
      "request": "",
      "fs-extra": "",
      "axios": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { senderID, threadID, messageID, messageReply, type } = event;
  const devID = "61581906898524";

  // حماية المطور DANTE
  if (senderID !== devID) {
      api.setMessageReaction("⚠️", messageID, () => {}, true);
      return api.sendMessage("╮──⎯  「 تـنـبـيـه 」\n│ عذراً، هذا البروتوكول خاص بـ DANTE فقط.\n╯───────⎯  ◇  ⎯───────◈", threadID, messageID);
  }

  var name = args[0];
  var text = (type == "message_reply") ? messageReply.body : "";

  if (!text && !name) {
      return api.sendMessage("╮──⎯  「 تـوجيه 」\n│ • للحقن: قم بالرد على رابط واكتب اسم الملف.\n│ • للتصدير: اكتب اسم الملف المراد رفعه.\n╯───────⎯  ◇  ⎯───────◈", threadID, messageID);
  }

  // --- عملية التصدير (الرفع لـ Pastebin) ---
  if (!text && name) {
      api.setMessageReaction("📤", messageID, () => {}, true);
      fs.readFile(`${__dirname}/${name}.js`, "utf-8", async (err, data) => {
          if (err) return api.sendMessage(`╮──⎯  「 خـطأ 」\n│ الملف [${name}.js] غير موجود في النظام.\n╯───────⎯  ◇  ⎯───────◈`, threadID, messageID);
          
          const { PasteClient } = require('pastebin-api');
          const client = new PasteClient("R02n6-lNPJqKQCd5VtL4bKPjuK6ARhHb"); 
          
          try {
              const url = await client.createPaste({
                  code: data,
                  expireDate: 'N',
                  format: "javascript",
                  name: name,
                  publicity: 1
              });
              var rawLink = 'https://pastebin.com/raw/' + url.split('/')[3];
              api.sendMessage(`╮──⎯  「 تـم الـتـصدير 」\n│ تم رفع الكود بنجاح:\n│ ${rawLink}\n╯───────⎯  ◇  ⎯───────◈`, threadID, messageID);
          } catch (e) {
              api.sendMessage("❌ فشل الاتصال بخادم Pastebin.", threadID, messageID);
          }
      });
      return;
  }

  // --- عملية الحقن (تحميل وتطبيق الكود) ---
  var urlR = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  var url = text.match(urlR);
  
  if (!url) return api.sendMessage("❌ الرابط المرفق غير صالح للحقن.", threadID, messageID);
  api.setMessageReaction("💉", messageID, () => {}, true);

  // حقن من Pastebin
  if (url[0].indexOf('pastebin') !== -1) {
      axios.get(url[0].replace('pastebin.com/', 'pastebin.com/raw/')).then(res => {
          fs.writeFile(`${__dirname}/${name}.js`, res.data, "utf-8", function (err) {
              if (err) return api.sendMessage("❌ فشل حقن الكود في الملف.", threadID, messageID);
              api.sendMessage(`╮──⎯  「 تـم الـحقن 」\n│ تم حقن الكود في: ${name}.js\n│ نفذ (رست تحديث) لتفعيل التغييرات.\n╯───────⎯  ◇  ⎯───────◈`, threadID, messageID);
          });
      });
  }
  // حقن من Buildtool
  else if (url[0].indexOf('buildtool') !== -1 || url[0].indexOf('tinyurl.com') !== -1) {
      request({ method: 'GET', url: url[0] }, function (error, response, body) {
          if (error) return api.sendMessage("❌ خطأ في الوصول لمصدر الكود.", threadID, messageID);
          const $ = cheerio.load(body);
          $('.language-js').each((index, el) => {
              if (index !== 0) return;
              var code = el.children[0].data;
              fs.writeFile(`${__dirname}/${name}.js`, code, "utf-8", function (err) {
                  if (err) return api.sendMessage("❌ فشل تحديث الملف.", threadID, messageID);
                  api.sendMessage(`✅ تم حقن الكود الجديد في [${name}.js]`, threadID, messageID);
              });
          });
      });
  }
  // حقن من Google Drive
  else if (url[0].indexOf('drive.google') !== -1) {
      var id = url[0].match(/[-\w]{25,}/);
      const path = resolve(__dirname, `${name}.js`);
      try {
          const res = await axios.get(`https://drive.google.com/u/0/uc?id=${id}&export=download`, { responseType: "arraybuffer" });
          fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
          api.sendMessage(`✅ تم سحب الملف من الدرايف وحقنه في [${name}.js]`, threadID, messageID);
      } catch (e) {
          api.sendMessage("❌ فشل سحب البيانات من Google Drive.", threadID, messageID);
      }
  } else {
      api.sendMessage("❌ المصدر المذكور غير مدعوم في بروتوكول الحقن.", threadID, messageID);
  }
};
