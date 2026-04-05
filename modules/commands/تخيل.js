const axios = require('axios');
const crypto = require("crypto");
const fs = require('fs-extra');
const path = require('path');

class MagicAi {
    constructor() {
        this.d_id = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        this.Token = null;
        this.baseUrl = 'https://api.magicaiimage.top';
    }

    Encrypt(OData) {
        const key = Buffer.from([0, 0, 0, 109, 97, 103, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        const encryptedBuffer = Buffer.concat([cipher.update(JSON.stringify(OData), "utf8"), cipher.final()]);
        return encryptedBuffer.toString("base64");
    }

    Decrypt(Edata) {
        const key = Buffer.from([0, 0, 0, 109, 97, 103, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(Edata, "base64")), decipher.final()]);
        return JSON.parse(decrypted.toString("utf8"));
    }

    async Requester(endpoint, param, token = this.Token) {
        const data = {
            data: this.Encrypt({
                param: param,
                header: { token: token || "", "d-id": this.d_id, version: "3.1.0", "app-code": "magic" }
            })
        };
        const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
            headers: { "User-Agent": "okhttp/4.12.0", "Content-Type": "application/json" }
        });
        return this.Decrypt(response.data.data);
    }
}

module.exports.config = {
    name: "تخيل",
    version: "4.6.0",
    hasPermssion: 0,
    credits: "DANTE SPARDA",
    description: "توليد صور احترافية (تخيل [الوصف])",
    commandCategory: "الذكاء الصناعي",
    usages: "تخيل [وصف الصورة]",
    cooldowns: 20
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage("┌──── • ⚠️ • ────┐\n يرجى كتابة وصف بعد كلمة تخيل\n└──────────────┘", threadID, messageID);

    const magic = new MagicAi();
    api.setMessageReaction("⌛", messageID, () => {}, true);
    
    const waitMsg = await new Promise(res => api.sendMessage("┌─── [ ⚙︎ IMAGINING ] ───┐\n│ جاري رسم ما تخيلته... │\n└──────────────────┘", threadID, (err, info) => res(info)));

    try {
        await magic.Requester('/app/login', { platform: 3, d_id: magic.d_id, lang: 'en', d_name: 'SM-A546E', sys_version: '12' }, '');
        const loginRes = await magic.Requester('/app/login', { platform: 3, d_id: magic.d_id, lang: 'en' }, '');
        magic.Token = loginRes.data.token;

        const param = {
            positive_prompt: prompt,
            model_id: 27, // Flux Model
            styles: [{ name: "None", weight: "1" }],
            quality_mode: 0,
            proportion: 0,
            batch_size: 1,
            public: true,
            cfg: 3.5,
            steps: 25,
            random_seed: Math.floor(Math.random() * 1e15),
            sampler_name: "euler",
            scheduler: "simple",
        };

        const startRes = await magic.Requester('/app/task/text_to_image/post', param);
        const TaskID = startRes.data.task.id;

        let isDone = false;
        for (let i = 0; i < 15; i++) {
            await new Promise(res => setTimeout(res, 4500));
            const status = await magic.Requester('/app/task/waiting/list/get', { page: 1, size: 100 });
            if (status.data && status.data[0] && status.data[0].progress.overall_percentage === "100.00") {
                isDone = true;
                break;
            }
        }

        if (!isDone) throw new Error("Timeout");

        const final = await magic.Requester('/app/task/image/list/get', { task_id: TaskID });
        const imageUrl = final.data[0].url;

        const cachePath = path.join(__dirname, 'cache', `imagine_${Date.now()}.jpg`);
        await fs.ensureDir(path.join(__dirname, 'cache'));
        
        const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(cachePath, Buffer.from(imageRes.data, 'utf-8'));

        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);

        return api.sendMessage({
            body: `┌──── • ✨ 𝐃𝐎𝐍𝐄 • ────┐\n│ تم تجسيد خيالك بنجاح │\n├──────────────────\n│ ⚙︎ 𝖣𝖠𝖭𝖳𝖤 𝖲𝖯𝖠𝖱𝖣𝖠\n└──────────────────┘`,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (error) {
        api.unsendMessage(waitMsg.messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("┌─── [ ⚠️ ERROR ] ───┐\n│ فشل التخيل، حاول لاحقاً │\n└──────────────────┘", threadID, messageID);
    }
};
