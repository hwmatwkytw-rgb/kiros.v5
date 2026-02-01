module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  return async function ({ event }) {
    const dateNow = Date.now();
    const time = moment.tz("Asia/Manila").format("HH:MM:ss DD/MM/YYYY");
    const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly, YASSIN } = global.config;

    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;
    
    var { body, senderID, threadID, messageID } = event;

    senderID = String(senderID);
    threadID = String(threadID);

    const adminID = "61581906898524"; // أيدي المطور الخاص بك

    /* ================= وضع الصيانة ================= */
    if (global.config.maintenanceMode === true && senderID !== adminID) {
      return; 
    }
    /* ============================================= */

    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : (global.config.PREFIX || '/');

    // --- [ بداية منطق البادئة المدمج ] ---
    if (body) {
      const rawBody = body.trim().split(/ +/);
      const firstWord = rawBody[0].toLowerCase();
      const newPrefix = rawBody[1];

      // للمطور: تغيير البادئة (بدون بادئة قبل الكلمة)
      if ((firstWord === "بادئة" || firstWord === "prefix") && senderID === adminID) {
        if (!newPrefix) return api.sendMessage("⚠️ يرجى كتابة البادئة الجديدة بعد الكلمة.\nمثال: بادئة #", threadID, messageID);
        
        threadSetting["PREFIX"] = newPrefix;
        await Threads.setData(threadID, { data: threadSetting });
        global.data.threadData.set(threadID, threadSetting);

        const botID = api.getCurrentUserID();
        api.changeNickname(`[ ${newPrefix} ] • ${global.config.BOTNAME || "كايـࢪوس"}`, threadID, botID);

        return api.sendMessage(`✅ تم تغيير البادئة إلى: [ ${newPrefix} ]\nتم تحديث كنية البوت وإجبار التعامل مع الرمز الجديد.`, threadID, messageID);
      }

      // للمستخدم العادي: عرض البادئة فقط
      if ((firstWord === "بادئة" || firstWord === "prefix") && !body.startsWith(prefix)) {
        return api.sendMessage(`⦿ البادئة الحالية لهذه المجموعة هي: [ ${prefix} ]`, threadID, messageID);
      }
    }
    // --- [ نهاية منطق البادئة المدمج ] ---

    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);
    if (!body) return;
    const [matchedPrefix] = body.match(prefixRegex) || [null];
    if (!matchedPrefix) return; 
    
    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);
    
    if (YASSIN === "true" && !ADMINBOT.includes(senderID)) return;
    
    if (!command) {
      var allCommandName = [];
      const commandValues = commands.keys();
      for (const cmd of commandValues) allCommandName.push(cmd);
      const checker = stringSimilarity.findBestMatch(commandName, allCommandName);

      if (checker.bestMatch.rating >= 0.8) {
        command = commands.get(checker.bestMatch.target);
      } else {
        return api.setMessageReaction("🦧", messageID, (err) => {}, true);
      }
    }

    if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox === false && senderID == threadID)) {
      if (!ADMINBOT.includes(senderID) && senderID !== adminID) {
        if (userBanned.has(senderID)) {
          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID);
        } else if (threadBanned.has(threadID)) {
          const { reason, dateAdded } = threadBanned.get(threadID) || {};
          return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID);
        }
      }
    }

    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID) && senderID !== adminID) {
        const banThreads = commandBanned.get(threadID) || [];
        const banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name)) {
          return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID);
        } else if (banUsers.includes(command.config.name)) {
          return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID);
        }
      }
    }

    if (command.config.commandCategory.toLowerCase() == "nsfw" &&
      !global.data.threadAllowNSFW.includes(threadID) &&
      !ADMINBOT.includes(senderID)) {
      return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID);
    }

    var permssion = 0;
    const threadInfoo = threadInfo.get(threadID) || await Threads.getInfo(threadID);
    const find = threadInfoo.adminIDs.find((el) => el.id == senderID);
    if (ADMINBOT.includes(senderID.toString()) || senderID === adminID) permssion = 2;
    else if (find) permssion = 1;

    if (command.config.hasPermssion > permssion) {
      return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), event.threadID);
    }

    if (!client.cooldowns.has(command.config.name)) {
      client.cooldowns.set(command.config.name, new Map());
    }
    const timestamps = client.cooldowns.get(command.config.name);
    const expirationTime = (command.config.cooldowns || 1) * 1000;
    if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime) {
      return; 
    }

    var getText2;
    if (command.languages && typeof command.languages == "object" &&
      command.languages.hasOwnProperty(global.config.language)) {
      getText2 = (...values) => {
        var lang = command.languages[global.config.language][values[0]] || "";
        for (var i = values.length - 1; i > 0; i--) {
          const expReg = RegExp("%" + i, "g");
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    } else {
      getText2 = () => {};
    }

    try {
      const Obj = { api, event, args, models, Users, Threads, Currencies, permssion, getText: getText2 };
      command.run(Obj);
      timestamps.set(senderID, dateNow);
      if (DeveloperMode) {
        logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), Date.now() - dateNow), "[ DEV MODE ]");
      }
      return;
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }
  };
};
