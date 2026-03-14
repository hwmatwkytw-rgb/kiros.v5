# 🤝 دليل المساهمة في N-Dora Bot

شكراً لاهتمامك بالمساهمة في مشروع N-Dora Bot! هذا الدليل سيساعدك على فهم كيفية المساهمة بشكل فعال.

---

## 📋 قبل البدء

تأكد من أن لديك:
- حساب GitHub
- Node.js v16.0.0 أو أحدث
- فهم أساسي لـ JavaScript
- معرفة بـ Git

---

## 🚀 خطوات المساهمة

### 1. Fork المستودع
انقر على زر Fork في الأعلى اليمين من صفحة المستودع.

### 2. استنساخ المستودع المفروك
```bash
git clone https://github.com/your-username/N-Dora.git
cd N-Dora
```

### 3. إنشاء فرع جديد
```bash
git checkout -b feature/your-feature-name
```

استخدم أسماء واضحة للفروع:
- `feature/new-command` - لميزة جديدة
- `fix/bug-name` - لإصلاح خطأ
- `docs/update-readme` - لتحديث التوثيق

### 4. إجراء التغييرات
قم بتعديل الملفات المطلوبة وأضف الميزات الجديدة.

### 5. Commit التغييرات
```bash
git add .
git commit -m "وصف واضح للتغييرات"
```

استخدم رسائل commit واضحة:
- `feat: إضافة أمر جديد`
- `fix: إصلاح خطأ في الأمر`
- `docs: تحديث التوثيق`
- `refactor: تحسين الكود`

### 6. Push إلى GitHub
```bash
git push origin feature/your-feature-name
```

### 7. فتح Pull Request
1. اذهب إلى المستودع الأصلي
2. انقر على "New Pull Request"
3. اختر فرعك والفرع الرئيسي
4. اكتب وصفاً مفصلاً للتغييرات
5. انقر على "Create Pull Request"

---

## 📝 معايير الكود

### تنسيق الملفات
```javascript
// 1. استيراد المكتبات
const axios = require('axios');
const formatter = require('../../../utils/formatter');

// 2. تصدير الإعدادات
module.exports.config = {
  name: "اسم الأمر",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "اسمك",
  description: "وصف الأمر",
  commandCategory: "الفئة",
  usages: "[المعاملات]",
  cooldowns: 5,
  envConfig: {}
};

// 3. اللغات المدعومة
module.exports.languages = {
  "ar": {
    "key": "القيمة"
  },
  "en": {
    "key": "value"
  }
};

// 4. دالة التشغيل الرئيسية
module.exports.run = async function ({ api, event, args, getText }) {
  // الكود هنا
};

// 5. معالج الأحداث (اختياري)
module.exports.handleEvent = function ({ api, event, getText }) {
  // الكود هنا
};
```

### معايير التسمية
- استخدم camelCase للمتغيرات والدوال
- استخدم PascalCase للـ Classes
- استخدم UPPER_CASE للثوابت
- استخدم أسماء واضحة ومعبرة

### التعليقات
```javascript
// تعليق واحد
/* تعليق متعدد
   الأسطر */

/**
 * وصف الدالة
 * @param {type} param - وصف المعامل
 * @returns {type} وصف القيمة المرجعة
 */
```

### معالجة الأخطاء
```javascript
try {
  // الكود
} catch (error) {
  console.error('وصف الخطأ:', error);
  return api.sendMessage(
    formatter.error(getText("error"), error.message),
    threadID,
    messageID
  );
}
```

---

## 🎨 إضافة أمر جديد

### الخطوة 1: إنشاء ملف الأمر
```bash
touch modules/commands/Category/commandname.js
```

### الخطوة 2: استخدام القالب
```javascript
const formatter = require('../../../utils/formatter');

module.exports.config = {
  name: "اسم",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "اسمك",
  description: "وصف",
  commandCategory: "الفئة",
  usages: "[المعاملات]",
  cooldowns: 5,
  envConfig: {}
};

module.exports.languages = {
  "ar": {
    "loading": "جاري المعالجة...",
    "error": "حدث خطأ",
    "success": "تم بنجاح"
  },
  "en": {
    "loading": "Processing...",
    "error": "An error occurred",
    "success": "Success"
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  
  try {
    // الكود هنا
    return api.sendMessage(
      formatter.success(getText("success")),
      threadID,
      messageID
    );
  } catch (error) {
    return api.sendMessage(
      formatter.error(getText("error"), error.message),
      threadID,
      messageID
    );
  }
};
```

### الخطوة 3: اختبار الأمر
```bash
npm start
```

---

## 🐛 إصلاح الأخطاء

### خطوات الإبلاغ عن خطأ
1. تحقق من أن الخطأ موجود فعلاً
2. ابحث عن issues مشابهة
3. أنشئ issue جديد مع:
   - وصف واضح للخطأ
   - خطوات إعادة إنتاج الخطأ
   - السلوك المتوقع
   - السلوك الفعلي
   - معلومات البيئة (Node version, OS, إلخ)

### خطوات إصلاح الخطأ
1. أنشئ فرع: `fix/bug-description`
2. أصلح الخطأ مع إضافة تعليقات
3. أضف اختبارات إن أمكن
4. اكتب رسالة commit واضحة
5. فتح Pull Request

---

## 📚 تحديث التوثيق

### تحديث README.md
- أضف الأوامر الجديدة في جدول الأوامر
- حدّث قائمة الميزات
- أضف أمثلة للاستخدام

### تحديث CHANGELOG.md
- أضف إدخال جديد في الأعلى
- استخدم الإصدار الصحيح
- اكتب وصفاً واضحاً للتغييرات

---

## ✅ قائمة التحقق قبل الإرسال

قبل فتح Pull Request، تأكد من:
- [ ] الكود يتبع معايير التسمية
- [ ] التعليقات واضحة ومفيدة
- [ ] معالجة الأخطاء صحيحة
- [ ] الأوامر الجديدة تستخدم `formatter`
- [ ] اللغات مدعومة (ar و en)
- [ ] لا توجد أخطاء في الكود
- [ ] التوثيق محدث
- [ ] الرسالة commit واضحة

---

## 🎓 موارد مفيدة

- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Git Guide](https://git-scm.com/book/en/v2)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 💬 الاتصال والدعم

- **GitHub Issues**: للأسئلة والمشاكل
- **Discussions**: للنقاشات العامة
- **Email**: للاستفسارات الرسمية

---

## 📄 الترخيص

بالمساهمة، فإنك توافق على أن مساهماتك ستكون تحت رخصة MIT.

---

شكراً لمساهمتك! 🎉
