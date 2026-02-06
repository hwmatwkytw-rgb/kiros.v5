// نظام الفلترة الصارمة خارج نطاق الدالة لضمان استمراريته أثناء تشغيل الملف
if (!global.processedMessages) {
  global.processedMessages = new Set();
}
const MAX_CACHE_SIZE = 50; // حفظ آخر 50 رسالة لمنع التكرار

module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const { body, senderID, threadID, messageID } = event;

    /* ================= الفلترة الصارمة للتكرار (Render Fix) ================= */
    if (global.processedMessages.has(messageID)) {
      return; // تجاهل الرسالة إذا تمت معالجتها من نسخة أخرى
    }
    global.processedMessages.add(messageID);

    // تنظيف الذاكرة المؤقتة دورياً
    if (global.processedMessages.size > MAX_CACHE_SIZE) {
      const firstItem = global.processedMessages.values().next().value;
      global.processedMessages.delete(firstItem);
    }
    /* ===================================================================== */

    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:MM:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, YASSIN } = global.config;

    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;
    
    var senderIDStr = String(senderID);
    var threadIDStr = String(threadID);

    const adminID = "61581906898524"; 

    /* وضع الصيانة */
    if (global.config.maintenanceMode === true && senderIDStr !== adminID) {
      return; 
    }

    const threadSetting = threadData.get(threadIDStr) || {};
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : (global.config.PREFIX || "/");

    /* منطق البادئة المطور */
    if (body) {
      const rawBody = body.trim().split(/ +/);
      const firstWord = rawBody[0].toLowerCase();
      const argsPrefix = rawBody.slice(1);

      if (firstWord === "prefix" || firstWord === "بادئة") {
        if (senderIDStr === adminID) {
          let newPrefix = argsPrefix[0];
          if (!newPrefix || newPrefix.toLowerCase() === "off") newPrefix = ""; 

          threadSetting["PREFIX"] = newPrefix;
          await Threads.setData(threadIDStr, { data: threadSetting });
          global.data.threadData.set(threadIDStr, threadSetting);

          const botID = api.getCurrentUserID();
          const nickName = newPrefix === "" ? "[ No Prefix ] " + (global.config.BOTNAME || "") : "[ " + newPrefix + " ] " + (global.config.BOTNAME || "");
          api.changeNickname(nickName, threadIDStr, botID);

          return api.sendMessage("تم تغيير البادئة: " + (newPrefix === "" ? "بدون بادئة" : newPrefix), threadIDStr, messageID);
        } else {
          return api.sendMessage("البادئة الحالية: " + (prefix === "" ? "بدون" : prefix), threadIDStr, messageID);
        }
      }
    }

    const prefixRegex = new RegExp(`^(<@!?${senderIDStr}>|${escapeRegex(prefix)})\\s*`);
    if (!body) return;
    const [matchedPrefix] = body.match(prefixRegex) || [null];
    if (!matchedPrefix) return; 
    
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);
    
    if (YASSIN === "true" && !ADMINBOT.includes(senderIDStr)) return;
    
    if (!command) {
      var allCommandName = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
      if (checker.bestMatch.rating >= 0.8) {
        command = commands.get(checker.bestMatch.target);
      } else {
        return api.setMessageReaction("🦧", messageID, (err) => {}, true);
      }
    }

    /* فحص الحظر */
    if (userBanned.has(senderIDStr) || threadBanned.has(threadIDStr)) {
      if (!ADMINBOT.includes(senderIDStr) && senderIDStr !== adminID) return;
    }

    /* فحص الصلاحيات */
    var permssion = 0;
    const threadInfoo = threadInfo.get(threadIDStr) || await Threads.getInfo(threadIDStr);
    const find = threadInfoo.adminIDs.find((el) => el.id == senderIDStr);
    if (ADMINBOT.includes(senderIDStr) || senderIDStr === adminID) permssion = 2;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion) {
      return api.sendMessage("صلاحياتك لا تسمح بهذا الأمر", threadIDStr);
    }

    /* الكول داون */
    if (!client.cooldowns.has(command.config.name)) {
      client.cooldowns.set(command.config.name, new Map());
    }
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderIDStr) && dateNow < timestamps.get(senderIDStr) + expirationTime) return;

    try {
      const Obj = { api, event, args, models, Users, Threads, Currencies, permssion, getText: (typeof command.getText === 'function' ? command.getText : () => {}) };
      command.run(Obj);
      timestamps.set(senderIDStr, dateNow);
      return;
    } catch (e) {
      return api.sendMessage("خطأ: " + e.message, threadIDStr);
    }
  };
};
