const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const axios = require('axios');
const path = require('path');

// استدعاء ملف الإعدادات والاعتماديات الخارجية للمشروع
const config = require('../config.json');
const packageInfo = require('../package.json');
const assets = require('@miraipr0ject/assets');

module.exports = {
    /**
     * دالة جلب روابط تحميل الفيديوهات أو البحث في يوتيوب
     * @param {String} query - نص البحث أو رابط الفيديو
     * @param {String} type - نوع المنصة المطلوبة (مثل 'youtube')
     * @param {String} format - صيغة التحميل المطلوبة ('audio' أو 'video')
     */
    getYoutube: async function (query, type, format) {
        const axiosInstance = axios;

        // إذا كانت المنصة يوتيوب، يتم استخدام مكتبة البحث لجلب النتائج
        if (type == 'youtube') {
            const youtubeSearch = require('youtube-search-api');
            if (!query) {
                console.log("Thiếu dữ liệu"); // نقص في البيانات
                return;
            }
            // جلب قائمة الفيديوهات بناءً على كلمة البحث (الحد الأقصى 6 نتائج)
            const searchResults = await youtubeSearch.GetListByKeyword(query, false, 6);
            return searchResults.items;
        }

        // إذا كان نوع الطلب جلب رابط مباشر عبر API خارجي
        if (type == 'getLink') {
            const apiUrl = 'https://aiovideodl.ml/wp-json/aio-dl/video-data/';
            var videoData = (await axiosInstance.post(apiUrl, { 'url': 'https://www.youtube.com/watch=' + query })).data;

            // إذا كان المطلوب صوت فقط (Audio)
            if (format == 'audio') {
                return {
                    title: videoData.title,
                    duration: videoData.duration,
                    download: {
                        SD: videoData.medias[0].url,
                        HD: videoData.medias[2].url
                    }
                };
            }
            // إذا كان المطلوب فيديو كامل (Video)
            else if (format == 'video') {
                return {
                    title: videoData.title,
                    duration: videoData.duration,
                    download: videoData.medias[3].url
                };
            }
        }
    },

    /**
     * دالة لإرسال الرسائل باستخدام بيانات القروب المخزنة مؤقتاً في الذاكرة العشوائية
     */
    throwError: function (commandName, threadID, messageID) {
        const threadContext = global.data.threadData.get(parseInt(threadID)) || {};
        
        // جلب بريفكس البوت المخصص للمجموعة أو الافتراضي من الإعدادات
        const currentPrefix = threadContext.hasOwnProperty('PREFIX') ? threadContext.PREFIX : global.config.PREFIX;
        
        return global.client.api.sendMessage(
            global.getText('mirai', 'error', currentPrefix, commandName), 
            threadID, 
            messageID
        );
    },

    /**
     * دالة تنظيف نصوص وتطبيقه على وسوم الـ HTML (مثل تحويل وسوم الـ b إلى خط عريض للماسينجر)
     */
    cleanAnilistHTML: function (htmlText) {
        if (!htmlText) return '';
        htmlText = htmlText.replace(/<br>/g, '\n')
                           .replace(/<\/?(i|em)>/g, '*')
                           .replace(/<\/?b>/g, '**')
                           .replace(/~!|!~/g, '||')
                           .replace(/&amp;/g, '&')
                           .replace(/&lt;/g, '<')
                           .replace(/&gt;/g, '>')
                           .replace(/&quot;/g, '"')
                           .replace(/&#039;/g, "'");
        return htmlText;
    },

    /**
     * دالة تحميل ملف وحفظه محلياً على القرص الصلب عن طريق الستريم (Stream)
     */
    downloadFile: async function (fileUrl, downloadPath) {
        const createWriteStream = fs.createWriteStream;
        const response = await axios({
            method: 'GET',
            responseType: 'stream',
            url: fileUrl
        });

        const writer = createWriteStream(downloadPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    },

    /**
     * دالة بسيطة لعمل طلب GET سريع لأي رابط واسترجاع البيانات
     */
    getContent: async function (targetUrl) {
        try {
            const response = await axios({
                method: 'GET',
                url: targetUrl
            });
            return response;
        } catch (error) {
            return console.log(error);
        }
    },

    /**
     * دالة توليد سلسلة نصية (String) عشوائية من الحروف والأرقام بطول معين
     */
    randomString: function (length) {
        const characters = 'ABCDKCCzwKyY9rmBJGu48FrkNMro4AWtCkc1flmnopqrstuvwxyz';
        let result = '';
        const charLength = characters.length || 5;
        
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charLength));
        }
        return result;
    },

    /**
     * موديول إدارة الأصول والملفات الخارجية كالفونطات والصور والبيانات
     */
    assets: {
        async font(fontName) {
            if (!assets.font.loaded) await assets.font.load();
            return assets.font.get(fontName);
        },
        async image(imageName) {
            if (!assets.image.loaded) await assets.image.load();
            return assets.image.get(imageName);
        },
        async data(dataName) {
            if (!assets.data.loaded) await assets.data.load();
            return assets.data.get(dataName);
        }
    },

    /**
     * نظام تشفير وفك تشفير متقدم يعتمد على AES-256-CBC
     */
    AES: {
        encrypt(plainText, secretKey, iv) {
            var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(plainText), Buffer.from(secretKey));
            var encrypted = cipher.update(iv);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return encrypted.toString('hex');
        },
        decrypt(cipherText, secretKey, iv) {
            const encryptedBuffer = Buffer.from(iv, 'hex');
            var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cipherText), Buffer.from(secretKey, 'binary'));
            var decrypted = decipher.update(encryptedBuffer);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return String(decrypted);
        },
        makeIv() {
            return Buffer.from(crypto.randomBytes(16)).toString('binary').slice(0, 16);
        }
    },

    /**
     * دالة فحص وتحديد مسار مجلد الـ Home الافتراضي ونوع خادم نظام التشغيل الحالي
     * @returns {Array} [homeDirectory, platformName]
     */
    homeDir: function () {
        var calculatedHome = null;
        var platformType = 'unknow';

        const fallbackHome = process.env.HOME;
        const alternativeHome = process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;

        switch (process.platform) {
            case 'win32':
                calculatedHome = process.env.USERPROFILE || (process.env.HOMEDRIVE + process.env.HOMEPATH) || fallbackHome || null;
                platformType = 'win32';
                break;
            case 'darwin':
                calculatedHome = fallbackHome || (alternativeHome ? '/Users/' + alternativeHome : null);
                platformType = 'darwin';
                break;
            case 'linux':
                calculatedHome = fallbackHome || (process.getuid() === 0 ? '/root' : alternativeHome ? '/home/' + alternativeHome : null);
                platformType = 'linux';
                break;
            default:
                calculatedHome = fallbackHome || null;
                platformType = 'unknow';
                break;
        }

        // إذا كان نظام التشغيل يدعم ميثود os.homedir() الجاهزة في Node.js يتم استخدامها مباشرة
        return [
            typeof os.homedir === 'function' ? os.homedir() : calculatedHome,
            platformType
        ];
    }
};
