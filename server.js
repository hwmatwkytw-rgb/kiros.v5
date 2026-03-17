const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🤖 بوت سيكو شغال ✅");
});

// إضافة مسار للتحقق من حالة البوت
app.get("/status", (req, res) => {
  res.json({
    status: "running",
    time: new Date().toLocaleString("ar-EG"),
    bot: "Saiko Bot"
  });
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
