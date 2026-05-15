const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require("fs-extra");
const { join, resolve } = require("path");
const { execSync } = require("child_process");
const axios = require("axios");
const express = require("express");
const http = require("http");
const https = require("https");

// استدعاء ملفات السجل والاتصال والـ FCA الخاص بالفيسبوك
const logger = require("./utils/log.js");
const login = require("@dongdev/fca-unofficial");
const { Sequelize, sequelize } = require("./includes/database");

const app = express();
const botURL = "https://bot-cww1.onrender.com"; // رابط البوت على ريندر للبقاء حياً

// قراءة حزم الاعتماديات والموديولات الأساسية
const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
const listbuiltinModules = require("module").builtinModules;

// إعداد الكائنات العالمية للبوت (Client & Data)
global.client = {
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    getTime: function (formatType) {
        switch (formatType) {
            case "seconds": return "" + moment.tz("Asia/Ho_Chi_minh").format("ss");
            case "minutes": return "" + moment.tz("Asia/Ho_Chi_minh").format("mm");
            case "hours":   return "" + moment.tz("Asia/Ho_Chi_minh").format("HH");
            case "date":    return "" + moment.tz("Asia/Ho_Chi_minh").format("DD");
            case "month":   return "" + moment.tz("Asia/Ho_Chi_minh").format("MM");
            case "year":    return "" + moment.tz("Asia/Ho_Chi_minh").format("YYYY");
            case "fullHour":return "" + moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss");
            case "fullYear":return "" + moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY");
            case "fullTime":return "" + moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY");
        }
    }
};

global.data = {
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
};

global.nodemodule = require("./utils");
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();

// تحميل وقراءة ملف الإعدادات config.json
let configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
} catch {
    if (existsSync(global.client.configPath.replace(/\.json/g, "") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g, "") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader("Found: " + (global.client.configPath.replace(/\.json/g, "") + ".temp"));
    }
}

try {
    for (const key in configValue) {
        global.config[key] = configValue[key];
    }
} catch {
    logger.loader("Can't load file config!", "error");
}

// إنشاء ملف إعدادات مؤقت لضمان عدم الضياع
writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), "utf8");

// تحميل ملفات اللغات وحفظها في الكائن العالمي global.language
const langFile = readFileSync(join(__dirname, "languages", (global.config.language || "en") + ".lang"), { encoding: "utf-8" }).split(/\r?\n|\r/);
const langData = langFile.filter(line => line.indexOf("#") !== 0 && line !== "");

for (const item of langData) {
    const separatorIndex = item.indexOf("=");
    const itemKey = item.slice(0, separatorIndex);
    const itemValue = item.slice(separatorIndex + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf("."));
    const key = itemKey.replace(head + ".", "");
    const value = itemValue.replace(/\\n/gi, "\n");

    if (typeof global.language[head] === "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

// دالة جلب النصوص المترجمة
global.getText = function (...args) {
    const langObject = global.language;
    if (!langObject.hasOwnProperty(args[0])) throw __filename + " - Not found key language: " + args[0];
    let text = langObject[args[0]][args[1]];
    
    for (let i = args.length - 1; i > 0; i--) {
        const reg = RegExp("%" + i, "g");
        text = text.replace(reg, args[i]);
    }
    return text;
};

// فحص وجود الـ Appstate
try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
} catch {
    return logger.loader(global.getText("mirai", "notFoundPathAppstate"), "error");
}

// بدء تشغيل البوت عند نجاح الاتصال
function onBot({ models }) {
    const loginOptions = { appState: appState };
    
    login(loginOptions, async (err, api) => {
        if (err) return logger(JSON.stringify(err), "ERROR");

        api.setOptions(global.config.FCAOption);
        global.client.api = api;
        global.config.version = "1.2.14";
        global.client.timeStart = new Date().getTime();

        // إرسال رسالة ترحيبية عند التشغيل بنجاح
        api.sendMessage("✅. تـم _ تـشـغـيـل _ سـيـكـو ☠️🩸", global.config.ADMINBOT[0], (error) => {
            if (error) logger("فشل إرسال إشعار تشغيل البوت: " + JSON.stringify(error), "ERROR");
            else logger("تم إرسال إشعار تشغيل البوت", "INFO");
        });

        // 1. تحميل الأوامر (Commands Launcher)
        (function () {
            const commandFiles = readdirSync(global.client.mainPath + "/modules/commands/").filter(file => file.endsWith(".js") && !file.includes("example") && !global.config.commandDisabled.includes(file));
            
            for (const file of commandFiles) {
                try {
                    const command = require(join(global.client.mainPath, "/modules/commands/", file));
                    if (!command.config || !command.run || !command.config.name) {
                        throw new Error(global.getText("mirai", "errorFormat"));
                    }
                    if (global.client.commands.has(command.config.name || "")) {
                        throw new Error(global.getText("mirai", "nameExist"));
                    }

                    // تثبيت الاعتماديات الخاصة بالأمر إذا كانت مفقودة تلقائياً
                    if (command.config.dependencies && typeof command.config.dependencies === "object") {
                        for (const dependency in command.config.dependencies) {
                            const nodeModulePath = join(__dirname, "nodemodules", "node_modules", dependency);
                            try {
                                if (!global.nodemodule.hasOwnProperty(dependency)) {
                                    if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) {
                                        global.nodemodule[dependency] = require(dependency);
                                    } else {
                                        global.nodemodule[dependency] = require(nodeModulePath);
                                    }
                                }
                            } catch {
                                logger.loader(global.getText("mirai", "notFoundPackage", dependency, command.config.name), "warn");
                                execSync("npm --package-lock false --save install " + dependency + (command.config.dependencies[dependency] === "*" || command.config.dependencies[dependency] === "" ? "" : "@" + command.config.dependencies[dependency]), {
                                    stdio: "inherit",
                                    env: process.env,
                                    shell: true,
                                    cwd: join(__dirname, "nodemodules")
                                });
                                for (let attempt = 1; attempt <= 3; attempt++) {
                                    try {
                                        require.cache = {};
                                        if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) {
                                            global.nodemodule[dependency] = require(dependency);
                                        } else {
                                            global.nodemodule[dependency] = require(nodeModulePath);
                                        }
                                        break;
                                    } catch {}
                                }
                            }
                        }
                    }

                    // تحميل إعدادات البيئة (Env Config) الخاص بالأمر
                    if (command.config.envConfig) {
                        for (const envKey in command.config.envConfig) {
                            if (typeof global.configModule[command.config.name] === "undefined") global.configModule[command.config.name] = {};
                            if (typeof global.config[command.config.name] === "undefined") global.config[command.config.name] = {};
                            
                            if (typeof global.config[command.config.name][envKey] !== "undefined") {
                                global.configModule[command.config.name][envKey] = global.config[command.config.name][envKey];
                            } else {
                                global.configModule[command.config.name][envKey] = command.config.envConfig[envKey] || "";
                            }

                            if (typeof global.config[command.config.name][envKey] === "undefined") {
                                global.config[command.config.name][envKey] = command.config.envConfig[envKey] || "";
                            }
                        }
                    }

                    if (command.onLoad) {
                        const context = { api: api, models: models };
                        command.onLoad(context);
                    }
                    if (command.config.eventRegistered) {
                        global.client.eventRegistered.push(command.config.name);
                    }

                    global.client.commands.set(command.config.name, command);
                } catch (cmdError) {
                    // إدارة أخطاء تحميل الأوامر بشكل صامت أو مخصص
                }
            }
        }());

        // 2. تحميل الأحداث (Events Launcher)
        (function () {
            const eventFiles = readdirSync(join(global.client.mainPath, "/modules/events")).filter(file => file.endsWith(".js") && !global.config.eventDisabled.includes(file));
            
            for (const file of eventFiles) {
                try {
                    const event = require(join(global.client.mainPath, "/modules/events", file));
                    if (!event.config || !event.run) {
                        throw new Error(global.getText("mirai", "errorFormat"));
                    }
                    if (global.client.events.has(event.config.name || "")) {
                        throw new Error(global.getText("mirai", "nameExist"));
                    }

                    if (event.config.dependencies && typeof event.config.dependencies === "object") {
                        for (const dependency in event.config.dependencies) {
                            const nodeModulePath = join(__dirname, "nodemodules", "node_modules", dependency);
                            try {
                                if (!global.nodemodule.hasOwnProperty(dependency)) {
                                    if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) {
                                        global.nodemodule[dependency] = require(dependency);
                                    } else {
                                        global.nodemodule[dependency] = require(nodeModulePath);
                                    }
                                }
                            } catch {
                                logger.loader(global.getText("mirai", "notFoundPackage", dependency, event.config.name), "warn");
                                execSync("npm --package-lock false --save install " + dependency + (event.config.dependencies[dependency] === "*" || event.config.dependencies[dependency] === "" ? "" : "@" + event.config.dependencies[dependency]), {
                                    stdio: "inherit",
                                    env: process.env,
                                    shell: true,
                                    cwd: join(__dirname, "nodemodules")
                                });
                                for (let attempt = 1; attempt <= 3; attempt++) {
                                    try {
                                        require.cache = {};
                                        if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) {
                                            global.nodemodule[dependency] = require(dependency);
                                        } else {
                                            global.nodemodule[dependency] = require(nodeModulePath);
                                        }
                                        break;
                                    } catch {}
                                }
                            }
                        }
                    }

                    if (event.config.envConfig) {
                        for (const envKey in event.config.envConfig) {
                            if (typeof global.configModule[event.config.name] === "undefined") global.configModule[event.config.name] = {};
                            if (typeof global.config[event.config.name] === "undefined") global.config[event.config.name] = {};
                            
                            if (typeof global.config[event.config.name][envKey] !== "undefined") {
                                global.configModule[event.config.name][envKey] = global.config[event.config.name][envKey];
                            } else {
                                global.configModule[event.config.name][envKey] = event.config.envConfig[envKey] || "";
                            }

                            if (typeof global.config[event.config.name][envKey] === "undefined") {
                                global.config[event.config.name][envKey] = event.config.envConfig[envKey] || "";
                            }
                        }
                    }

                    if (event.onLoad) {
                        const context = { api: api, models: models };
                        event.onLoad(context);
                    }

                    global.client.events.set(event.config.name, event);
                } catch (evtError) {
                    // إدارة أخطاء تشغيل الموديولات بشكل آمن
                }
            }
        }());

        // طباعة تقارير نجاح التحميل في الكونسول
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logger.loader(global.getText("mirai", "finishLoadModule", global.client.commands.size, global.client.events.size));
        logger.loader("Thời gian khởi động: " + ((Date.now() - global.client.timeStart) / 1000).toFixed() + "s");
        logger.loader("===== [ " + (Date.now() - global.client.timeStart) + "ms ] =====");
        
        // تحديث ملف الإعدادات الأساسي وحذف الملف المؤقت
        writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), "utf8");
        unlinkSync(global.client.configPath + ".temp");

        // استدعاء نظام الاستماع للأحداث والرسائل الواردة (Listen Engine)
        const listenContext = { api: api, models: models };
        const listenHandler = require("./includes/listen")(listenContext);

        function listenCallback(listenError, messageEvent) {
            if (listenError) return logger(global.getText("mirai", "handleListenError", JSON.stringify(listenError)), "ERROR");
            
            // تجاهل أحداث قراءة الرسائل أو التواجد الفوري لتخفيف استهلاك الميموري
            if (["presence", "read_receipt", "typ"].includes(messageEvent.type)) return;
            
            if (global.config.DeveloperMode === true) console.log(messageEvent);
            
            return listenHandler(messageEvent);
        }

        global.handleListen = api.listenMqtt(listenCallback);
    });
}

// دالة الإقلاع الرئيسية والاتصال بقاعدة البيانات (Sequelize SQLite)
(async () => {
    try {
        global.client.antists = true;
        const { Model, DataTypes, Sequelize: Seq } = require("sequelize");
        
        const antistsDatabase = new Seq({
            dialect: "sqlite",
            host: join(__dirname, "./includes/database/model"),
            logging: false
        });

        class AntiStModel extends Model {}
        AntiStModel.init({
            threadID: { type: DataTypes.STRING, primaryKey: true },
            data: { type: DataTypes.JSON, defaultValue: {} }
        }, { sequelize: antistsDatabase, modelName: "antists" });

        AntiStModel.findOneAndUpdate = async function (whereClause, updateValues) {
            const record = await this.findOne({ where: whereClause });
            if (!record) return null;
            Object.keys(updateValues).forEach(key => record[key] = updateValues[key]);
            await record.save();
            return record;
        };

        global.modelAntiSt = AntiStModel;
        await antistsDatabase.sync({ force: false });
    } catch (dbError) {
        global.client.antists = false;
        logger.loader("Không thể kết nối dữ liệu ANTI SETTING", "error");
        console.log(dbError);
    }

    try {
        await sequelize.authenticate();
        const databaseModels = require("./includes/database/model")({ Sequelize: Sequelize, sequelize: sequelize });
        console.log("[ DATABASE ] - successConnectDatabase");
        
        const botInstance = { models: databaseModels };
        onBot(botInstance);
    } catch (initError) {
        logger(global.getText("mirai", "successConnectDatabase", JSON.stringify(initError)), "ERROR");
    }
})();

// دالة الـ Ping التلقائي لمنع خادم Render من النوم والدخول في وضع الخمول
function pingUrl(url) {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, () => {
        console.log("Ping sent to bot");
    }).on("error", (err) => {
        console.error("Error pinging bot: " + err.message);
    });
}

setInterval(() => {
    pingUrl(botURL);
}, 40 * 1000); // إرسال بنج كل 40 ثانية تلقائياً

// تشغيل سيرفر الويب المصغر لعرض حالة البوت الأساسية
app.get("/", (req, res) => {
    const htmlPath = path.join(__dirname, "index.html");
    fs.readFile(htmlPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading HTML file");
        }
        res.send(data);
    });
});

// منع كراش البوت عند حدوث وعود غير معالجة
process.on("unhandledRejection", (reason, p) => {});

// تحديد منفذ البوت وتأكيده على السيرفر المحلي
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
