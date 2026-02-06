/**
 * Clean Main File (Deobfuscated Version)
 * Bot Core Loader
 */

const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const axios = require("axios");
const { execSync } = require("child_process");
const login = require("@dongdev/fca-unofficial");
const logger = require("./utils/log.js");

// ===== GLOBAL CLIENT =====
global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleReply: [],
  handleReaction: [],
  handleSchedule: [],
  mainPath: process.cwd(),
  configPath: "",
  timeStart: Date.now(),

  getTime(type) {
    const tz = "Asia/Ho_Chi_Minh";
    switch (type) {
      case "seconds": return moment.tz(tz).format("ss");
      case "minutes": return moment.tz(tz).format("mm");
      case "hours": return moment.tz(tz).format("HH");
      case "date": return moment.tz(tz).format("DD");
      case "month": return moment.tz(tz).format("MM");
      case "year": return moment.tz(tz).format("YYYY");
      case "fullHour": return moment.tz(tz).format("HH:mm:ss");
      case "fullTime": return moment.tz(tz).format("HH:mm:ss DD/MM/YYYY");
    }
  }
};

// ===== GLOBAL DATA =====
global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map(),
  userBanned: new Map(),
  threadBanned: new Map(),
  commandBanned: new Map(),
  threadAllowNSFW: [],
  allUserID: [],
  allThreadID: []
};

// ===== LOAD CONFIG =====
try {
  global.client.configPath = path.join(global.client.mainPath, "config.json");
  global.config = require(global.client.configPath);
} catch (e) {
  console.error("❌ Can't load config.json");
  process.exit(1);
}

// ===== LANGUAGE =====
global.language = {};
const langFile = fs
  .readFileSync(
    path.join(__dirname, "languages", (global.config.language || "en") + ".lang"),
    "utf-8"
  )
  .split(/\r?\n/);

for (const line of langFile) {
  if (!line || line.startsWith("#")) continue;
  const [key, value] = line.split("=");
  const head = key.split(".")[0];
  const sub = key.replace(head + ".", "");

  if (!global.language[head]) global.language[head] = {};
  global.language[head][sub] = value.replace(/\\n/g, "\n");
}

global.getText = (head, key, ...args) => {
  let text = global.language[head]?.[key];
  if (!text) return `Missing lang: ${head}.${key}`;
  args.forEach((v, i) => {
    text = text.replace(new RegExp(`%${i + 1}`, "g"), v);
  });
  return text;
};

// ===== LOAD APPSTATE =====
let appState;
try {
  appState = require(
    path.resolve(
      path.join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json")
    )
  );
} catch {
  console.error("❌ appstate.json not found");
  process.exit(1);
}

// ===== BOT LOGIN =====
login({ appState }, (err, api) => {
  if (err) return console.error(err);

  api.setOptions(global.config.FCAOption || {});
  global.client.api = api;

  console.log("✅ Bot Logged In");
  api.sendMessage(
    "✅ تم تشغيل البوت بنجاح",
    global.config.ADMINBOT[0]
  );

  loadCommands();
  loadEvents();

  startListen(api);
  scheduleRestart();
});

// ===== ANTI DUPLICATE FILTER =====
const handledMessages = new Set();

// ===== LISTEN MQTT =====
function startListen(api) {
  api.listenMqtt((err, event) => {
    if (err) return;

    // تجاهل رسائل البوت نفسه
    if (event.senderID === api.getCurrentUserID()) return;

    // فلترة التكرار
    if (!event.messageID) return;
    if (handledMessages.has(event.messageID)) return;

    handledMessages.add(event.messageID);
    setTimeout(() => handledMessages.delete(event.messageID), 60000);

    // ===== MESSAGE HANDLER =====
    if (event.type === "message" || event.type === "message_reply") {
      require("./handler/message.js")(event);
    }

    // ===== EVENT HANDLER =====
    if (event.type === "event") {
      require("./handler/event.js")(event);
    }
  });
}

// ===== AUTO RESTART EVERY 24H =====
function scheduleRestart() {
  setTimeout(() => {
    console.log("🔄 Auto restart after 24h");
    process.exit(1);
  }, 24 * 60 * 60 * 1000);
}

// ===== LOAD COMMANDS =====
function loadCommands() {
  const cmdPath = path.join(global.client.mainPath, "modules", "commands");
  const files = fs.readdirSync(cmdPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const cmd = require(path.join(cmdPath, file));
      if (!cmd.config || !cmd.run) continue;

      global.client.commands.set(cmd.config.name, cmd);
      console.log("📦 Loaded Command:", cmd.config.name);
    } catch (e) {
      console.error("❌ Command Error:", file, e.message);
    }
  }
}

// ===== LOAD EVENTS =====
function loadEvents() {
  const evPath = path.join(global.client.mainPath, "modules", "events");
  const files = fs.readdirSync(evPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const ev = require(path.join(evPath, file));
      if (!ev.run) continue;

      global.client.events.set(ev.config.name, ev);
      console.log("⚡ Loaded Event:", ev.config.name);
    } catch (e) {
      console.error("❌ Event Error:", file, e.message);
    }
  }
    }
