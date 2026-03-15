const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "سلاحي",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Dante Sparda",
  description: "بيختار ليك سلاح عشوائي لمواجهة الزومبي",
  commandCategory: "ترفيه",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    const cachePath = __dirname + "/cache/weapon.jpg";

    try {
        // بيانات عشوائية للمواجهة
        const zombieCount = Math.floor(Math.random() * 200) + 10; // عدد الزومبي
        const bullets = Math.floor(Math.random() * 100) + 1;     // عدد الطلقات
        const survivalRate = Math.floor(Math.random() * 101);    // نسبة النجاة
        
        const userData = await Users.getData(senderID);
        const name = userData.name;

        // قائمة الأسلحة (روابط مباشرة ومحدثة)
        const weapons = [
            "https://pubgarabia.com/wp-content/uploads/2018/10/pubg_weapon_m416_1-1024x517.jpg",
            "https://static1-arabia.millenium.gg/articles/7/14/37/@/8163-68712-1188612-m4a1-orig-1-orig-2-amp_main_img-1.png",
            "https://cdni.rt.com/media/pics/2013.12/orig/670358.jpg",
            "https://png.pngtree.com/png-vector/20210313/ourlarge/pngtree-shoes-rubber-flip-flops-daily-necessities-household-png-image_3052390.jpg", // السفنجة الشهيرة
            "https://www.oqily.com/image/cache/catalog/Product-2019/Shoes/%D9%86%D8%B9%D8%A7%D9%84-sl-0079-3-1000x1000.jpg",
            "https://m.media-amazon.com/images/I/31-kXCquEoL._AC_SY1000_.jpg",
            "https://images-na.ssl-images-amazon.com/images/I/41Wf7mmaxFL.jpg"
        ];

        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

        // جلب الصورة
        const response = await axios.get(randomWeapon, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(response.data, "utf-8"));

        // تعليق سوداني بناءً على نسبة النجاة
        let comment = "";
        if (survivalRate > 80) comment = "أبشر يا وحش.. حتفرتكهم فرتكة! 🔥";
        else if (survivalRate > 40) comment = "وضعك نص نص، ركز في الراس بس 🔫";
        else comment = "يا زول أرفع جليبياتك وأجري.. الموت جاك! 🏃‍♂️💨";

        const msg = {
            body: `┌─── • [ 🧟 غارة الزومبي ] • ───┐\n\nيا ${name}، الزومبي حاصروك!\n\n─ عدد الزومبي: ${zombieCount}\n─ الطلقات المعاك: ${bullets}\n─ فرصة نجاوتك: ${survivalRate}%\n\nسلاحك الميداني هو الصُورة دي 👇\n\n${comment}\n\n└──────────────────────────┘`,
            attachment: fs.createReadStream(cachePath)
        };

        return api.sendMessage(msg, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("يا زول السلاح علّق، جرب مرة تانية!", threadID, messageID);
    }
};
