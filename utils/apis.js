const axios = require('axios');
const logger = require('./log');

/**
 * API Utilities Module
 * Centralized management for all external APIs
 */

class APIManager {
  constructor() {
    this.timeout = 10000;
    this.retries = 3;
  }

  /**
   * AI & Language Models APIs
   */
  
  // OpenAI GPT API
  async getGPTResponse(prompt, model = 'gpt-3.5-turbo') {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      logger('خطأ في الاتصال بـ OpenAI: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Google Gemini API
  async getGeminiResponse(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: this.timeout }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      logger('خطأ في الاتصال بـ Gemini: ' + error.message, 'ERROR');
      return null;
    }
  }

  /**
   * Media APIs
   */

  // YouTube Search API
  async searchYouTube(query) {
    try {
      const response = await axios.get('https://www.youtube.com/results', {
        params: { search_query: query },
        timeout: this.timeout
      });
      // استخراج البيانات من الـ HTML (يمكن تحسينها باستخدام مكتبة متخصصة)
      return response.data;
    } catch (error) {
      logger('خطأ في البحث على YouTube: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Image Search API (Bing)
  async searchImages(query, count = 10) {
    try {
      const response = await axios.get('https://www.bing.com/images/search', {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      logger('خطأ في البحث عن الصور: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Imgur Image Upload
  async uploadToImgur(imageUrl) {
    try {
      const response = await axios.post('https://api.imgur.com/3/image', {
        image: imageUrl,
        type: 'url'
      }, {
        headers: {
          'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        },
        timeout: this.timeout
      });
      return response.data.data.link;
    } catch (error) {
      logger('خطأ في رفع الصورة إلى Imgur: ' + error.message, 'ERROR');
      return null;
    }
  }

  /**
   * Utility APIs
   */

  // Weather API (OpenWeatherMap)
  async getWeather(city) {
    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: process.env.OPEN_WEATHER_API,
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

  // Wikipedia Search API
  async searchWikipedia(query) {
    try {
      const response = await axios.get('https://en.wikipedia.org/w/api.php', {
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

  // Translation API (Google Translate)
  async translateText(text, targetLang = 'ar') {
    try {
      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: text,
          langpair: `en|${targetLang}`
        },
        timeout: this.timeout
      });
      return response.data.responseData.translatedText;
    } catch (error) {
      logger('خطأ في الترجمة: ' + error.message, 'ERROR');
      return null;
    }
  }

  // URL Shortener (TinyURL)
  async shortenURL(url) {
    try {
      const response = await axios.get('https://tinyurl.com/api-create.php', {
        params: { url: url },
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      logger('خطأ في تقصير الرابط: ' + error.message, 'ERROR');
      return null;
    }
  }

  // Joke API
  async getJoke() {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke', {
        timeout: this.timeout
      });
      return response.data;
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

  // Anime Quote API
  async getAnimeQuote() {
    try {
      const response = await axios.get('https://animechan.vercel.app/api/random', {
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      logger('خطأ في الحصول على اقتباس أنمي: ' + error.message, 'ERROR');
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
        location: `${user.location.city}, ${user.location.country}`
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
