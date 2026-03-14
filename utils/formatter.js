/**
 * Message Formatter & Decorations Module
 * Centralized formatting for all bot messages
 */

class MessageFormatter {
  constructor() {
    this.emojis = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      star: '⭐',
      heart: '❤️',
      fire: '🔥',
      rocket: '🚀',
      diamond: '💎',
      crown: '👑',
      robot: '🤖',
      brain: '🧠',
      gear: '⚙️',
      lock: '🔒',
      unlock: '🔓',
      user: '👤',
      users: '👥',
      message: '💬',
      link: '🔗',
      image: '🖼️',
      video: '🎥',
      music: '🎵',
      game: '🎮',
      trophy: '🏆',
      medal: '🥇',
      hourglass: '⏳',
      clock: '🕐',
      calendar: '📅',
      money: '💰',
      coin: '🪙',
      gift: '🎁',
      party: '🎉',
      sparkles: '✨',
      sun: '☀️',
      moon: '🌙',
      star_filled: '⭐',
      arrow_up: '⬆️',
      arrow_down: '⬇️',
      arrow_left: '⬅️',
      arrow_right: '➡️'
    };

    this.borders = {
      simple: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      double: '═══════════════════════════════════════════════',
      dash: '─────────────────────────────────────────────',
      star: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐',
      diamond: '◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆',
      heart: '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️'
    };

    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      italic: '\x1b[3m',
      underline: '\x1b[4m',
      blink: '\x1b[5m',
      reverse: '\x1b[7m',
      hidden: '\x1b[8m',
      strikethrough: '\x1b[9m',
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  /**
   * Format messages with emojis and borders
   */

  // Success message
  success(title, message = '') {
    return `${this.emojis.success} ${title}\n${message ? message : ''}`;
  }

  // Error message
  error(title, message = '') {
    return `${this.emojis.error} ${title}\n${message ? message : ''}`;
  }

  // Warning message
  warning(title, message = '') {
    return `${this.emojis.warning} ${title}\n${message ? message : ''}`;
  }

  // Info message
  info(title, message = '') {
    return `${this.emojis.info} ${title}\n${message ? message : ''}`;
  }

  // Header with border
  header(title, borderType = 'simple') {
    const border = this.borders[borderType] || this.borders.simple;
    return `${border}\n${this.emojis.sparkles} ${title} ${this.emojis.sparkles}\n${border}`;
  }

  // Section divider
  section(title, content = '') {
    return `\n${this.emojis.diamond} ━━━━ ${title} ━━━━ ${this.emojis.diamond}\n${content}`;
  }

  // List item
  listItem(index, text, emoji = '•') {
    return `${emoji} ${index}. ${text}`;
  }

  // Numbered list
  numberedList(items) {
    return items.map((item, index) => this.listItem(index + 1, item, `${index + 1}️⃣`)).join('\n');
  }

  // Bullet list
  bulletList(items, emoji = '•') {
    return items.map(item => `${emoji} ${item}`).join('\n');
  }

  // Table-like format
  table(headers, rows) {
    let result = headers.map(h => `| ${h} `).join('') + '|\n';
    result += headers.map(() => '|---').join('') + '|\n';
    rows.forEach(row => {
      result += row.map(cell => `| ${cell} `).join('') + '|\n';
    });
    return result;
  }

  // Code block
  codeBlock(code, language = '') {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  // Inline code
  inlineCode(code) {
    return `\`${code}\``;
  }

  // Bold text
  bold(text) {
    return `**${text}**`;
  }

  // Italic text
  italic(text) {
    return `*${text}*`;
  }

  // Strikethrough text
  strikethrough(text) {
    return `~~${text}~~`;
  }

  // Highlight text
  highlight(text, emoji = this.emojis.sparkles) {
    return `${emoji} ${text} ${emoji}`;
  }

  // Progress bar
  progressBar(current, max, width = 20) {
    const percentage = (current / max) * 100;
    const filled = Math.round((width * current) / max);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percentage.toFixed(0)}%`;
  }

  // User card
  userCard(name, level = 1, points = 0, rank = 'عضو') {
    return `
${this.header('بطاقة المستخدم')}
${this.emojis.user} الاسم: ${this.bold(name)}
${this.emojis.star_filled} المستوى: ${level}
${this.emojis.coin} النقاط: ${points}
${this.emojis.crown} الرتبة: ${rank}
${this.borders.simple}
    `;
  }

  // Command info
  commandInfo(name, description, usage, category, cooldown, permission) {
    return `
${this.header('معلومات الأمر')}
${this.emojis.message} الاسم: ${this.bold(name)}
${this.emojis.info} الوصف: ${description}
${this.emojis.gear} الاستخدام: ${this.inlineCode(usage)}
${this.emojis.folder} الفئة: ${category}
${this.emojis.hourglass} المهلة الزمنية: ${cooldown}ث
${this.emojis.lock} الصلاحية: ${permission}
${this.borders.simple}
    `;
  }

  // Status message
  status(status, message = '') {
    const statusEmoji = status === 'online' ? '🟢' : 
                       status === 'offline' ? '🔴' : 
                       status === 'idle' ? '🟡' : '⚪';
    return `${statusEmoji} ${message}`;
  }

  // Loading animation
  loading(message = 'جاري التحميل...') {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    return `${frames[Math.floor(Math.random() * frames.length)]} ${message}`;
  }

  // Separator
  separator(char = '─', length = 40) {
    return char.repeat(length);
  }

  // Format time
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}س ${minutes}د ${secs}ث`;
    if (minutes > 0) return `${minutes}د ${secs}ث`;
    return `${secs}ث`;
  }

  // Format size
  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Format number
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Random emoji
  randomEmoji() {
    const emojiArray = Object.values(this.emojis);
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  }

  // Get emoji
  getEmoji(name) {
    return this.emojis[name] || '❓';
  }

  // Get border
  getBorder(type) {
    return this.borders[type] || this.borders.simple;
  }
}

module.exports = new MessageFormatter();
