const FormData = require('form-data');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { imageSize } = require('image-size'); // المكتبة المطلوبة

module.exports.config = {
    name: "ارت",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "تحويل الصور لستايل أنمي (حواف منحنية)",
    commandCategory: "الذكاء الصناعي",
    usages: "[رد على صورة + رقم]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, type } = event;

    // 1. عرض الموديلات بستايل منحني
    if (args[0] === "موديلات" || args[0] === "قائمة") {
        api.setMessageReaction("📋", messageID, () => {}, true);
        const models = await getModelsList();
        let msg = `╭───〔 📄 𝐀𝐑𝐓 𝐌𝐎𝐃𝐄𝐋𝐒 〕───╮\n`;
        models.slice(0, 20).forEach(m => {
            msg += `┃ ꕥ ${m.originalIndex} ➔ ${m.name}\n`;
        });
        msg += `├───〔 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠 〕───┤\n`;
        msg += `╰─────────────────────╯`;
        return api.sendMessage(msg, threadID, messageID);
    }

    // 2. التحقق من الرد
    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("╭──── • ⚠️ • ────╮\n┃ يرجى الرد على صورة أولاً\n┃ اكتب 'ارت موديلات' للقائمة\n╰──────────────╯", threadID, messageID);
    }

    const styleNum = parseInt(args[0]) || 29;
    const models = await getModelsList();
    if (styleNum < 0 || styleNum >= models.length) return api.sendMessage("❌ رقم الستايل غير صحيح", threadID, messageID);

    const selectedStyle = models[styleNum];
    api.setMessageReaction("⌛", messageID, () => {}, true);

    const waitMsg = await new Promise(res => api.sendMessage(`╭───〔 🎨 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 〕───╮\n┃ الستايل: ${selectedStyle.name}\n┃ جاري المعالجة... ₍•᷄ - •᷅₎\n╰──────────────────╯`, threadID, (err, info) => res(info)));

    const cachePath = path.join(__dirname, 'cache', `art_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, 'cache'));

    try {
        const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(imgRes.data));

        const idgen = genUID();
        const token = await genImageToken(idgen);
        
        const uploadForm = new FormData();
        ['name', 'key', 'policy', 'OSSAccessKeyId', 'success_action_status', 'signature', 'backend_type', 'region'].forEach(f => uploadForm.append(f, token[f]));
        uploadForm.append('file', fs.createReadStream(cachePath));

        await axios.post('https://aimirror-images-sg.oss-ap-southeast-1.aliyuncs.com', uploadForm, { headers: uploadForm.getHeaders() });

        const { width, height } = imageSize(fs.readFileSync(cachePath));
        const drawRes = await axios.post(`https://be.aimirror.fun/draw?uid=${idgen}`, {
            "model_id": parseInt(selectedStyle.id),
            "cropped_image_key": token.key,
            "cropped_height": height,
            "cropped_width": width,
            "package_name": "com.ai.polyverse.mirror",
            "version": "6.2.4",
            "is_free_trial": true
        }, { headers: { 'uid': idgen, 'env': 'PRO' } });

        let status = "WAITING";
        let result;
        while (status !== "SUCCEED") {
            await new Promise(r => setTimeout(r, 3000));
            const check = await axios.get(`https://be.aimirror.fun/draw/process?draw_request_id=${drawRes.data.draw_request_id}&uid=${idgen}`, { headers: { 'uid': idgen, 'env': 'PRO' } });
            result = check.data;
            status = result.draw_status;
            if (status === "FAILED") throw new Error("رفض السيرفر الطلب");
        }

        const finalImg = await axios.get(result.generated_image_addresses[0], { responseType: "stream" });

        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

        return api.sendMessage({
            body: `╭───〔 ✨ 𝐀𝐑𝐓 𝐃𝐎𝐍𝐄 〕───╮\n┃ الستايل: ${selectedStyle.name}\n├───〔 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠 〕───┤\n╰─────────────────────╯`,
            attachment: finalImg
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`╭── [ ⚠️ ERROR ] ──╮\n┃ فشل: ${e.message}\n╰────────────────╯`, threadID, messageID);
    }
};

async function getModelsList() {
    const id = genUID();
    const res = await axios.get(`https://be.aimirror.fun/filter_search?uid=${id}`, { headers: { 'uid': id, 'env': 'PRO' } });
    return res.data.search_info.filter(i => !i.key_words.includes("video")).map((i, index) => ({ id: i.model_id, name: i.model, originalIndex: index }));
}

async function genImageToken(uid) {
    const hash = crypto.randomBytes(20).toString('hex');
    const res = await axios.get(`https://be.aimirror.fun/app_token/v2?cropped_image_hash=${hash}.jpeg&uid=${uid}`, { headers: { 'uid': uid, 'env': 'PRO' } });
    return res.data;
}

function genUID() { return 'fe20871' + crypto.randomBytes(4).toString('hex'); }
