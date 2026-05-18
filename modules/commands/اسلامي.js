const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
    name: "اسلامي",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "إرسال مقاطع دينية وفيديوهات إسلامية قصيرة عشوائية",
    commandCategory: "إسلاميات",
    cooldowns: 5
};

module.exports.run = async ({ api, event: e }) => {
    const { threadID, messageID } = e;
    const dirMaterial = __dirname + `/cache/`;
    const pathVideo = dirMaterial + `islamic_${messageID}.mp4`;

    const videoLinks = [
        "https://i.imgur.com/FbnZI40.mp4",
        "https://i.imgur.com/8k6OOZg.mp4",
        "https://i.imgur.com/lgQghHX.mp4",
        "https://i.imgur.com/D7HZFSg.mp4",
        "https://i.imgur.com/vUe9Zlv.mp4",
        "https://i.imgur.com/oxFuJYw.mp4",
        "https://i.imgur.com/OKKlDBN.mp4",
        "https://i.imgur.com/6wWebFc.mp4",
        "https://i.imgur.com/K2LTmaA.mp4",
        "https://i.imgur.com/i9vKvTd.mp4",
        "https://i.imgur.com/Y6uBzxx.mp4",
        "https://i.imgur.com/ULtFVPQ.mp4",
        "https://i.imgur.com/wX8WJh3.mp4",
        "https://i.imgur.com/6A42EIx.mp4",
        "https://i.imgur.com/ozRevxt.mp4",
        "https://i.imgur.com/Gd49ZSo.mp4",
        "https://i.imgur.com/xu6lBXk.mp4",
        "https://i.imgur.com/sDNohv4.mp4",
        "https://i.imgur.com/JBu2Ie3.mp4",
        "https://i.imgur.com/UaY42rq.mp4",
        "https://i.imgur.com/NFxf731.mp4",
        "https://i.imgur.com/vv1HsMC.mp4",
        "https://i.imgur.com/Y8MPzLv.mp4",
        "https://i.imgur.com/9M1v1qK.mp4",
        "https://i.imgur.com/EgUy7v0.mp4",
        "https://i.imgur.com/IjDqg2G.mp4",
        "https://i.imgur.com/51NYqmO.mp4",
        "https://i.imgur.com/XjfJHh9.mp4",
        "https://i.imgur.com/XHrkPt4.mp4",
        "https://i.imgur.com/mqEYRdy.mp4",
        "https://i.imgur.com/NaVsFmQ.mp4",
        "https://i.imgur.com/31XSmVj.mp4",
        "https://i.imgur.com/PPamCPI.mp4",
        "https://i.imgur.com/i6Iy7iN.mp4"
    ];

    if (!fs.existsSync(dirMaterial)) {
        fs.mkdirSync(dirMaterial, { recursive: true });
    }

    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];

    const msgText = `قال رسول الله ﷺ: "الدال على الخير كفاعله"\n\n` +
                    `مقْطع ديني قصير..\n` +
                    `تذكر: ذكر الله حياة القلوب 🤍\n\n` +
                    `اللهم اجعلنا ممن يستمعون القول فيتبعون أحسنه.`;

    try {
        const response = await axios.get(randomVideo, { responseType: "arraybuffer" });
        fs.writeFileSync(pathVideo, Buffer.from(response.data, "utf-8"));

        const msg = {
            body: msgText,
            attachment: fs.createReadStream(pathVideo)
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(pathVideo)) {
                fs.unlinkSync(pathVideo);
            }
        }, messageID);

    } catch (error) {
        console.error("خطأ في أمر اسلامي: " + error.message);
        return api.sendMessage(msgText, threadID, messageID);
    }
};
