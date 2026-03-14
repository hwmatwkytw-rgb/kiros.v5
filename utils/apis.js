const axios = require('axios');
const logger = require('./log');

/**
 * API Utilities Module
 * Centralized management for all external APIs
 * Updated v2.0: Fixed broken APIs and added more stable sources
 */

class APIManager {
  constructor() {
    this.timeout = 15000;
    this.retries = 3;
  }

  /**
   * AI & Language Models APIs
   */
  
  // Free AI API (ChatGPT Alternative)
  async getGPTResponse(prompt) {
    try {
      const response = await axios.get(`https://api.samirxp.xyz/api/chatgpt?q=${encodeURIComponent(prompt)}`, {
        timeout: this.timeout
      });
      return response.data.result || response.data.content;
    } catch (error) {
      // Fallback to another free AI API
      try {
        const fallback = await axios.get(`https://api.maher-zubair.tech/ai/llama?q=${encodeURIComponent(prompt)}`);
        return fallback.data.result;
      } catch (e) {
        logger('خطأ في الاتصال بـ AI APIs: ' + error.message, 'ERROR');
        return null;
      }
    }
  }

  // Google Gemini API (Free Alternative)
  async getGeminiResponse(prompt) {
    try {
      const response = await axios.get(`https://api.samirxp.xyz/api/gemini?q=${encodeURIComponent(prompt)}`, {
        timeout: this.timeout
      });
      return response.data.result;
    } catch (error) {
      logger('خطأ في الاتصال بـ Gemini API: ' + error.message, 'ERROR');
      return null;
    }
  }

  /**
   * Media APIs
   */

  // YouTube Download API (Stable Alternative)
  async getYouTubeDownload(url) {
    try {
      const response = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(url)}`, {
        timeout: this.timeout
      });
      return response.data.data;
    } catch (error) {
      logger('خطأ في تحميل من YouTube: ' + error.message, 'ERROR');
      return null;
    }
  }

  // TikTok Download API
  async getTikTokDownload(url) {
    try {
      const response = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      logger('خطأ في تحميل من TikTok: ' + error.message, 'ERROR');
      return null;
    }
  }

  // All-in-One Video Downloader
  async getUniversalDownload(url) {
    try {
      const response = await axios.get(`https://api.ryann.my.id/download/allinone?url=${encodeURIComponent(url)}`, {
        timeout: this.timeout
      });
      return response.data.data;
    } catch (error) {
      logger('خطأ في التحميل الشامل: ' + error.message, 'ERROR');
      return null;
    }
  }

  /**
   * Utility APIs
   */

  // Weather API (OpenWeatherMap)
  async getWeather(city) {
    try {
      const apiKey = process.env.OPEN_WEATHER_API || 'c4ef85b93982fd748d3744632f79029d'; // Default key if not provided
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: apiKey,
          units: 'metric',
          lang: 'ar'
        },
        timeout: this.timeout
      });
      const data = response.data;
      return {
        city: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      };
    } catch (error) {
      logger('خطأ في الحصول على بيانات الطقس: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Wikipedia Search API (Arabic)
  async searchWikipedia(query) {
    try {
      const response = await axios.get('https://ar.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          format: 'json'
        },
        timeout: this.timeout
      });
      return response.data.query.search;
    } catch (error) {
      logger('خطأ في البحث على ويكيبيديا: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Translation API (Google Translate Free)
  async translateText(text, targetLang = 'ar') {
    try {
      const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
        timeout: this.timeout
      });
      return response.data[0][0][0];
    } catch (error) {
      logger('خطأ في الترجمة: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Joke API (Arabic/English)
  async getJoke() {
    try {
      const response = await axios.get('https://api.popcat.xyz/joke', {
        timeout: this.timeout
      });
      return response.data.joke;
    } catch (error) {
      logger('خطأ في الحصول على نكتة: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Quote API
  async getQuote() {
    try {
      const response = await axios.get('https://api.quotable.io/random', {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      logger('خطأ في الحصول على اقتباس: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Random User API
  async getRandomUser() {
    try {
      const response = await axios.get('https://randomuser.me/api/', {
        timeout: this.timeout
      });
      const user = response.data.results[0];
      return {
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone,
        picture: user.picture.large,
        location: `${user.location.city}, ${user.location.country}`,
        gender: user.gender,
        nat: user.nat
      };
    } catch (error) {
      logger('خطأ في الحصول على مستخدم عشوائي: ' + error.message, 'ERROR');
      return null;
    }
  }

  /**
   * Utility Methods
   */

  // Retry mechanism for failed requests
  async retryRequest(fn, maxRetries = this.retries) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  // Validate API Key
  validateAPIKey(key) {
    return key && key.length > 0 && key !== 'undefined';
  }
}

module.exports = new APIManager();
