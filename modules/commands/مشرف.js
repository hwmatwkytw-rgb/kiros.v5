const fs = require("fs");
const path = "./config.json";

const getData = () => JSON.parse(fs.readFileSync(path, "utf8"));
const saveData = (d) => fs.writeFileSync(path, JSON.stringify(d, null, 2));

module.exports.config = {
    name: "مشرف",
    version: "7.5",
    hasPermssion: 2,
    credits: "Gemini",
    description: "System Controls",
    commandCategory: "Admin",
    usages: "[add/del/list/rep]",
    cooldowns: 2
};

const UI = (title, body) => `── • { ${title} } • ──\n\n${body}\n\n╰── • ID: 61581906898524`;

module.exports.run = async ({ api, event, args }) => {
    const { threadID, senderID, mentions, messageReply } = event;
    const devID = "61581906898524";
    if (senderID !== devID) return api.sendMessage("⚠️ Access Denied", threadID);
    
    const data = getData();
    const cmd = args[0];

    if (cmd === "add") {
        let uid = messageReply ? messageReply.senderID : Object.keys(mentions)[0] || args[1];
        if (!uid) return api.sendMessage(UI("INFO", "حدد المستخدم"), threadID);
        const name = (await api.getUserInfo(uid))[uid].name;
        data.admins[uid] = { name, date: new Date().toLocaleDateString('ar') };
        data.stats[uid] = { total: 0, last: "None" };
        saveData(data);
        return api.sendMessage(UI("SUCCESS", `👤 ${name}\n🆔 ${uid}\nStatus: Admin`), threadID);
    }

    if (cmd === "del") {
        let uid = messageReply ? messageReply.senderID : Object.keys(mentions)[0] || args[1];
        if (!uid || !data.admins[uid]) return api.sendMessage(UI("ERROR", "غير موجود"), threadID);
        delete data.admins[uid]; delete data.stats[uid]; saveData(data);
        return api.sendMessage(UI("REMOVED", `ID: ${uid}`), threadID);
    }

    if (cmd === "list") {
        const ids = Object.keys(data.admins);
        let list = ids.map((id, i) => `▫️ ${i+1}. ${data.admins[id].name} (${id})`).join("\n");
        return api.sendMessage(UI("ADMINS", ids.length ? list : "Empty"), threadID);
    }

    if (cmd === "rep") {
        let uid = messageReply ? messageReply.senderID : Object.keys(mentions)[0] || args[1];
        if (!uid || !data.admins[uid]) return api.sendMessage(UI("REPORT", "Invalid ID"), threadID);
        const st = data.stats[uid];
        return api.sendMessage(UI("REPORT", `👤 ${data.admins[uid].name}\n📈 Activity: ${st.total}\n🕒 Last: ${st.last}`), threadID);
    }

    return api.sendMessage(UI("HELP", "🔹 مشرف add\n🔹 مشرف del\n🔹 مشرف list\n🔹 مشرف rep"), threadID);
};
