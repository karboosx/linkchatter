function registerBehavior(io) {
    var chatFunctions = require('./chat');


    io.sockets.on('connection', function(socket) {
        chatFunctions.sendToMe(socket,{type:'hello',id:socket.id});

        socket.on('join_to_room', function(data) {

            try{
                var __ret = chatFunctions.getRoomKey(data);
                var key = __ret.key;
                var roomName = __ret.roomName;

                if (data.key == key) {
                    socket.join(roomName, function () {
                        socket.nickname = data.nickname;

                        if (io.sockets.adapter.rooms[roomName] != undefined) {

                            chatFunctions.sendToMyRooms(socket, {
                                type: 'new_user',
                                user_id: socket.id,
                                count: io.sockets.adapter.rooms[roomName].length,
                                nickname: socket.nickname
                            });

                            chatFunctions.sendHistory(socket);

                            chatFunctions.sendToMe(socket, {
                                type: 'room_count',
                                count: io.sockets.adapter.rooms[roomName].length,
                            });
                        }

                        socket.on('disconnect', function() {

                            if (io.sockets.adapter.rooms[roomName] == undefined) return;

                            io.sockets.in(roomName).emit('message',{
                                type:'disconnect',
                                user_id:socket.id,
                                nickname:socket.nickname,
                                count:io.sockets.adapter.rooms[roomName].length,
                            });

                        });

                    });

                }else{
                    chatFunctions.sendToMe(socket,{type:'wrong_key'});
                }
            }catch(e){}
        });

        socket.on('message', function(data) {
            data.user_id = socket.id;
            data.timestamp = (+new Date());
            chatFunctions.sendToMyRooms(socket, data);

            if (data.hasOwnProperty('register_history') && data.register_history == false) return;

            chatFunctions.insetToHistory(socket, data);

        });

        socket.on('image', function(data) {
            data.user_id = socket.id;
            data.timestamp = (+new Date());
            chatFunctions.sendToMyRooms(socket, data);

            if (data.hasOwnProperty('register_history') && data.register_history == false) return;

            chatFunctions.insetToHistory(socket, data);

        });
    });

}

module.exports = {
    registerBehavior:registerBehavior
};