const fs = require("fs");
const path = "./config.json";

const getData = () => JSON.parse(fs.readFileSync(path, "utf8"));
const saveData = (d) => fs.writeFileSync(path, JSON.stringify(d, null, 2));

module.exports.config = {
    name: "ادارة",
    version: "7.5",
    hasPermssion: 1,
    credits: "Gemini",
    description: "Staff Dashboard",
    commandCategory: "Staff",
    usages: "[msg/groups/out]",
    cooldowns: 2
};

const UI = (title, body) => `── • { ${title} } • ──\n\n${body}\n\n╰── • Staff Dashboard`;

module.exports.run = async ({ api, event, args }) => {
    const { threadID, senderID } = event;
    const data = getData();
    const devID = "61581906898524";

    if (senderID !== devID && !data.admins[senderID]) return api.sendMessage("🚫 No Permission", threadID);

    if (data.admins[senderID]) {
        data.stats[senderID].total += 1;
        data.stats[senderID].last = new Date().toLocaleTimeString('ar');
        saveData(data);
    }

    const cmd = args[0];

    // 📋 القائمة الرئيسية (تظهر عند كتابة "ادارة" فقط)
    if (!cmd) {
        const menu = `▫️ ادارة msg [النص]\n▫️ ادارة groups\n▫️ ادارة out [الرقم]`;
        return api.sendMessage(UI("MENU", menu), threadID);
    }

    if (cmd === "msg") {
        const txt = args.slice(1).join(" ");
        if (!txt) return api.sendMessage(UI("INFO", "أدخل النص"), threadID);
        const list = (await api.getThreadList(100, null, ["INBOX"])).filter(t => t.isGroup);
        list.forEach(t => api.sendMessage(`💠 [إشعار]\n\n${txt}`, t.threadID));
        return api.sendMessage(UI("SENT", `Groups: ${list.length}`), threadID);
    }

    if (cmd === "groups") {
        const groups = (await api.getThreadList(100, null, ["INBOX"])).filter(t => t.isGroup);
        let gMsg = groups.map((g, i) => `▫️ ${i+1}. ${g.name}\n🆔 ${g.threadID}`).join("\n");
        global.temp = groups;
        return api.sendMessage(UI("GROUPS", gMsg), threadID);
    }

    if (cmd === "out") {
        const i = parseInt(args[1]) - 1;
        if (!global.temp || !global.temp[i]) return api.sendMessage("❌ Error", threadID);
        const target = global.temp[i];
        api.sendMessage(UI("LEAVE", `Out: ${target.name}`), threadID);
        return api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
    }
};
