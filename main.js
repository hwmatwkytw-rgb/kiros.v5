const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const logger = require("./utils/log.js");
const login = require('@dongdev/fca-unofficial');
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;

// ======================
// 🔧 Global Objects
// ======================
global.client = new Object({
  'commands': new Map(),
  'events': new Map(),
  'cooldowns': new Map(),
  'eventRegistered': new Array(),
  'handleSchedule': new Array(),
  'handleReaction': new Array(),
  'handleReply': new Array(),
  'mainPath': process.cwd(),
  'configPath': new String(),
  'getTime': function(timeType) {
    switch (timeType) {
      case 'seconds':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('ss');
      case 'minutes':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('mm');
      case 'hours':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('HH');
      case 'date':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('DD');
      case 'month':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('MM');
      case 'year':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('YYYY');
      case 'fullHour':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('HH:mm:ss');
      case 'fullDate':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('DD/MM/YYYY');
      case 'fullTime':
        return '' + moment.tz("Asia/Ho_Chi_minh").format('HH:mm:ss DD/MM/YYYY');
    }
  }
});

global.data = new Object({
  'threadInfo': new Map(),
  'threadData': new Map(),
  'userName': new Map(),
  'userBanned': new Map(),
  'threadBanned': new Map(),
  'commandBanned': new Map(),
  'threadAllowNSFW': new Array(),
  'allUserID': new Array(),
  'allCurrenciesID': new Array(),
  'allThreadID': new Array()
});

global.nodemodule = require("./nodemodules");
global.configModule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

var configValue;

try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
} catch {
  if (existsSync(global.client.configPath.replace(/\.json/g, '') + '.temp')) {
    configValue = readFileSync(global.client.configPath.replace(/\.json/g, '') + '.temp');
    configValue = JSON.parse(configValue);
    logger.loader('Found: ' + (global.client.configPath.replace(/\.json/g, '') + '.temp'));
  }
}

try {
  for (const key in configValue) global.config[key] = configValue[key];
} catch {
  logger.loader("Can't load file config!", "ERROR");
}

const { Sequelize, sequelize } = require("./includes/database");
writeFileSync(global.client.configPath + '.temp', JSON.stringify(global.config, null, 4), 'utf8');

// ======================
// 🌐 Language
// ======================
const langFile = readFileSync(__dirname + "/languages/" + (global.config.language || 'en') + '.lang', { 'encoding': 'utf-8' }).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');

for (const item of langData) {
  const getSeparator = item.indexOf('=');
  const itemKey = item.slice(0, getSeparator);
  const itemValue = item.slice(getSeparator + 1, item.length);
  const head = itemKey.slice(0, itemKey.indexOf('.'));
  const key = itemKey.replace(head + '.', '');
  const value = itemValue.replace(/\\n/gi, '\n');

  if (typeof global.language[head] == "undefined") global.language[head] = new Object();
  global.language[head][key] = value;
}

global.getText = function(...args) {
  const langObj = global.language;

  if (!langObj.hasOwnProperty(args[0]))
    throw __filename + " - Not found key language: " + args[0];

  var text = langObj[args[0]][args[1]];

  for (var i = args.length - 1; i > 0; i--) {
    const regExp = new RegExp('%' + i, 'g');
    text = text.replace(regExp, args[i + 1]);
  }
  return text;
};

// ======================
// 📱 AppState
// ======================
try {
  var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
  var appState = require(appStateFile);
} catch {
  return logger.loader(global.getText('notFoundPathAppstate', 'errorFormat'), "ERROR");
}

// ======================
// 🤖 Bot Main Function
// ======================
function onBot({ models }) {
  login({ appState: appState }, async (err, api) => {
    if (err) return logger(JSON.stringify(err), 'ERROR');

    api.setOptions(global.config.FCAOption);
    global.client.api = api;
    global.config.version = "1.2.14";
    global.client.timeStart = new Date().now();

    api.sendMessage("✅. تـم تـشـغـيـل سـيـكـو ☠️🩸", global.config.ADMINBOT[0], (sendErr) => {
      if (sendErr) logger("فشل إرسال إشعار تشغيل البوت: " + JSON.stringify(sendErr), "ERROR");
      else logger("تم إرسال إشعار تشغيل البوت", "INFO");
    });

    // ======================
    // 📂 Load Commands
    // ======================
    (function() {
      const commandFiles = readdirSync(global.client.mainPath + "/modules/commands/").filter(file => file.endsWith('.js') && !file.includes('example') && !global.config.commandDisabled.includes(file));

      for (const file of commandFiles) {
        try {
          var command = require(global.client.mainPath + "/modules/commands/" + file);

          if (!command.config || !command.run || !command.config.name)
            throw new Error(global.getText('loader', 'nameExist'));

          if (global.client.commands.has(command.config.name || ''))
            throw new Error(global.getText('loader', 'nameExist'));

          if (command.config.dependencies && typeof command.config.dependencies == "object") {
            for (const dependency in command.config.dependencies) {
              const depPath = join(__dirname, 'nodemodules', 'node_modules', dependency);

              try {
                if (!global.nodemodule.hasOwnProperty(dependency)) {
                  if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency))
                    global.nodemodule[dependency] = require(dependency);
                  else
                    global.nodemodule[dependency] = require(depPath);
                }
              } catch {
                logger.loader(global.getText('loader', 'notFoundPackage', dependency, command.config.name), 'warn');
                execSync('npm --package-lock false --save install ' + dependency + (command.config.dependencies[dependency] == '*' || command.config.dependencies[dependency] == '' ? '' : '@' + command.config.dependencies[dependency]), { 'stdio': 'inherit', 'env': process.env, 'shell': true, 'cwd': join(__dirname, 'nodemodules') });

                for (let retry = 1; retry <= 3; retry++) {
                  try {
                    require.cache = {};
                    if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency))
                      global.nodemodule[dependency] = require(dependency);
                    else
                      global.nodemodule[dependency] = require(depPath);
                    break;
                  } catch (e) { }
                }
              }
            }
          }

          if (command.config.envConfig) {
            for (const envKey in command.config.envConfig) {
              if (typeof global.configModule[command.config.name] == "undefined")
                global.configModule[command.config.name] = {};

              if (typeof global.config[command.config.name] == "undefined")
                global.config[command.config.name] = {};

              if (typeof global.config[command.config.name][envKey] != "undefined")
                global.configModule[command.config.name][envKey] = global.config[command.config.name][envKey];
              else
                global.configModule[command.config.name][envKey] = command.config.envConfig[envKey] || '';

              if (typeof global.config[command.config.name][envKey] == "undefined")
                global.config[command.config.name][envKey] = command.config.envConfig[envKey] || '';
            }
          }

          if (command.onLoad) {
            const onLoadObj = { 'api': api, 'models': models };
            command.onLoad(onLoadObj);
          }

          if (command.handleEvent)
            global.client.eventRegistered.push(command.config.name);

          global.client.commands.set(command.config.name, command);
        } catch (err) { }
      }
    })();

    // ======================
    // 📂 Load Events
    // ======================
    (function() {
      const eventFiles = readdirSync(global.client.mainPath + '/modules/events').filter(file => file.endsWith('.js') && !global.config.eventDisabled.includes(file));

      for (const file of eventFiles) {
        try {
          var event = require(global.client.mainPath + '/modules/events/' + file);

          if (!event.config || !event.run)
            throw new Error(global.getText('loader', 'nameExist'));

          if (global.client.events.has(event.config.name || ''))
            throw new Error(global.getText('loader', 'nameExist'));

          if (event.config.dependencies && typeof event.config.dependencies == "object") {
            for (const dependency in event.config.dependencies) {
              const depPath = join(__dirname, 'nodemodules', 'node_modules', dependency);

              try {
                if (!global.nodemodule.hasOwnProperty(dependency)) {
                  if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency))
                    global.nodemodule[dependency] = require(dependency);
                  else
                    global.nodemodule[dependency] = require(depPath);
                }
              } catch {
                logger.loader(global.getText('loader', 'notFoundPackage', dependency, event.config.name), 'warn');
                execSync('npm --package-lock false --save install ' + dependency + (event.config.dependencies[dependency] == '*' || event.config.dependencies[dependency] == '' ? '' : '@' + event.config.dependencies[dependency]), { 'stdio': 'inherit', 'env': process.env, 'shell': true, 'cwd': join(__dirname, 'nodemodules') });

                for (let retry = 1; retry <= 3; retry++) {
                  try {
                    require.cache = {};
                    if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency))
                      global.nodemodule[dependency] = require(dependency);
                    else
                      global.nodemodule[dependency] = require(depPath);
                    break;
                  } catch (e) { }
                }
              }
            }
          }

          if (event.config.envConfig) {
            for (const envKey in event.config.envConfig) {
              if (typeof global.configModule[event.config.name] == "undefined")
                global.configModule[event.config.name] = {};

              if (typeof global.config[event.config.name] == "undefined")
                global.config[event.config.name] = {};

              if (typeof global.config[event.config.name][envKey] != "undefined")
                global.configModule[event.config.name][envKey] = global.config[event.config.name][envKey];
              else
                global.configModule[event.config.name][envKey] = event.config.envConfig[envKey] || '';

              if (typeof global.config[event.config.name][envKey] == "undefined")
                global.config[event.config.name][envKey] = event.config.envConfig[envKey] || '';
            }
          }

          if (event.onLoad) {
            const onLoadObj = { 'api': api, 'models': models };
            event.onLoad(onLoadObj);
          }

          global.client.events.set(event.config.name, event);
        } catch (err) { }
      }
    })();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.loader(global.getText('loader', 'finishLoadModule', global.client.commands.size, global.client.events.size));
    logger.loader("Thời gian khởi động: " + ((Date.now() - global.client.timeStart) / 1000).toFixed() + 's');
    logger.loader('===== [ ' + (Date.now() - global.client.timeStart) + 'ms ] =====');

    writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf-8');
    unlinkSync(global.client.configPath + '.temp');

    const listenOptions = { 'api': api, 'models': models };
    const handleListen = require("./includes/listen")(listenOptions);

    function listenerCallback(err, message) {
      if (err) return logger(global.getText('notFoundPathAppstate', 'errorFormat', JSON.stringify(err)), "ERROR");

      if (["presence", "read_receipt", "typ"].includes(message.type)) return;

      if (global.config.DeveloperMode == true) console.log(message);

      return handleListen(message);
    }

    global.handleListen = api.listenMqtt(listenerCallback);
  });
}

// ======================
// 🗄️ Database
// ======================
(async () => {
  try {
    global.client.loggedMongoose = true;
    const { Model, DataTypes, Sequelize } = require('sequelize');
    const sequelizeDB = new Sequelize({ 'dialect': 'sqlite', 'host': join(__dirname, '/includes/data.sqlite'), 'logging': false });

    class modelAntiSt extends Model { }
    modelAntiSt.init({
      'threadID': { 'type': DataTypes.STRING, 'primaryKey': true },
      'data': { 'type': DataTypes.JSON, 'defaultValue': {} }
    }, { 'sequelize': sequelizeDB, 'modelName': 'antists' });

    modelAntiSt.findOneAndUpdate = async function(query, update) {
      const item = await this.findOne({ 'where': query });
      if (!item) return null;
      Object.keys(update).forEach(key => item[key] = update[key]);
      return await item.save();
    };

    global.modelAntiSt = modelAntiSt;
    await sequelizeDB.sync({ 'force': false });
  } catch (err) {
    global.client.loggedMongoose = false;
    logger.loader("Không thể kết nối dữ liệu ANTI SETTING", "ERROR");
    console.log(err);
  }

  await sequelize.sync();
  const dbModels = { 'Sequelize': Sequelize, 'sequelize': sequelize };
  const models = require("./includes/database/model")(dbModels);

  console.log("[ CONNECT ]");
  const botOptions = { 'models': models };
  onBot(botOptions);
})();

// ======================
// 🌐 Express Server
// ======================
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const botURL = 'https://bot-cww1.onrender.com';

function pingUrl(url) {
  const protocol = url.startsWith('https') ? https : http;
  protocol.get(url, (res) => {
    console.log('Ping sent to bot');
  }).on('error', (err) => {
    console.log('Error pinging bot: ' + err.message);
  });
}

setInterval(() => {
  pingUrl(botURL);
}, 40 * 1000);

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'index.html');

  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('index.html not found');
    }
    res.send(data);
  });
});

process.on('unhandledRejection', (reason, promise) => { });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
