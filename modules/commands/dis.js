module.exports.config = {
  name: "xo",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "عمر & Gemini",
  description: "العب إكس أو مع البوت باللهجة السودانية",
  commandCategory: "ألعاب",
  cooldowns: 5,
  usages: "xo [x/o] | xo امسح | xo واصل"
};

const fs = require("fs");
const { loadImage, createCanvas } = require("canvas");
var AIMove;

// --- الوظائف الأساسية (البنية الأصلية) ---

function startBoard({isX, data}) {
  data.board = new Array(3).fill(0).map(() => new Array(3).fill(0));
  data.isX = isX;
  data.gameOn = true;
  data.gameOver = false;
  return data;
}

async function displayBoard(data) {
  const path = __dirname + "/cache/ttt.png";
  let canvas = createCanvas(1200, 1200);
  let cc = canvas.getContext("2d");
  
  let background = await loadImage("https://i.postimg.cc/nhDWmj1h/background.png");
  cc.drawImage(background, 0, 0, 1200, 1200);
  
  var quanO = await loadImage("https://i.postimg.cc/rFP6xLXQ/O.png");
  var quanX = await loadImage("https://i.postimg.cc/HLbFqcJh/X.png");

  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      var temp = data.board[i][j].toString();
      var x = 54 + 366 * j;
      var y = 54 + 366 * i;
      if (temp == "1") data.isX ? cc.drawImage(quanO, x, y, 360, 360) : cc.drawImage(quanX, x, y, 360, 360);
      if (temp == "2") data.isX ? cc.drawImage(quanX, x, y, 360, 360) : cc.drawImage(quanO, x, y, 360, 360);
    }
  }
  fs.writeFileSync(path, canvas.toBuffer("image/png"));
  return [fs.createReadStream(path)];
}

function checkAIWon(data) {
  if(data.board[0][0] == data.board[1][1] && data.board[0][0] == data.board[2][2] && data.board[0][0] == 1) return true;
  if(data.board[0][2] == data.board[1][1] && data.board[0][2] == data.board[2][0] && data.board[0][2] == 1) return true;   
  for(var i = 0; i < 3; ++i) {
    if(data.board[i][0] == data.board[i][1] && data.board[i][0] == data.board[i][2] && data.board[i][0] == 1) return true;
    if(data.board[0][i] == data.board[1][i] && data.board[0][i] == data.board[2][i] && data.board[0][i] == 1) return true;
  }
  return false;
}

function checkPlayerWon(data) {
  if(data.board[0][0] == data.board[1][1] && data.board[0][0] == data.board[2][2] && data.board[0][0] == 2) return true;
  if(data.board[0][2] == data.board[1][1] && data.board[0][2] == data.board[2][0] && data.board[0][2] == 2) return true;   
  for(var i = 0; i < 3; ++i) {
    if(data.board[i][0] == data.board[i][1] && data.board[i][0] == data.board[i][2] && data.board[i][0] == 2) return true;
    if(data.board[0][i] == data.board[1][i] && data.board[0][i] == data.board[2][i] && data.board[0][i] == 2) return true;
  }
  return false;
}

function solveAIMove({depth, turn, data}) {
  if (checkAIWon(data)) return +1;
  if (checkPlayerWon(data)) return -1;
  let availablePoint = getAvailable(data);
  if (availablePoint.length == 0) return 0;
  var min = Number.MAX_SAFE_INTEGER, max = Number.MIN_SAFE_INTEGER;

  for (var i = 0; i < availablePoint.length; i++) {
    var point = availablePoint[i];
    if (turn == 1) {
      placeMove({point, player: 1, data});
      var currentScore = solveAIMove({depth: depth + 1, turn: 2, data});
      max = Math.max(currentScore, max);
      if (currentScore >= 0 && depth == 0) AIMove = point;
      if (currentScore == 1) { data.board[point[0]][point[1]] = 0; break; }
      if(i == availablePoint.length - 1 && max < 0 && depth == 0) AIMove = point;
    } else {
      placeMove({point, player: 2, data});
      var currentScore = solveAIMove({depth: depth + 1, turn: 1, data});
      min = Math.min(currentScore, min);
      if (min == -1) { data.board[point[0]][point[1]] = 0; break; }
    }
    data.board[point[0]][point[1]] = 0;
  }
  return turn == 1 ? max : min;
}

function placeMove({point, player, data}) { return data.board[point[0]][point[1]] = player; }
function getAvailable(data) {
  let moves = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (data.board[i][j] == 0) moves.push([i, j]);
  return moves;
}

function move(x, y, data) {
  var availablePoint = getAvailable(data);
  if (availablePoint.find(e => e.toString() == [x, y].toString())) {
    placeMove({point: [x, y], player: 2, data});
  } else return "يا زول المربع ده محجوز، ركز شوية! 🤔";
  if (!checkGameOver(data)) {
    solveAIMove({depth: 0, turn: 1, data});
    placeMove({point: AIMove, player: 1, data});
  }
}

function checkGameOver(data) {
  return (getAvailable(data).length == 0 || checkAIWon(data) || checkPlayerWon(data));
}

function AIStart(data) {
  var point = [Math.round(Math.random()) * 2, Math.round(Math.random()) * 2];
  placeMove({point, player: 1, data});
}

// --- معالجة الردود (Handle Reply) ---

module.exports.handleReply = async function({ event, api, handleReply }) {
  let { body, threadID, messageID, senderID } = event;
  if (!global.moduleData.tictactoe) return;
  let data = global.moduleData.tictactoe.get(threadID);
  if (!data || !data.gameOn || senderID !== data.player) return;

  var number = parseInt(body);
  if(!isNaN(number) && number > 0 && number < 10) {
    var row = Math.floor((number - 1) / 3);
    var col = (number - 1) % 3;
    
    var errorMsg = move(row, col, data);
    var resultMsg = "";

    if(checkGameOver(data)) {
      if(checkAIWon(data)) {
        resultMsg = "يا حليلك.. خسرت الجولة! 🐸\nالبوت غلبك، جرب تاني يا حبيب.";
      } else if(checkPlayerWon(data)) {
        resultMsg = "ما شاء الله عليك! 🏆\nغلبت البوت، إنت فنان عديل.";
      } else {
        resultMsg = "تعادل يا مان! 🤝\nاللعبة كانت حامية والنفوس طيبة.";
      }
      global.moduleData.tictactoe.delete(threadID);
    }

    var header = "╭─── ⋅ 🕹️ ⋅ ───╮\n      تحدي XO\n╰─── ⋅ 🕹️ ⋅ ───╯";
    var finalBody = resultMsg !== "" ? resultMsg : (errorMsg ? errorMsg : "حركتك الجاية شنو؟\nأكتب رقم المربع (1-9) 👇");
    
    api.sendMessage({ body: `${header}\n\n${finalBody}`, attachment: await displayBoard(data)}, threadID, (err, info) => {
      if (resultMsg == "") {
        global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
      }
    }, messageID);
  } else {
    api.sendMessage("يا زول أكتب رقم من 1 لي 9 بس! 🙄", threadID, messageID);
  }
}

// --- الأمر الرئيسي (Run) ---

module.exports.run = async function ({ event, api, args }) {
  if (!global.moduleData.tictactoe) global.moduleData.tictactoe = new Map();
  let { threadID, messageID, senderID } = event;
  const prefix = (global.data.threadData.get(threadID) || {}).PREFIX || global.config.PREFIX;
  let data = global.moduleData.tictactoe.get(threadID) || { "gameOn": false };

  var header = "╭─── ⋅ ✨ ⋅ ───╮\n      لعبة XO\n╰─── ⋅ ✨ ⋅ ───╯";

  if (args.length == 0) {
    return api.sendMessage(`${header}\n\nمرحباً بيك! داير تلعب؟\n• ${prefix}xo x ⮕ البوت يبدأ\n• ${prefix}xo o ⮕ إنت تبدأ\n• ${prefix}xo امسح ⮕ قفل اللعبة`, threadID, messageID);
  }

  if (args[0] == "امسح" || args[0] == "مسح") {
    global.moduleData.tictactoe.delete(threadID);
    return api.sendMessage("تم يا حبوب، قفلنا اللعبة ومسحنا البيانات. ✅", threadID, messageID);
  }

  if (args[0] == "واصل" || args[0] == "كمل") {
    if (!data.gameOn) return api.sendMessage("يا زول مافي لعبة شغالة هسة! ابدأ واحدة جديدة. ❌", threadID, messageID);
    return api.sendMessage({ body: "جاري استرجاع اللعبة.. أكتب رقم المربع:", attachment: await displayBoard(data)}, threadID, (err, info) => {
      global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
    }, messageID);
  }

  if (!data.gameOn) {
    var choice = args[0].toLowerCase();
    if (choice !== "x" && choice !== "o") return api.sendMessage("يا زول اختار (x) ولا (o) عشان نبدأ! 😤", threadID, messageID);
    
    let newData = startBoard({ isX: (choice == "x"), data });
    newData.player = senderID;

    if (choice == "o") {
      api.sendMessage({ body: `${header}\n\nإنت الـ (O).. أبدا اللعب يا بطل بالرد برقم المربع:`, attachment: await displayBoard(newData)}, threadID, (err, info) => {
        global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
      }, messageID);
    } else {
      AIStart(newData);
      api.sendMessage({ body: `${header}\n\nالبوت بدأ اللعب بالـ (X).. هسة دورك رُد بالرقم:`, attachment: await displayBoard(newData)}, threadID, (err, info) => {
        global.client.handleReply.push({ name: this.config.name, author: senderID, messageID: info.messageID });
      }, messageID);
    }
    global.moduleData.tictactoe.set(threadID, newData);
  } else {
    return api.sendMessage(`في لعبة شغالة أصلاً!\n• ${prefix}xo واصل ⮕ كمل لعبتك\n• ${prefix}xo امسح ⮕ أبدا من جديد`, threadID, messageID);
  }
};
