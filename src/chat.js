var chat = require('./chat_instance');
var sha256 = require('js-sha256').sha224;
var database = require('./database');


var sendToMyRooms = function(socket, data) {
    for (var room in socket.rooms) {
        if (room == socket.id) continue;

        chat.io.sockets.in(room).emit('message', data);
    }
};

var getRoomID = function(socket) {
    for (var room in socket.rooms) {
        if (room == socket.id) continue;

        return room;
    }
};

var sendToMe = function(socket, data) {
    chat.io.sockets.in(socket.id).emit('message', data);
};

var insetToHistory = function(socket, data) {
    if (!chat.config.registerHistory) return;

    database.query('INSERT INTO history (user_id, nickname, room, text, type, timestamp) VALUES ($1,$2,$3,$4,$5,$6);', [socket.id,data.nickname || '', getRoomID(socket), data.message, data.type, (+new Date())], function(err, result) {
        if (err)
        { console.error(err); }
    });
};

var sendHistory = function(socket) {
    if (chat.config.registerHistory) {

        database.query('SELECT * FROM history WHERE room LIKE $1 ORDER BY timestamp DESC LIMIT 10;', [getRoomID(socket)], function (err, result) {
            if (err) {
                console.error(err);
            } else {
                sendToMe(socket, {
                    type: 'history',
                    data: result.rows
                });
            }
        });
    }else{
        sendToMe(socket, {
            type: 'ready',
        });
    }

};

var getRoomKey = function (data) {
    var roomID = (data.room);
    var key = sha256(roomID + '' + chat.config.keySalt);
    var roomName = 'conversation-' + roomID;
    return {key: key, roomName: roomName};
};


module.exports = {
    sendToMyRooms:sendToMyRooms,
    getRoomID:getRoomID,
    sendToMe:sendToMe,
    insetToHistory:insetToHistory,
    sendHistory:sendHistory,
    getRoomKey:getRoomKey,
};