module.exports.config = {
    name: "اكس_او",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Dante Sparda",
    description: "لعبة اكس أو بنكهة سودانية (لاعب ضد لاعب)",
    commandCategory: "ترفيه",
    usages: "[تاغ لضحيتك]",
    cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
    const { threadID, messageID, senderID, body } = event;
    let { board, p1, p2, turn } = handleReply;

    // التأكد من إنو الزول البيكتب ده هو صاحب الدور
    if (senderID !== (turn === "X" ? p1 : p2)) return;

    const move = parseInt(body);
    if (isNaN(move) || move < 1 || move > 9 || board[move - 1] !== " ") {
        return api.sendMessage("يا زول ركز! اختار رقم فاضي من 1 لـ 9، ما تشتر الرمية 🤦‍♂️", threadID, messageID);
    }

    // تنفيذ الحركة
    board[move - 1] = turn;
    
    // دالة التحقق من الفوز
    const checkWin = (b) => {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let l of lines) if (b[l[0]] !== " " && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
        return b.includes(" ") ? null : "tie";
    };

    const winner = checkWin(board);
    const displayBoard = `┌───┬───┬───┐\n│ ${board[0]} │ ${board[1]} │ ${board[2]} │\n├───┼───┼───┤\n│ ${board[3]} │ ${board[4]} │ ${board[5]} │\n├───┼───┼───┤\n│ ${board[6]} │ ${board[7]} │ ${board[8]} │\n└───┴───┴───┘`;

    if (winner) {
        let resultMsg = "";
        if (winner === "tie") {
            resultMsg = "تعادل؟ غايتو ميتينين عديل، لا فالح لا ناصح! 🤝😂";
        } else {
            const winnerName = (await Users.getData(senderID)).name;
            resultMsg = `أبشررر يا ${winnerName}! كبستو كبسة كبادي.. مبروك الفوز يا وحش 🏆✨`;
        }
        
        api.unsendMessage(handleReply.messageID);
        return api.sendMessage(`┌──── • [ 🎉 نهاية القيم ] • ────┐\n\n${displayBoard}\n\n${resultMsg}\n\n└──────────────────────────┘`, threadID);
    }

    // تبديل الدور
    turn = turn === "X" ? "O" : "X";
    const nextPlayerID = turn === "X" ? p1 : p2;
    const nextPlayerName = (await Users.getData(nextPlayerID)).name;

    const msg = `┌──── • [ ❌ XO ⭕ ] • ────┐\n\n${displayBoard}\n\nالدور عند: ${nextPlayerName}\n(رد برقم الخانة عشان تلعب)\n\n└──────────────────────────┘`;
    
    api.unsendMessage(handleReply.messageID);
    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            board, p1, p2, turn
        });
    });
};

module.exports.run = async function ({ api, event, mentions, Users }) {
    const { threadID, messageID, senderID } = event;
    const targetID = Object.keys(mentions)[0];

    if (!targetID) return api.sendMessage("يا زول حدد الضحية، أعمل تاغ لزول تفرتكو!", threadID, messageID);

    const p1Name = (await Users.getData(senderID)).name;
    const p2Name = (await Users.getData(targetID)).name;

    const board = Array(9).fill(" ");
    const msg = `┌──── • [ 🎮 تحدي سوداني ] • ────┐\n\n  1 │ 2 │ 3  \n───┼───┼───\n  4 │ 5 │ 6  \n───┼───┼───\n  7 │ 8 │ 9  \n\n🔹 ${p1Name} (X)\n🔸 ${p2Name} (O)\n\nالدور عند: ${p1Name}\n(رد برقم الخانة يا فردة)\n└──────────────────────────┘`;

    return api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            board,
            p1: senderID,
            p2: targetID,
            turn: "X"
        });
    }, messageID);
};
