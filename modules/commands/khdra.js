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

// الوظائف
const jobs = {
"توصيل": { min: 800, max: 1800 },
"حارس": { min: 1000, max: 2200 },
"تاجر": { min: 1200, max: 2600 },
"سائق": { min: 900, max: 2000 },
"مزارع": { min: 700, max: 1600 },
"صياد": { min: 1100, max: 2400 },
"ميكانيكي": { min: 1300, max: 2800 },
"طبيب": { min: 2000, max: 4000 },
"مبرمج": { min: 1800, max: 3500 },
"ضابط": { min: 1600, max: 3200 }
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
const regions = ["الخرطوم", "أم درمان", "بحري", "كسلا", "دنقلا", "الفاشر", "ود مدني", "بورتسودان"];

// اسعار السوق السوداء
const blackMarketPrices = { "ذهب": 5000, "فضة": 2000, "حجر": 500, "الماس": 15000, "زمرد": 8000, "ياقوت": 12000 };

module.exports.config = {
name: "اقتصاد",
version: "10.0.0",
hasPermssion: 0,
credits: "محمد إدريس",
description: "نظام اقتصاد متكامل: زراعة + تنقيب + وظائف + متجر",
commandCategory: "اقتصاد",
usages: "[الامر]",
cooldowns: 2,
usePrefix: false
};

module.exports.run = async function({ api, event, args, Users }) {
const userID = event.senderID;
const userName = await Users.getNameUser(userID);
let data = loadData();
const sub = args[0];
const user = data[userID];

// 🟢 تسجيل
if (sub === "سجلني") {
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
resources: { ذهب: 0, فضة: 0, حجر: 0, الماس: 0, زمرد: 0, ياقوت: 0 },
lastMine: 0,
farm: null,
lands: [],
mineLevel: 1
};
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  ✅ تم التسجيل\n◉─━━━━━━━━─◉\n\n⫸ الاسم: ${chosenName}\n⫸ المنطقة: ${region}\n⫸ الرصيد: 1000 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

if (!user) return api.sendMessage("◉─━━━━━━━━─◉\n  ⚠️ غير مسجل\n◉─━━━━━━━━─◉\n\n⫸ للتسجيل: سجلني <اسمك>\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);

// 🌱 نظام الزراعة المتكامل
if (sub === "زراعة") {
const action = args[1];

if (action === "قائمة") {
let msg = "◉─━━━━━━━━─◉\n  🌾 المحاصيل\n◉─━━━━━━━━─◉\n\n";
Object.entries(crops).forEach(([k, v]) => {
msg += `⫸ ${k}\n  💰 ${v.sellPrice} | ⏱️ ${v.growTime}د\n`;
});
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (action === "اراضي") {
if (!user.lands || user.lands.length === 0) {
return api.sendMessage("◉─━━━━━━━━─◉\n  🌱 لا تملك ارض\n◉─━━━━━━━━─◉\n\n⫸ اشتري ارض: زراعة شراء\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);
}
let msg = "◉─━━━━━━━━─◉\n  🏞️ اراضيك\n◉─━━━━━━━━─◉\n\n";
user.lands.forEach((land, i) => {
msg += `⫸ ارض ${i+1}\n`;
if (land.crop) {
const crop = crops[land.crop];
const passed = (Date.now() - land.plantTime) / (1000 * 60);
if (passed >= crop.growTime) {
msg += `  ✅ جاهز للحصاد\n`;
} else {
msg += `  ⏱️ متبقي ${Math.ceil(crop.growTime - passed)}د\n`;
}
} else {
msg += `  🌱 فارغة\n`;
}
});
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (action === "شراء") {
if (user.balance < shop.ارض.price) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
user.balance -= shop.ارض.price;
if (!user.lands) user.lands = [];
user.lands.push({ crop: null, plantTime: null });
saveData(data);
return api.sendMessage("◉─━━━━━━━━─◉\n  ✅ تم الشراء\n◉─━━━━━━━━─◉\n\n⫸ اشتريت قطعة ارض جديدة\n⫸ الرصيد: " + user.balance + " 💰\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);
}

if (action === "تطوير") {
if (user.balance < shop.جرار.price) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
user.balance -= shop.جرار.price;
user.inventory.push("جرار");
saveData(data);
return api.sendMessage("◉─━━━━━━━━─◉\n  🚜 تم التطوير\n◉─━━━━━━━━─◉\n\n⫸ اشتريت جرار زراعي\n⫸ يضاعف الانتاج\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);
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
return api.sendMessage(`◉─━━━━━━━━─◉\n  🌱 تم الزراعة\n◉─━━━━━━━━─◉\n\n⫸ الارض: ${landIndex+1}\n⫸ المحصول: ${cropType}\n⫸ الوقت: ${crops[cropType].growTime}د\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
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
return api.sendMessage(`◉─━━━━━━━━─◉\n  ✅ تم الحصاد\n◉─━━━━━━━━─◉\n\n⫸ المحصول: ${land.crop}\n⫸ الربح: ${reward} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

return api.sendMessage("◉─━━━━━━━━─◉\n  🌾 الزراعة\n◉─━━━━━━━━─◉\n\n⫸ زراعة قائمة\n⫸ زراعة اراضي\n⫸ زراعة شراء\n⫸ زراعة تطوير\n⫸ زراعة ازرع <رقم> <نوع>\n⫸ زراعة حصاد <رقم>\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);
}

// ⛏️ نظام التنقيب والمناجم
if (sub === "تنقيب") {
const now = Date.now();
const cooldown = user.inventory.includes("معول") ? 10 * 60 * 1000 : 15 * 60 * 1000;
const hasMap = user.inventory.includes("خريطة");
const hasDynamite = user.inventory.includes("ديناميت");

if (now - user.lastMine < cooldown) {
const remaining = Math.ceil((cooldown - (now - user.lastMine)) / 60000);
return api.sendMessage(`⏳ متبقي ${remaining} دقيقة`, event.threadID);
}

let multiplier = 1;
if (hasDynamite) {
multiplier = 3;
user.inventory.splice(user.inventory.indexOf("ديناميت"), 1);
} else if (user.inventory.includes("معول")) {
multiplier = 2;
}

const foundResources = {};
const resources = hasMap ? ["ذهب", "فضة", "حجر", "الماس", "زمرد", "ياقوت"] : ["ذهب", "فضة", "حجر"];

resources.forEach(r => {
let amount = 0;
if (r === "ذهب") amount = Math.floor(Math.random() * 5) * multiplier;
else if (r === "فضة") amount = Math.floor(Math.random() * 10) * multiplier;
else if (r === "حجر") amount = Math.floor(Math.random() * 15) * multiplier;
else if (r === "الماس") amount = Math.floor(Math.random() * 2) * multiplier;
else if (r === "زمرد") amount = Math.floor(Math.random() * 3) * multiplier;
else if (r === "ياقوت") amount = Math.floor(Math.random() * 1) * multiplier;
foundResources[r] = amount;
});

Object.keys(foundResources).forEach(k => user.resources[k] += foundResources[k]);
user.lastMine = now;
saveData(data);

let msg = "◉─━━━━━━━━─◉\n  ⛏️ نتائج التنقيب\n◉─━━━━━━━━─◉\n\n";
Object.entries(foundResources).forEach(([k, v]) => {
if (v > 0) msg += `⫸ ${k}: +${v}\n`;
});
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (sub === "منجم") {
let msg = "◉─━━━━━━━━─◉\n  ⚒️ منجمك\n◉─━━━━━━━━─◉\n\n";
msg += `⫸ مستوى المنجم: ${user.mineLevel || 1}\n`;
msg += `⫸ الذهب: ${user.resources.ذهب}\n`;
msg += `⫸ الفضة: ${user.resources.فضة}\n`;
msg += `⫸ الحجر: ${user.resources.حجر}\n`;
if (user.resources.الماس) msg += `⫸ الماس: ${user.resources.الماس}\n`;
if (user.resources.زمرد) msg += `⫸ زمرد: ${user.resources.زمرد}\n`;
if (user.resources.ياقوت) msg += `⫸ ياقوت: ${user.resources.ياقوت}\n`;
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (sub === "تطوير_منجم") {
const cost = (user.mineLevel || 1) * 10000;
if (user.balance < cost) return api.sendMessage("❌ رصيد غير كافي", event.threadID);
user.balance -= cost;
user.mineLevel = (user.mineLevel || 1) + 1;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  ⚒️ تم التطوير\n◉─━━━━━━━━─◉\n\n⫸ المنجم اصبح مستوى ${user.mineLevel}\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

// 📋 الوظائف
if (sub === "وظائف") {
let msg = "◉─━━━━━━━━─◉\n  💼 الوظائف\n◉─━━━━━━━━─◉\n\n";
Object.keys(jobs).forEach(j => msg += `⫸ ${j}\n`);
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (sub === "اختيار") {
const jobName = args.slice(1).join(" ");
if (!jobs[jobName]) return api.sendMessage("❌ وظيفة غير موجودة", event.threadID);
user.job = jobName;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  ✅ تم الاختيار\n◉─━━━━━━━━─◉\n\n⫸ وظيفتك: ${jobName}\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

if (sub === "عمل") {
if (user.job === "عاطل") return api.sendMessage("❌ اختر وظيفة اولاً", event.threadID);
const now = Date.now();
if (now - user.lastWork < 5 * 60 * 1000) return api.sendMessage("⏳ انتظر 5 دقائق", event.threadID);

const job = jobs[user.job];
let reward = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
let multiplier = 1;
user.inventory.forEach(i => { if(itemEffects[i]) multiplier += itemEffects[i]; });

reward = Math.floor(reward * multiplier);
user.balance += reward;
user.lastWork = now;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  💼 نتيجة العمل\n◉─━━━━━━━━─◉\n\n⫸ الوظيفة: ${user.job}\n⫸ الربح: ${reward} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

// 🏪 المتجر والسوق
if (sub === "متجر") {
let msg = "◉─━━━━━━━━─◉\n  🏪 المتجر\n◉─━━━━━━━━─◉\n\n";
Object.entries(shop).forEach(([k, v]) => {
msg += `⫸ ${k}\n  💰 ${v.price} | ${v.desc}\n`;
});
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

if (sub === "شراء") {
const item = args.slice(1).join(" ");
if (!shop[item]) return api.sendMessage("❌ المنتج غير موجود", event.threadID);
if (user.balance < shop[item].price) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

user.balance -= shop[item].price;
user.inventory.push(item);
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  ✅ تم الشراء\n◉─━━━━━━━━─◉\n\n⫸ المنتج: ${item}\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

if (sub === "سوق") {
if (args[1] === "بيع") {
const resource = args[2];
const amount = parseInt(args[3]) || 1;
if (!blackMarketPrices[resource] || user.resources[resource] < amount) {
return api.sendMessage("❌ كمية غير كافية", event.threadID);
}
const money = blackMarketPrices[resource] * amount;
user.balance += money;
user.resources[resource] -= amount;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  💰 تم البيع\n◉─━━━━━━━━─◉\n\n⫸ ${amount} ${resource}\n⫸ الربح: ${money} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}
let msg = "◉─━━━━━━━━─◉\n  🌑 السوق السوداء\n◉─━━━━━━━━─◉\n\n";
Object.entries(blackMarketPrices).forEach(([k, v]) => {
msg += `⫸ ${k}: ${v} 💰\n`;
});
msg += "\n⫸ للبيع: سوق بيع <النوع> <الكمية>\n\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

// 🎒 الحقيبة
if (sub === "حقيبة") {
let msg = "◉─━━━━━━━━─◉\n  🎒 حقيبتك\n◉─━━━━━━━━─◉\n\n";
msg += `⫸ الاسم: ${user.name}\n`;
msg += `⫸ الرصيد: ${user.balance} 💰\n`;
msg += `⫸ الوظيفة: ${user.job}\n`;
msg += `⫸ المنطقة: ${user.region}\n`;
msg += `⫸ الادوات: ${user.inventory.join(" • ") || "فارغة"}\n`;
msg += `⫸ الاراضي: ${user.lands ? user.lands.length : 0}\n`;
msg += `⫸ المنجم: مستوى ${user.mineLevel || 1}\n`;
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

// 🏆 الاغنياء
if (sub === "اغنياء") {
const usersArray = Object.values(data);
const top = usersArray.sort((a,b) => b.balance - a.balance).slice(0,7);
let msg = "◉─━━━━━━━━─◉\n  👑 الاغنياء\n◉─━━━━━━━━─◉\n\n";
top.forEach((u, i) => {
msg += `⫸ ${i+1}. ${u.name}\n  💰 ${u.balance}\n`;
});
msg += "\n▰▰▰▰▰▰▰▰▰▰";
return api.sendMessage(msg, event.threadID);
}

// 🎁 يومي
if (sub === "يومي") {
const now = Date.now();
if (now - (user.lastDaily || 0) < 24 * 60 * 60 * 1000) {
const remaining = 24 * 60 * 60 * 1000 - (now - user.lastDaily);
const hours = Math.floor(remaining / (1000 * 60 * 60));
const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
return api.sendMessage(`⏳ متبقي ${hours}س ${minutes}د`, event.threadID);
}
const reward = Math.floor(Math.random() * (DAILY_MAX - DAILY_MIN + 1)) + DAILY_MIN;
user.balance += reward;
user.lastDaily = now;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  🎁 المكافأة اليومية\n◉─━━━━━━━━─◉\n\n⫸ حصلت على: ${reward} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

// 🚪 مغادرة
if (sub === "مغادرة" || sub === "حذف") {
delete data[userID];
saveData(data);
return api.sendMessage("◉─━━━━━━━━─◉\n  👋 تم المغادرة\n◉─━━━━━━━━─◉\n\n⫸ تم حذف بياناتك\n⫸ للتسجيل مجدداً: سجلني\n\n▰▰▰▰▰▰▰▰▰▰", event.threadID);
}

// 🎲 رهان
if (sub === "رهان") {
const amount = parseInt(args[1]);
if (!amount || amount <= 0) return api.sendMessage("❌ حدد مبلغ الرهان", event.threadID);
if (user.balance < amount) return api.sendMessage("❌ رصيد غير كافي", event.threadID);

const win = Math.random() < 0.5;
if (win) {
user.balance += amount;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  🎉 فوز\n◉─━━━━━━━━─◉\n\n⫸ ربحت: ${amount} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
} else {
user.balance -= amount;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  💔 خسارة\n◉─━━━━━━━━─◉\n\n⫸ خسرت: ${amount} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}
}

// 💸 فكة
if (sub === "فكة") {
if (user.balance < 10) return api.sendMessage("❌ رصيد قليل جداً", event.threadID);
const amount = Math.floor(Math.random() * Math.min(user.balance, 500)) + 1;
user.balance -= amount;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  💸 فكة\n◉─━━━━━━━━─◉\n\n⫸ خسرت: ${amount} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

// 🎁 صمة
if (sub === "صمة") {
const amount = Math.floor(Math.random() * 1000) + 50;
user.balance += amount;
saveData(data);
return api.sendMessage(`◉─━━━━━━━━─◉\n  🎁 صمة\n◉─━━━━━━━━─◉\n\n⫸ حصلت على: ${amount} 💰\n⫸ الرصيد: ${user.balance} 💰\n\n▰▰▰▰▰▰▰▰▰▰`, event.threadID);
}

// 📋 الاوامر
return api.sendMessage(
`◉─━━━━━━━━─◉\n  📋 الاوامر\n◉─━━━━━━━━─◉\n\n` +
`⫸ سجلني <اسمك>\n` +
`⫸ وظائف • اختيار • عمل\n` +
`⫸ زراعة (قائمة/اراضي/شراء/تطوير/ازرع/حصاد)\n` +
`⫸ تنقيب • منجم • تطوير_منجم\n` +
`⫸ متجر • شراء • سوق • سوق بيع\n` +
`⫸ حقيبة • اغنياء • يومي\n` +
`⫸ رهان • فكة • صمة\n` +
`⫸ مغادرة\n\n` +
`▰▰▰▰▰▰▰▰▰▰`,
event.threadID
);
};
