
$(function () {

    var colorHash = new ColorHash();

    var roomIdRegex = /^\/chat\/([a-zA-Z0-9]+)(:([a-zA-Z0-9]+))?(:(.+))?$/;

    var roomMath = window.location.pathname.match(roomIdRegex);


    var room = roomMath[1];
    var key = roomMath[3];
    var nickname = decodeURIComponent(roomMath[5]);

    console.log(nickname);
    var myID = undefined;

    var $input_screen = $('#input_screen');
    var $send_picture = $('#send_picture');
    var $file = $('#file');

    var $history_button = $('#history_button');

    var registerHistory = false;

    if (window.localStorage.getItem('register_history') == 'true'){
        registerHistory =true;
    }
    if (window.localStorage.getItem('register_history') == 'false'){
        registerHistory =false;
    }

    function registerOptions(){
        if (registerHistory){
            $history_button.removeClass('btn-danger').addClass('btn-default');
        }else{
            $history_button.removeClass('btn-default').addClass('btn-danger');
        }

        window.localStorage.setItem('register_history', registerHistory);
    }
    registerOptions();

    function showInputScreen() {
        var $key = $('#input_key_field');
        var $nickname = $('#input_nickname_field');

        if (key == undefined || key == ''){
            $key.show();
            $input_screen.show();
        }else{
            $key.hide();
        }

        if (nickname == undefined || nickname == '' || nickname == 'undefined'){
            $nickname.show();
            $input_screen.show();
        }else{
            $nickname.hide();
        }

    }

    $input_screen.submit(function (e) {
        e.preventDefault();
        submitInputScreen();
    });



    function submitInputScreen() {
        var $key = $('#input_key').val();
        var $nickname = $('#input_nickname').val();

        if ((key == undefined || key == '') && $key != ''){
            key = $key;
        }

        if ((nickname == undefined || nickname == '' || nickname == 'undefined') && $nickname != ''){
            nickname = $nickname;
        }

        checkRequirements();

    }
    function startChat() {
        var socket = io();

        // let's assume that the client page, once rendered, knows what room it wants to join
        var roomID = room+":"+key;

        socket.on('connect', function() {
            // Connected, let's sign-up for to receive messages for this room
            socket.emit('join_to_room', {
                room:room,
                key:key,
                nickname:nickname
            });
        });

        function welcomeText() {
            addMessage({
                type:'message',
                message:'You can now typing messages!'
            })
        }
        function formatText(timestamp) {
            var time = moment.unix(timestamp/1000);
            var timestampNow = new Date().getDate() / 1000;

            if (timestamp<timestampNow-60*60*24){
                return time.format('DD-MM-YY HH:mm');
            }else{
                return time.format('HH:mm');
            }
        }

        $history_button.click(function (e) {
            e.preventDefault();
            registerHistory = !registerHistory;

            registerOptions();

            if (registerHistory){
                addMessage({
                    type:'message',
                    message:'Your messages will be stored in database for history propose.'
                })
            }else{
                addMessage({
                    type:'warning',
                    message:'Your messages will not be stored, thus only online user will see it.'
                })
            }
        });
        $send_picture.click(function (e) {
            e.preventDefault();
            $file.trigger('click');
        });

        $file.change(function(files) {
            readFiles();
        });

        function readFiles(){
            var files = $file[0].files;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                uploadFile(file);
            }
            $file.val('');
        }

        function uploadFile(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                sendMessage(e.target.result, 'image');
            };

            reader.readAsDataURL(file);

        }
        function addMessage(data, type) {
            console.log(data, type);
            data.type = data.type || 'normal';

            var $messsage = $('<li class="'+data.type+'">');

            if (data.user_id == myID) {
                $messsage.addClass('me');
            }
            if (data.register_history == false) {
                $messsage.addClass('no_history');
            }

            var messageNickname = data.nickname;

            if (messageNickname == undefined){
                messageNickname = data.user_id;
            }

            var $info = $('<div class="info">');
            if (messageNickname != undefined) {
                $info.append($('<div class="user">').text(messageNickname));
            }

            if (data.timestamp != undefined) {
                $info.append($('<div class="time">').text(
                    formatText(data.timestamp)
                ));
            }

            if (data.register_history == false) {
                $info.append($('<div class="no-history-info">').text('History disabled'));
            }
            $messsage.append($info);

            if (data.user_id != undefined && data.user_id != 'api') {
                var icon = $('<div class="icon">').append('<i class="fa fa-fw fa-user">');
                icon.css('background', colorHash.hex(data.user_id));
                $messsage.append(icon);
            }else if (data.user_id != undefined && data.user_id == 'api') {
                icon = $('<div class="icon">').append('<i class="fa fa-fw fa-envelope">');
                icon.css('background', '#da5500');
                $messsage.append(icon);
            }

            if (data.type === 'image') {
                var message = $('<div class="message">').html('<img src="'+data.message+'" />');
            }else {
                message = $('<div class="message">').text(data.message);
            }

            $messsage.append(message);

            if (type == 'prepend') {
                $('#messages').prepend($messsage);
            }else{
                $('#messages').append($messsage);
            }

            window.scrollTo(0, document.body.scrollHeight);
        }

        var $online = $('.online');
        function setOnline(online) {
            $online.text(online+' online');
        }

        function makeHistory(rows) {
            $('#messages').html('');
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];

                console.log(row);
                row.message = row.text;

                addMessage(row, 'prepend');
            }

            var loadedMessages = rows.length;
            if (loadedMessages>10) loadedMessages = 10;

            if (rows.length>0){
                addMessage({
                    type:'message',
                    message:'Loaded '+loadedMessages+' latest messages. All messages will be deleted from our database after 2 days.'
                })
            }
            welcomeText();
        }

        socket.on('message', function(data) {

            if (data.type == 'message') {
                addMessage(data);
            }else if (data.type == 'image') {
                addMessage(data);
            }else if (data.type == 'new_user' && myID != undefined && data.user_id != myID) {
                addMessage({type: 'new_user', 'message': data.nickname+' joined to the conversation! '});
                setOnline(data.count);
            }else if (data.type == 'wrong_key') {
                addMessage({
                    type: 'error',
                    message: 'Your key is invalid!'
                });
            }else if (data.type == 'hello') {
                setUp(data);
            }else if (data.type == 'history') {
                makeHistory(data.data);
            }else if (data.type == 'ready') {
                welcomeText();
            }else if (data.type == 'disconnect') {
                addMessage({
                    type: 'message',
                    message: data.nickname+' left the conversation! '
                });

                setOnline(data.count);
            }else if (data.type == 'room_count') {
                setOnline(data.count);
            }

        });
        var $val = $('#m');

        function enableChatting() {
            $val.prop('disabled', false);
            $('#m_send').prop('disabled', false);
            $('#send_picture').prop('disabled', false);
        }

        function setUp(data) {
            myID = data.id;
            enableChatting();
        }


        $('form').submit(function(){

            if ($val.val() == '') return;

            sendMessage($val.val(), 'message');
            $val.val('');
            return false;
        });

        $val.focus();

        function sendMessage(text, type) {
            socket.emit('message', {
                type:type,
                message:text,
                nickname:nickname,
                register_history:registerHistory
            });
        }
    }

    function checkRequirements() {
        if (
            room != undefined && room != '' &&
            key != undefined && key != '' &&
            nickname != undefined && nickname != '' && nickname != 'undefined'
        ){
            $input_screen.hide();
            startChat();
            return true;
        }else {
            showInputScreen();
            return false;
        }
    }

    checkRequirements();
});