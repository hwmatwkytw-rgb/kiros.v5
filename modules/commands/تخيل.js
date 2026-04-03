const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");

// دالة الانتظار
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// إعدادات الموديل (Flux1.1 Pro)
const models = [{ 
    id: 27, 
    name: "Flux1.1 Pro", 
    default: { cfg: 3.5, steps: 25, sampler_name: "euler", scheduler_name: "simple" } 
}];

module.exports.config = {
    name: "تخيل",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Dante x Sinko",
    description: "صنع صور باحترافية (Kairus x MagicAi)",
    commandCategory: "الخدمات",
    usages: "[وصف الصورة]",
    cooldowns: 20
};

// --- [ مـحـرك الـتـشـفـيـر والـتـولـيـد ] ---
class MagicAi {
    constructor(d_id) {
        this.d_id = d_id || Math.random().toString(36).substring(2, 18);
        this.Token = null;
        this.baseUrl = 'https://api.magicaiimage.top';
    }

    Encrypt(OData) {
        const key = Buffer.from([0, 0, 0, 109, 97, 103, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
        return Buffer.concat([cipher.update(JSON.stringify(OData), "utf8"), cipher.final()]).toString("base64");
    }

    Decrypt(Edata) {
        const key = Buffer.from([0, 0, 0, 109, 97, 103, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(Edata, "base64")), decipher.final()]);
        return JSON.parse(decrypted.toString("utf8"));
    }

    async Requester(endpoint, param, token = this.Token) {
        const data = { data: this.Encrypt({ param, header: { token: token || "", "d-id": this.d_id, version: "3.1.0", "app-code": "magic" } }) };
        const res = await axios.post(`${this.baseUrl}${endpoint}`, data, { headers: { "User-Agent": "okhttp/4.12.0" } });
        return this.Decrypt(res.data.data);
    }
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage(`╮── ▽ 「 تنبيه 」\n│ يرجى كتابة وصف للصورة يا ملك ○\n╯────────────── 🝓`, threadID, messageID);

    api.setMessageReaction("🎨", messageID, () => {}, true);
    const loadingMsg = await api.sendMessage(`╮─── ▽ 「 جاري التخيل 」\n│ يتم استخدام محرك الماجيك نانو...\n╯────────────── 🝓`, threadID);

    try {
        // 1. الترجمة للإنجليزية لتحسين النتائج
        const trans = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(prompt)}`);
        const magicPrompt = trans.data[0][0][0] + ", high quality, ultra detail, masterpiece";

        // 2. بدء عملية التوليد (MagicAi Logic)
        const magic = new MagicAi();
        const login = await magic.Requester('/app/login', { platform: 3, d_id: magic.d_id, lang: 'en' }, '');
        magic.Token = login.data.token;

        const startRes = await magic.Requester('/app/task/text_to_image/post', {
            positive_prompt: magicPrompt, model_id: 27, styles: [{ name: "None", weight: "1" }],
            quality_mode: 0, proportion: 0, batch_size: 1, public: true,
            cfg: 3.5, steps: 25, sampler_name: "euler", scheduler: "simple",
            random_seed: Math.floor(Math.random() * 1e15), speed_type: 0
        });

        const taskID = startRes.data.task.id;
        
        // 3. حلقة فحص الحالة (Polling)
        let isReady = false;
        for (let i = 0; i < 15; i++) {
            await sleep(4000);
            const check = await magic.Requester('/app/task/waiting/list/get', { page: 1, size: 100 });
            if (check.data?.[0]?.progress?.overall_percentage === "100.00") {
                isReady = true;
                break;
            }
        }

        if (!isReady) throw new Error("Timeout");

        const final = await magic.Requester('/app/task/image/list/get', { task_id: taskID });
        const imageUrl = final.data[0].image_url;

        // 4. تحميل الصورة وحفظها
        const cachePath = path.join(__dirname, "cache", `magic_${Date.now()}.png`);
        const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.ensureDir(path.join(__dirname, "cache"));
        fs.writeFileSync(cachePath, Buffer.from(imgRes.data, "binary"));

        // 5. الإرسال بستايل كايروس
        api.unsendMessage(loadingMsg.messageID);
        const report = `╮─────── 🝓 ───────╭\n    𝖪 𝖠 𝖨 𝖱 𝖴 𝖲   𝖨 𝖬 𝖠 𝖦 𝖤\n╯─────── 🝓 ───────╰\n│ ⌑ الحالة : تم الرسم ○\n│ ⌑ المحرك : Flux 1.1 Pro\n│ ⌑ المطور : Dante Sparda\n╯────────────── 🝓`;

        return api.sendMessage({
            body: report,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
            fs.unlinkSync(cachePath);
            api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);

    } catch (e) {
        console.error(e);
        api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(`╮── ▽ 「 خطأ 」\n│ المحرك مشغول أو السيرفر تعبان\n╯─────── 🝓`, threadID, messageID);
    }
};
