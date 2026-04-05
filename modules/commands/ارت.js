const FormData = require('form-data');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { imageSize } = require('image-size');

module.exports.config = {
    name: "ارت",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "تحويل الصور لستايل أنمي (بنية متوافقة)",
    commandCategory: "الذكاء الصناعي",
    usages: "[رد على صورة + رقم]",
    cooldowns: 15
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, type } = event;

    // 1. عرض الموديلات
    if (args[0] === "موديلات" || args[0] === "قائمة") {
        api.setMessageReaction("📋", messageID, () => {}, true);
        const models = await getModelsList();
        let msg = `╭─── 𖦆 𝐀𝐑𝐓 𝐌𝐎𝐃𝐄𝐋𝐒 𖦆 ───╮\n`;
        models.slice(0, 15).forEach(m => {
            msg += `┃ ⚬ ${m.originalIndex} ➔ ${m.name}\n`;
        });
        msg += `┝───────────────┤\n┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠 𖦹\n╰───────────────────╯`;
        return api.sendMessage(msg, threadID, messageID);
    }

    // 2. التحقق من الرد على صورة
    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("╭─── 𖦆 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 𖦆 ───╮\n┃ ⚬ يرجى الرد على صورة أولاً\n┃ ⚬ مثال: ارت 29\n╰───────────────────╯", threadID, messageID);
    }

    const styleNum = parseInt(args[0]) || 29;
    const models = await getModelsList();
    if (styleNum < 0 || styleNum >= models.length) return api.sendMessage("❌ رقم الستايل غير موجود", threadID, messageID);

    const selectedStyle = models[styleNum];
    api.setMessageReaction("⌛", messageID, () => {}, true);

    const waitMsg = await new Promise(res => api.sendMessage(`╭─── 𖦆 𝐏𝐑𝐎𝐂𝐄𝐒𝐒 𖦆 ───╮\n┃ ⚬ الستايل: ${selectedStyle.name}\n┃ ⚬ جاري الابتكار... ₍•᷄ - •᷅₎\n╰───────────────────╯`, threadID, (err, info) => res(info)));

    const cachePath = path.join(__dirname, 'cache', `art_${Date.now()}.png`);
    await fs.ensureDir(path.join(__dirname, 'cache'));

    try {
        // تحميل الصورة
        const imgRes = await axios.get(messageReply.attachments[0].url, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(imgRes.data));

        const idgen = 'fe20871' + crypto.randomBytes(4).toString('hex');
        const tokenHash = crypto.randomBytes(20).toString('hex');
        
        // جلب توكن الرفع
        const tokenRes = await axios.get(`https://be.aimirror.fun/app_token/v2?cropped_image_hash=${tokenHash}.jpeg&uid=${idgen}`);
        const token = tokenRes.data;

        // الرفع للسيرفر
        const form = new FormData();
        ['name', 'key', 'policy', 'OSSAccessKeyId', 'success_action_status', 'signature', 'backend_type', 'region'].forEach(f => form.append(f, token[f]));
        form.append('file', fs.createReadStream(cachePath));

        await axios.post('https://aimirror-images-sg.oss-ap-southeast-1.aliyuncs.com', form, { headers: form.getHeaders() });

        // إنشاء مهمة الرسم
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

        // انتظار النتيجة
        let status = "WAITING";
        let result;
        while (status !== "SUCCEED") {
            await new Promise(r => setTimeout(r, 4000));
            const check = await axios.get(`https://be.aimirror.fun/draw/process?draw_request_id=${drawRes.data.draw_request_id}&uid=${idgen}`);
            result = check.data;
            status = result.draw_status;
            if (status === "FAILED") throw new Error("السيرفر مشغول حالياً");
        }

        const finalImg = await axios.get(result.generated_image_addresses[0], { responseType: "stream" });

        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

        return api.sendMessage({
            body: `╭─── 𖦆 𝐀𝐑𝐓 𝐃𝐎𝐍𝐄 𖦆 ───╮\n┃ ⚬ الستايل: ${selectedStyle.name}\n┝───────────────┤\n┃ ꗯ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠 𖦹\n╰───────────────────╯`,
            attachment: finalImg
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (e) {
        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(`⚠️ فشل: ${e.message}`, threadID, messageID);
    }
};

async function getModelsList() {
    const id = 'fe20871' + crypto.randomBytes(4).toString('hex');
    const res = await axios.get(`https://be.aimirror.fun/filter_search?uid=${id}`);
    return res.data.search_info.filter(i => !i.key_words.includes("video")).map((i, index) => ({ id: i.model_id, name: i.model, originalIndex: index }));
}
