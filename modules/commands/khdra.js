const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "users.json");

// تحميل وحفظ البيانات
function loadData() {
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
return JSON.parse(fs.readFileSync(dataPath));
}
function saveData(data) {
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// الوظائف المحدثة
const jobs = {
"هاكر": { min: 2500, max: 5000, emoji: "💻" },
"طبيب": { min: 2000, max: 4000, emoji: "👨‍⚕️" },
"مبرمج": { min: 1800, max: 3500, emoji: "👨‍💻" },
"ضابط": { min: 1600, max: 3200, emoji: "👮" },
"ميكانيكي": { min: 1300, max: 2800, emoji: "🔧" },
"تاجر": { min: 1200, max: 2600, emoji: "💼" },
"صياد": { min: 1100, max: 2400, emoji: "🎣" },
"حارس": { min: 1000, max: 2200, emoji: "🛡️" },
"سائق": { min: 900, max: 2000, emoji: "🚗" },
"توصيل": { min: 800, max: 1800, emoji: "🛵" },
"مزارع": { min: 700, max: 1600, emoji: "👨‍🌾" },
"نحات": { min: 1500, max: 3000, emoji: "🗿" },
"حداد": { min: 1400, max: 2900, emoji: "⚒️" },
"خباز": { min: 900, max: 1900, emoji: "🥖" },
"سمكري": { min: 1100, max: 2300, emoji: "🔨" },
"نجار": { min: 1200, max: 2500, emoji: "🪚" },
"رسام": { min: 1300, max: 2700, emoji: "🎨" },
"مصور": { min: 1400, max: 2800, emoji: "📸" },
"كاتب": { min: 1000, max: 2100, emoji: "✍️" },
"مترجم": { min: 1500, max: 3100, emoji: "🌐" },
"محامي": { min: 1700, max: 3400, emoji: "⚖️" },
"مهندس": { min: 1900, max: 3800, emoji: "🏗️" },
"طيار": { min: 2200, max: 4500, emoji: "✈️" },
"بحار": { min: 1200, max: 2600, emoji: "⛵" },
"منقب": { min: 1600, max: 3300, emoji: "⛏️" }
};

// المتجر
const shop = {
"هاتف": { price: 1500, desc: "📱 يزيد ارباح العمل 5%" },
"دراجة": { price: 3000, desc: "🚲 يزيد ارباح التوصيل 10%" },
"سيارة": { price: 8000, desc: "🚗 يزيد ارباح السائق 20%" },
"عدة": { price: 2500, desc: "🔧 تقوية الميكانيكي 8%" },
"سلاح": { price: 6000, desc: "🔫 حماية اثناء السرقة" },
"حقيبة": { price: 2000, desc: "🎒 تخزن ادوات اكثر" },
"كمبيوتر": { price: 5000, desc: "💻 دعم المبرمج 12%" },
"بطاقة": { price: 4000, desc: "💳 خصم 15% من المتجر" },
"ملابس": { price: 1800, desc: "👕 زيادة الهيبة 3%" },
"خريطة": { price: 3500, desc: "🗺️ فرص نادرة بالتنقيب" },
"مسدس": { price: 7000, desc: "🔫 قوة هجوم 6%" },
"رشاش": { price: 12000, desc: "💥 قوة هجوم 12%" },
"خوذة": { price: 2500, desc: "🛡️ حماية 4%" },
"فأس": { price: 1000, desc: "⛏️ للتنقيب اليدوي" },
"معول": { price: 5000, desc: "⚒️ يضاعف التنقيب" },
"ديناميت": { price: 10000, desc: "💣 ينقيب 3 اضعاف" },
"بذور_قمح": { price: 200, desc: "🌾 تنمو في 5 دقائق" },
"بذور_طماطم": { price: 500, desc: "🍅 تنمو في 15 دقيقة" },
"بذور_بطيخ": { price: 1500, desc: "🍉 تنمو في 45 دقيقة" },
"بذور_ذرة": { price: 300, desc: "🌽 تنمو في 8 دقائق" },
"بذور_فراولة": { price: 800, desc: "🍓 تنمو في 20 دقيقة" },
"بذور_زيتون": { price: 2000, desc: "🫒 تنمو في 60 دقيقة" },
"ارض": { price: 5000, desc: "🌱 قطعة ارض زراعية" },
"جرار": { price: 15000, desc: "🚜 يضاعف الانتاج الزراعي" },
"صوبة": { price: 8000, desc: "🏡 تسرع النمو 20%" }
};

// تأثير الأدوات على الأرباح
const itemEffects = {
"هاتف": 0.05, "دراجة": 0.10, "سيارة": 0.20,
"عدة": 0.08, "سلاح": 0.05, "حقيبة": 0.07,
"كمبيوتر": 0.12, "بطاقة": 0.15, "ملابس": 0.03,
"خريطة": 0.10, "مسدس": 0.06, "رشاش": 0.12, "خوذة": 0.04,
"فأس": 0.02, "معول": 0.10, "ديناميت": 0.20
};

// المحاصيل الزراعية
const crops = {
"قمح": { seed: "بذور_قمح", sellPrice: 800, growTime: 5 },
"طماطم": { seed: "بذور_طماطم", sellPrice: 2000, growTime: 15 },
"بطيخ": { seed: "بذور_بطيخ", sellPrice: 7000, growTime: 45 },
"ذرة": { seed: "بذور_ذرة", sellPrice: 1200, growTime: 8 },
"فراولة": { seed: "بذور_فراولة", sellPrice: 3500, growTime: 20 },
"زيتون": { seed: "بذور_زيتون", sellPrice: 10000, growTime: 60 }
};

// المكافأة اليومية
const DAILY_MIN = 500;
const DAILY_MAX = 1500;

// المناطق العشوائية
const regions = ["الخرطوم", "أم درمان", "بحري", "كسلا", "دنقلا", "الفاشر", "ود مدني", "بورتسودان", "نيالا", "الأبيض"];

// اسعار السوق السوداء
const blackMarketPrices = { "ذهب": 5000, "فضة": 2000, "حجر": 500, "الماس": 15000, "زمرد": 8000, "ياقوت": 12000, "نحاس": 1000, "حديد": 1500 };

// العاب جديدة
const games = {
"حجر_ورقة_مقص": { minBet: 100, maxBet: 10000 },
"طاولة": { minBet: 500, maxBet: 20000 },
"دومينو": { minBet: 200, maxBet: 15000 },
"شطرنج": { minBet: 1000, maxBet: 50000 },
"ورق": { minBet: 300, maxBet: 25000 }
};

module.exports.config = {
name: "اقتصاد",
version: "12.0.0",
hasPermssion: 0,
credits: "تطوير",
description: "نظام اقتصاد متكامل",
commandCategory: "اقتصاد",
usages: "[الامر]",
cooldowns: 2,
usePrefix: false
};

module.exports.run = async function({ api, event, args, Users }) {
const userID = event.senderID;
const userName = await Users.getNameUser(userID);
let data = loadData();
const sub = args[0]?.toLowerCase();
const user = data[userID];

// 🟢 تسجيل
if (sub === "تسجيل" || sub === "سجلني" || sub === "start") {
const chosenName = args.slice(1).join(" ") || userName;
if (user) return api.sendMessage("❌ انت مسجل مسبقاً", event.threadID);
const region = regions[Math.floor(Math.random() * regions.length)];
data[userID] = {
name: chosenName,
balance: 1000,
job: "عاطل",
inventory: [],
lastWork: 0,
lastDaily: 0,
region,
resources: { ذهب: 0, فضة: 0, حجر: 0, الماس: 0, زمرد: 0, ياقوت: 0, نحاس: 0, حديد: 0 },
lastMine: 0,
farm: null,
lands: [],
mineLevel: 1,
level: 1,
exp: 0,
wins: 0,
losses: 0,
achievements: [],
bank: 0,
loan: 0,
loanTime: 0
};
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم التسجيل بنجاح\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  🧑 الاسم: ${chosenName}\n` +
`  📍 المنطقة: ${region}\n` +
`  💰 الرصيد: 1000\n` +
`  📝 للتشغيل: اوامر\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (!user) return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ⚠️ غير مسجل في النظام\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📝 للتسجيل: تسجيل <اسمك>\n` +
`  📝 او: سجلني <اسمك>\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);

// 📋 نظام الاوامر الرئيسي
if (sub === "اوامر" || sub === "help" || sub === "القائمة" || sub === "الاوامر") {
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    📋 قــائــمــة الاوامـــــر\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +

`┏━━━━━━ 「 💼 الــوظــائــف 」 ━━━━━┓\n` +
`┃  › وظايف  ›  وظيفة  ›  عمل\n` +
`┃  › اختيار  ›  ترك  ›  ترقية\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 🌾 الــزراعــة 」 ━━━━━┓\n` +
`┃  › زراعة  ›  محاصيل  ›  اراضي\n` +
`┃  › ازرع  ›  حصاد  ›  بذور\n` +
`┃  › شراء_ارض  ›  جرار  ›  صوبة\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 ⛏️ الــتـنـقـيـب 」 ━━━━━┓\n` +
`┃  › تنقيب  ›  منجم  ›  تطوير_منجم\n` +
`┃  › بيع  ›  سوق  ›  خريطة\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 🏪 الــمـتـجـر 」 ━━━━━┓\n` +
`┃  › متجر  ›  شراء  ›  بيع_موارد\n` +
`┃  › مخزون  ›  بنك  ›  ايداع\n` +
`┃  › سحب  ›  قرض  ›  سداد\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 🎮 الــعــاب 」 ━━━━━┓\n` +
`┃  › حجر_ورقة_مقص [مبلغ]\n` +
`┃  › طاولة [مبلغ]\n` +
`┃  › دومينو [مبلغ]\n` +
`┃  › شطرنج [مبلغ]\n` +
`┃  › ورق [مبلغ]\n` +
`┃  › رهان [مبلغ]\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 🎁 الــهـدايــا 」 ━━━━━┓\n` +
`┃  › يومي  ›  فكة  ›  صمة\n` +
`┃  › تحويل [@منشن] [مبلغ]\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 👤 مــلــفــي 」 ━━━━━┓\n` +
`┃  › ملفي  ›  اغنياء  ›  احصائيات\n` +
`┃  › توب  ›  مستوى  ›  مخزون\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━━━ 「 ⚙️ عـــامــة 」 ━━━━━┓\n` +
`┃  › معلوماتي  ›  مغادرة\n` +
`┃  › اوامر  ›  مساعدة\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`╭━━━━━━━━━━━━━━━━━━╮\n` +
`  📊 عدد الاوامــر : 75+\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 👤 نظام ملفي - عرض تفاصيل الحساب
if (sub === "ملفي" || sub === "profile" || sub === "حسابي") {
let inventoryList = user.inventory.length > 0 ? user.inventory.join(" • ") : "فارغة";
let resourcesList = Object.entries(user.resources)
.filter(([_, v]) => v > 0)
.map(([k, v]) => `${k}: ${v}`)
.join(" • ") || "لا يوجد";

let landsCount = user.lands ? user.lands.length : 0;
let cultivatedLands = user.lands ? user.lands.filter(l => l.crop).length : 0;

return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    👤 مــلــفــي الــشــخــصــي\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +

`┏━━━━ 「 🆔 مــعــلــومــات 」 ━━━━┓\n` +
`┃  🧑 الاسم: ${user.name}\n` +
`┃  📍 المنطقة: ${user.region}\n` +
`┃  📊 المستوى: ${user.level} ✨\n` +
`┃  ⭐ خبرة: ${user.exp}/${user.level * 1000}\n` +
`┃  💰 الرصيد: ${user.balance}\n` +
`┃  🏦 البنك: ${user.bank || 0}\n` +
`┃  💳 قرض: ${user.loan || 0}\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 💼 الــوظــيــفــة 」 ━━━━┓\n` +
`┃  ${jobs[user.job]?.emoji || "🔄"} الوظيفة: ${user.job}\n` +
`┃  💰 الراتب: ${user.job !== "عاطل" ? jobs[user.job].min + "-" + jobs[user.job].max : "---"}\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🎒 الــمــخــزون 」 ━━━━┓\n` +
`┃  📦 ادوات: ${inventoryList}\n` +
`┃  ⛏️ موارد: ${resourcesList}\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🌾 الــزراعــة 」 ━━━━┓\n` +
`┃  🌱 اراضي: ${landsCount}\n` +
`┃  🌿 مزروع: ${cultivatedLands}\n` +
`┃  ⛏️ المنجم: مستوى ${user.mineLevel || 1}\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🎮 الــعــاب 」 ━━━━┓\n` +
`┃  🏆 فوز: ${user.wins || 0}\n` +
`┃  💔 خسارة: ${user.losses || 0}\n` +
`┃  📊 نسبة: ${user.wins + user.losses > 0 ? Math.round((user.wins / (user.wins + user.losses)) * 100) : 0}%\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 💼 نظام الوظائف
if (sub === "وظايف" || sub === "وظائف" || sub === "jobs") {
let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    📋 قــائــمـة الــوظــائــف\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

Object.entries(jobs).forEach(([name, data]) => {
msg += `  ${data.emoji} ${name}\n`;
msg += `  💰 ${data.min}-${data.max}\n`;
msg += `  ━━━━━━━━━━━━━━━━━━\n`;
});

msg += `\n╰━━━━━━━━━━━━━━━━━━╯\n`;
msg += `  📝 للاختيار: اختيار [الوظيفة]\n`;
msg += `╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (sub === "وظيفة" || sub === "عملي") {
if (user.job === "عاطل") return api.sendMessage("❌ انت عاطل عن العمل! اختر وظيفة اولاً", event.threadID);
const job = jobs[user.job];
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    📋 مــعــلــومــات الــوظــيــفــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  ${job.emoji} الوظيفة: ${user.job}\n` +
`  💰 الراتب: ${job.min}-${job.max}\n` +
`  📝 للعمل: عمل\n` +
`  📝 للترك: ترك\n` +
`  📝 للترقية: ترقية\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "ترك" || sub === "ترك_الوظيفة" || sub === "استقالة") {
user.job = "عاطل";
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم ترك الوظيفة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📝 اصبحت عاطل عن العمل\n` +
`  📝 اختر وظيفة جديدة: اختيار\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "ترقية" || sub === "تطوير_وظيفة") {
if (user.job === "عاطل") return api.sendMessage("❌ انت عاطل عن العمل!", event.threadID);
const cost = 5000;
if (user.balance < cost) return api.sendMessage(`❌ تحتاج ${cost} 💰 للترقية`, event.threadID);
user.balance -= cost;
const currentJob = jobs[user.job];
currentJob.min = Math.floor(currentJob.min * 1.2);
currentJob.max = Math.floor(currentJob.max * 1.2);
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ⬆️ تـم تـرقـيـة الـوظـيـفـة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 الراتب الجديد: ${currentJob.min}-${currentJob.max}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "اختيار" || sub === "اختار" || sub === "choose") {
const jobName = args.slice(1).join(" ");
if (!jobName) return api.sendMessage("❌ استخدم: اختيار [اسم الوظيفة]", event.threadID);

const foundJob = Object.keys(jobs).find(j => j.includes(jobName) || jobName.includes(j));
if (!foundJob) return api.sendMessage("❌ وظيفة غير موجودة", event.threadID);

user.job = foundJob;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم اخـتـيـار الـوظـيـفـة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  ${jobs[foundJob].emoji} الوظيفة: ${foundJob}\n` +
`  📝 للعمل: عمل\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "عمل" || sub === "work" || sub === "اشتغل") {
if (user.job === "عاطل") return api.sendMessage("❌ اختر وظيفة اولاً: اختيار", event.threadID);
const now = Date.now();
if (now - user.lastWork < 5 * 60 * 1000) {
const remaining = Math.ceil((5 * 60 * 1000 - (now - user.lastWork)) / 60000);
return api.sendMessage(`⏳ متبقي ${remaining} دقيقة`, event.threadID);
}

const job = jobs[user.job];
let reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
let multiplier = 1;

// تطبيق تأثيرات الادوات
user.inventory.forEach(item => {
if (itemEffects[item]) multiplier += itemEffects[item];
if (item === "دراجة" && user.job === "توصيل") multiplier += 0.1;
if (item === "سيارة" && user.job === "سائق") multiplier += 0.2;
if (item === "كمبيوتر" && user.job === "مبرمج") multiplier += 0.15;
if (item === "عدة" && user.job === "ميكانيكي") multiplier += 0.1;
});

reward = Math.floor(reward * multiplier);
user.balance += reward;
user.lastWork = now;
user.exp += Math.floor(reward / 100);

// ترقية المستوى
if (user.exp >= user.level * 1000) {
user.level++;
user.exp = 0;
}

saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    💼 نـتـيـجـة الـعـمـل\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  ${job.emoji} الوظيفة: ${user.job}\n` +
`  💰 الربح: ${reward}\n` +
`  ✨ المستوى: ${user.level}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🎮 الالعاب
if (sub === "حجر_ورقة_مقص" || sub === "حجر") {
const amount = parseInt(args[1]);
if (!amount || amount < 100 || amount > 10000) return api.sendMessage("❌ المبلغ من 100 الى 10000", event.threadID);
if (user.balance < amount) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

const choices = ["حجر", "ورقة", "مقص"];
const botChoice = choices[Math.floor(Math.random() * 3)];
const userChoice = args[2] || choices[Math.floor(Math.random() * 3)];

let result, winAmount;
if (userChoice === botChoice) {
result = "تعادل";
winAmount = 0;
} else if (
(userChoice === "حجر" && botChoice === "مقص") ||
(userChoice === "ورقة" && botChoice === "حجر") ||
(userChoice === "مقص" && botChoice === "ورقة")
) {
result = "فوز";
winAmount = amount;
user.balance += amount;
user.wins++;
} else {
result = "خسارة";
winAmount = -amount;
user.balance -= amount;
user.losses++;
}

saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🎮 حـجـر ورقـة مـقـص\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  🤚 اختيارك: ${userChoice}\n` +
`  🤖 اختيار البوت: ${botChoice}\n` +
`  📊 النتيجة: ${result === "فوز" ? "🎉" : result === "خسارة" ? "💔" : "🤝"} ${result}\n` +
`  💰 ${result === "فوز" ? "ربحت" : result === "خسارة" ? "خسرت" : "لا شيء"}: ${Math.abs(winAmount)}\n` +
`  💰 الرصيد: ${user.balance}\n` +
`  📊 فوز/خسارة: ${user.wins}/${user.losses}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "طاولة" || sub === "طاولة_زهر") {
const amount = parseInt(args[1]);
if (!amount || amount < 500 || amount > 20000) return api.sendMessage("❌ المبلغ من 500 الى 20000", event.threadID);
if (user.balance < amount) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

const dice1 = Math.floor(Math.random() * 6) + 1;
const dice2 = Math.floor(Math.random() * 6) + 1;
const total = dice1 + dice2;
const win = total > 7;

if (win) {
user.balance += amount;
user.wins++;
} else {
user.balance -= amount;
user.losses++;
}

saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🎲 طــاولــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  🎲 النرد: [${dice1}] [${dice2}]\n` +
`  📊 المجموع: ${total}\n` +
`  ${win ? "🎉 فوز" : "💔 خسارة"}\n` +
`  💰 ${win ? "ربحت" : "خسرت"}: ${amount}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🌱 نظام الزراعة
if (sub === "زراعة" || sub === "farm") {
const action = args[1]?.toLowerCase();

if (action === "قائمة" || action === "محاصيل") {
let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🌾 قــائــمـة الــمــحــاصــيــل\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

Object.entries(crops).forEach(([name, data]) => {
msg += `  🌱 ${name}\n`;
msg += `  💰 السعر: ${data.sellPrice}\n`;
msg += `  ⏱️ الوقت: ${data.growTime} د\n`;
msg += `  ━━━━━━━━━━━━━━━━━━\n`;
});
msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (action === "اراضي") {
if (!user.lands || user.lands.length === 0) {
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🌱 لا تملك ارض\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📝 اشتري ارض: زراعة شراء\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}
let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🏞️ قــائــمـة الاراضــي\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

user.lands.forEach((land, i) => {
msg += `  🌱 ارض ${i+1}\n`;
if (land.crop) {
const crop = crops[land.crop];
const passed = (Date.now() - land.plantTime) / (1000 * 60);
if (passed >= crop.growTime) {
msg += `  ✅ جاهز للحصاد\n`;
} else {
msg += `  ⏱️ متبقي ${Math.ceil(crop.growTime - passed)}د\n`;
}
} else {
msg += `  🌿 فارغة\n`;
}
msg += `  ━━━━━━━━━━━━━━━━━━\n`;
});
msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (action === "شراء" || action === "شراء_ارض") {
if (user.balance < shop.ارض.price) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
user.balance -= shop.ارض.price;
if (!user.lands) user.lands = [];
user.lands.push({ crop: null, plantTime: null });
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم شـراء الارض\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  🌱 اشتريت قطعة ارض جديدة\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (action === "ازرع") {
const landIndex = parseInt(args[2]) - 1;
const cropType = args[3];
if (isNaN(landIndex) || !crops[cropType]) return api.sendMessage("❌ استخدم: زراعة ازرع <رقم الارض> <نوع المحصول>", event.threadID);
if (!user.lands || !user.lands[landIndex]) return api.sendMessage("❌ رقم ارض غير صحيح", event.threadID);
if (user.lands[landIndex].crop) return api.sendMessage("❌ الارض مزروعة بالفعل", event.threadID);

const seed = crops[cropType].seed;
if (!user.inventory.includes(seed) && !user.inventory.includes("بذور_"+cropType)) {
return api.sendMessage("❌ لا تملك بذور " + cropType, event.threadID);
}

const seedIndex = user.inventory.indexOf(seed);
if (seedIndex !== -1) user.inventory.splice(seedIndex, 1);

user.lands[landIndex] = {
crop: cropType,
plantTime: Date.now()
};
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🌱 تـم الــزراعــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📍 الارض: ${landIndex+1}\n` +
`  🌾 المحصول: ${cropType}\n` +
`  ⏱️ الوقت: ${crops[cropType].growTime} د\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (action === "حصاد") {
const landIndex = parseInt(args[2]) - 1;
if (isNaN(landIndex)) return api.sendMessage("❌ استخدم: زراعة حصاد <رقم الارض>", event.threadID);
if (!user.lands || !user.lands[landIndex]) return api.sendMessage("❌ رقم ارض غير صحيح", event.threadID);

const land = user.lands[landIndex];
if (!land.crop) return api.sendMessage("❌ هذه الارض فارغة", event.threadID);

const crop = crops[land.crop];
const passed = (Date.now() - land.plantTime) / (1000 * 60);
if (passed < crop.growTime) {
return api.sendMessage(`⏳ متبقي ${Math.ceil(crop.growTime - passed)} دقيقة`, event.threadID);
}

let reward = crop.sellPrice;
if (user.inventory.includes("جرار")) reward *= 2;

user.balance += reward;
user.lands[landIndex] = { crop: null, plantTime: null };
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم الــحصــاد\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  🌾 المحصول: ${land.crop}\n` +
`  💰 الربح: ${reward}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🌾 نــظــام الــزراعــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📝 زراعة قائمة\n` +
`  📝 زراعة اراضي\n` +
`  📝 زراعة شراء\n` +
`  📝 زراعة ازرع <رقم> <نوع>\n` +
`  📝 زراعة حصاد <رقم>\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// ⛏️ نظام التنقيب
if (sub === "تنقيب" || sub === "mine") {
const now = Date.now();
const cooldown = user.inventory.includes("معول") ? 10 * 60 * 1000 : 15 * 60 * 1000;
const hasMap = user.inventory.includes("خريطة");
const hasDynamite = user.inventory.includes("ديناميت");

if (now - (user.lastMine || 0) < cooldown) {
const remaining = Math.ceil((cooldown - (now - (user.lastMine || 0))) / 60000);
return api.sendMessage(`⏳ متبقي ${remaining} دقيقة`, event.threadID);
}

let multiplier = 1;
if (hasDynamite) {
multiplier = 3;
const index = user.inventory.indexOf("ديناميت");
if (index !== -1) user.inventory.splice(index, 1);
} else if (user.inventory.includes("معول")) {
multiplier = 2;
}

const foundResources = {};
const resources = hasMap ? ["ذهب", "فضة", "حجر", "الماس", "زمرد", "ياقوت", "نحاس", "حديد"] : ["ذهب", "فضة", "حجر", "نحاس", "حديد"];

resources.forEach(r => {
let amount = 0;
if (r === "ذهب") amount = Math.floor(Math.random() * 5) * multiplier;
else if (r === "فضة") amount = Math.floor(Math.random() * 10) * multiplier;
else if (r === "حجر") amount = Math.floor(Math.random() * 15) * multiplier;
else if (r === "الماس") amount = Math.floor(Math.random() * 2) * multiplier;
else if (r === "زمرد") amount = Math.floor(Math.random() * 3) * multiplier;
else if (r === "ياقوت") amount = Math.floor(Math.random() * 1) * multiplier;
else if (r === "نحاس") amount = Math.floor(Math.random() * 8) * multiplier;
else if (r === "حديد") amount = Math.floor(Math.random() * 6) * multiplier;
foundResources[r] = amount;
});

Object.keys(foundResources).forEach(k => user.resources[k] += foundResources[k]);
user.lastMine = now;
saveData(data);

let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ⛏️ نــتــائــج الــتــنــقــيــب\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

Object.entries(foundResources).forEach(([k, v]) => {
if (v > 0) msg += `  💎 ${k}: +${v}\n`;
});
msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (sub === "منجم" || sub === "mine_level") {
let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ⚒️ مــعــلــومــات الــمــنــجــم\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📊 مستوى المنجم: ${user.mineLevel || 1}\n` +
`  💰 الذهب: ${user.resources.ذهب}\n` +
`  💰 الفضة: ${user.resources.فضة}\n` +
`  🪨 الحجر: ${user.resources.حجر}\n`;

if (user.resources.الماس) msg += `  💎 الماس: ${user.resources.الماس}\n`;
if (user.resources.زمرد) msg += `  💚 زمرد: ${user.resources.زمرد}\n`;
if (user.resources.ياقوت) msg += `  ❤️ ياقوت: ${user.resources.ياقوت}\n`;
if (user.resources.نحاس) msg += `  🔴 نحاس: ${user.resources.نحاس}\n`;
if (user.resources.حديد) msg += `  ⚙️ حديد: ${user.resources.حديد}\n`;

msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (sub === "تطوير_منجم" || sub === "upgrade_mine") {
const cost = (user.mineLevel || 1) * 10000;
if (user.balance < cost) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
user.balance -= cost;
user.mineLevel = (user.mineLevel || 1) + 1;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ⚒️ تـم تـطـويـر الـمـنـجـم\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📊 المنجم اصبح مستوى ${user.mineLevel}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🏪 المتجر والسوق
if (sub === "متجر" || sub === "shop") {
let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🏪 الــمــتــجــر\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

Object.entries(shop).forEach(([k, v]) => {
msg += `  ${k}\n`;
msg += `  💰 ${v.price} | ${v.desc}\n`;
msg += `  ━━━━━━━━━━━━━━━━━━\n`;
});
msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (sub === "شراء" || sub === "buy") {
const item = args.slice(1).join(" ");
if (!shop[item]) return api.sendMessage("❌ المنتج غير موجود", event.threadID);
if (user.balance < shop[item].price) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

user.balance -= shop[item].price;
user.inventory.push(item);
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم الــشــراء\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📦 المنتج: ${item}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "سوق" || sub === "blackmarket") {
if (args[1] === "بيع" || args[1] === "sell") {
const resource = args[2];
const amount = parseInt(args[3]) || 1;
if (!blackMarketPrices[resource] || user.resources[resource] < amount) {
return api.sendMessage("❌ كمية غير كافية", event.threadID);
}
const money = blackMarketPrices[resource] * amount;
user.balance += money;
user.resources[resource] -= amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    💰 تـم الــبــيــع\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💎 ${amount} ${resource}\n` +
`  💰 الربح: ${money}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🌑 الــســوق الــســوداء\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

Object.entries(blackMarketPrices).forEach(([k, v]) => {
msg += `  💎 ${k}: ${v} 💰\n`;
});
msg += `\n  📝 للبيع: سوق بيع <النوع> <الكمية>\n\n`;
msg += `╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

if (sub === "مخزون" || sub === "inventory") {
let inventoryList = user.inventory.length > 0 ? user.inventory.join("\n  • ") : "فارغة";
let resourcesList = Object.entries(user.resources)
.filter(([_, v]) => v > 0)
.map(([k, v]) => `${k}: ${v}`)
.join("\n  • ") || "لا يوجد";

return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🎒 الــمــخــزون\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📦 الادوات:\n  • ${inventoryList}\n\n` +
`  💎 الموارد:\n  • ${resourcesList}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🏦 نظام البنك
if (sub === "بنك" || sub === "bank") {
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🏦 الــبــنــك\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 رصيدك: ${user.balance}\n` +
`  🏦 رصيد البنك: ${user.bank || 0}\n` +
`  💳 القرض: ${user.loan || 0}\n` +
`  ━━━━━━━━━━━━━━━━━━\n` +
`  📝 ايداع [مبلغ]\n` +
`  📝 سحب [مبلغ]\n` +
`  📝 قرض [مبلغ]\n` +
`  📝 سداد [مبلغ]\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "ايداع" || sub === "deposit") {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return api.sendMessage("❌ ادخل مبلغ صحيح", event.threadID);
if (user.balance < amount) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

user.balance -= amount;
user.bank = (user.bank || 0) + amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم الإيــداع\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 المبلغ: ${amount}\n` +
`  🏦 رصيد البنك: ${user.bank}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "سحب" || sub === "withdraw") {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return api.sendMessage("❌ ادخل مبلغ صحيح", event.threadID);
if ((user.bank || 0) < amount) return api.sendMessage("❌ رصيد البنك غير كافي", event.threadID);

user.balance += amount;
user.bank = (user.bank || 0) - amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم الــســحــب\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 المبلغ: ${amount}\n` +
`  🏦 رصيد البنك: ${user.bank}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "قرض" || sub === "loan") {
const now = Date.now();
if (user.loan > 0) {
if (now - (user.loanTime || 0) < 24 * 60 * 60 * 1000) {
const remaining = 24 * 60 * 60 * 1000 - (now - (user.loanTime || 0));
const hours = Math.floor(remaining / (1000 * 60 * 60));
return api.sendMessage(`⏳ عليك قرض قديم. متبقي ${hours} ساعة`, event.threadID);
}
}

const amount = parseInt(args[1]);
if (!amount || amount < 1000 || amount > 50000) return api.sendMessage("❌ مبلغ القرض من 1000 الى 50000", event.threadID);

user.loan = amount;
user.loanTime = now;
user.balance += amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    💳 تـم أخـذ الـقـرض\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 المبلغ: ${amount}\n` +
`  ⏱️ مدة السداد: 24 ساعة\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "سداد" || sub === "payloan") {
if (!user.loan || user.loan <= 0) return api.sendMessage("❌ لا يوجد قرض عليك", event.threadID);

const amount = parseInt(args[1]) || user.loan;
if (amount > user.balance) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
if (amount > user.loan) return api.sendMessage("❌ المبلغ اكبر من القرض", event.threadID);

user.balance -= amount;
user.loan -= amount;
if (user.loan <= 0) {
user.loan = 0;
user.loanTime = 0;
}

saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم ســداد الـقـرض\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 المبلغ: ${amount}\n` +
`  💳 القرض المتبقي: ${user.loan}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🎁 المكافآت اليومية
if (sub === "يومي" || sub === "daily") {
const now = Date.now();
if (now - (user.lastDaily || 0) < 24 * 60 * 60 * 1000) {
const remaining = 24 * 60 * 60 * 1000 - (now - (user.lastDaily || 0));
const hours = Math.floor(remaining / (1000 * 60 * 60));
const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
return api.sendMessage(`⏳ متبقي ${hours}س ${minutes}د`, event.threadID);
}

const reward = Math.floor(Math.random() * (DAILY_MAX - DAILY_MIN + 1)) + DAILY_MIN;
user.balance += reward;
user.lastDaily = now;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🎁 الــمــكــافــأة الــيــومــيــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 حصلت على: ${reward}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "فكة" || sub === "waste") {
if (user.balance < 10) return api.sendMessage("❌ رصيد قليل جداً", event.threadID);
const amount = Math.floor(Math.random() * Math.min(user.balance, 500)) + 1;
user.balance -= amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    💸 فــكــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 خسرت: ${amount}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

if (sub === "صمة" || sub === "gift") {
const amount = Math.floor(Math.random() * 1000) + 50;
user.balance += amount;
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    🎁 صــمــة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  💰 حصلت على: ${amount}\n` +
`  💰 الرصيد: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 💸 تحويل
if (sub === "تحويل" || sub === "transfer") {
const mentions = Object.keys(event.mentions);
if (mentions.length === 0) return api.sendMessage("❌ منشن الشخص", event.threadID);

const targetID = mentions[0];
const amount = parseInt(args[2]);
if (!amount || amount <= 0) return api.sendMessage("❌ ادخل مبلغ صحيح", event.threadID);
if (user.balance < amount) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
if (!data[targetID]) return api.sendMessage("❌ الشخص غير مسجل", event.threadID);

user.balance -= amount;
data[targetID].balance += amount;
saveData(data);

const targetName = await Users.getNameUser(targetID);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    ✅ تـم الـتـحــويــل\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  👤 الى: ${targetName}\n` +
`  💰 المبلغ: ${amount}\n` +
`  💰 رصيدك: ${user.balance}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🏆 الاغنياء
if (sub === "اغنياء" || sub === "rich" || sub === "توب") {
const usersArray = Object.values(data);
const top = usersArray.sort((a,b) => (b.balance + (b.bank || 0)) - (a.balance + (a.bank || 0))).slice(0,10);

let msg = 
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    👑 قــائــمــة الأغــنــيــاء\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n`;

top.forEach((u, i) => {
const total = u.balance + (u.bank || 0);
msg += `  ${i+1}. ${u.name}\n`;
msg += `  💰 ${total}\n`;
msg += `  ━━━━━━━━━━━━━━━━━━\n`;
});
msg += `\n╰━━━━━━━━━━━━━━━━━━╯`;
return api.sendMessage(msg, event.threadID);
}

// 📊 احصائيات
if (sub === "احصائيات" || sub === "stats" || sub === "معلوماتي") {
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    📊 احــصــائــيــاتــك\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  👤 الاسم: ${user.name}\n` +
`  📍 المنطقة: ${user.region}\n` +
`  📊 المستوى: ${user.level}\n` +
`  ⭐ خبرة: ${user.exp}/${user.level * 1000}\n` +
`  💰 الرصيد: ${user.balance}\n` +
`  🏦 البنك: ${user.bank || 0}\n` +
`  💼 الوظيفة: ${user.job}\n` +
`  🌱 اراضي: ${user.lands ? user.lands.length : 0}\n` +
`  ⛏️ منجم: مستوى ${user.mineLevel || 1}\n` +
`  🎮 فوز/خسارة: ${user.wins || 0}/${user.losses || 0}\n` +
`  📦 ادوات: ${user.inventory.length}\n` +
`  💎 موارد: ${Object.values(user.resources).reduce((a,b) => a + b, 0)}\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 🚪 مغادرة
if (sub === "مغادرة" || sub === "حذف" || sub === "delete") {
delete data[userID];
saveData(data);
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    👋 تـم الــمــغــادرة\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +
`  📝 تم حذف بياناتك\n` +
`  📝 للتسجيل مجدداً: تسجيل\n\n` +
`╰━━━━━━━━━━━━━━━━━━╯`, event.threadID);
}

// 📋 عرض الاوامر اذا لم يتعرف على الامر
return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮\n` +
`    📋 قــائــمــة الاوامـــــر\n` +
`╰━━━━━━━━━━━━━━━━━━╯\n\n` +

`┏━━━━ 「 💼 الــوظــائــف 」 ━━━━┓\n` +
`┃  وظايف • اختيار • عمل • ترك\n` +
`┃  وظيفة • ترقية\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🌾 الــزراعــة 」 ━━━━┓\n` +
`┃  زراعة • محاصيل • اراضي\n` +
`┃  ازرع • حصاد • شراء_ارض\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 ⛏️ الــتـنـقـيـب 」 ━━━━┓\n` +
`┃  تنقيب • منجم • تطوير_منجم\n` +
`┃  سوق • بيع • خريطة\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🏪 الــمـتـجـر 」 ━━━━┓\n` +
`┃  متجر • شراء • مخزون\n` +
`┃  بنك • ايداع • سحب • قرض\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 🎮 الــعــاب 」 ━━━━┓\n` +
`┃  حجر_ورقة_مقص • طاولة\n` +
`┃  دومينو • شطرنج • ورق\n` +
`┃  رهان • فكة • صمة\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`┏━━━━ 「 👤 مــلــفــي 」 ━━━━┓\n` +
`┃  ملفي • اغنياء • احصائيات\n` +
`┃  تحويل • يومي • معلوماتي\n` +
`┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +

`╰━━━━━━━━━━━━━━━━━━╯\n` +
`  📝 للاستفسار: اوامر`, event.threadID);
};
