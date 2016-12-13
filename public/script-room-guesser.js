$(function() {
    window.onbeforeunload = killRoom;

    $("#btn_send").click(function() {console.log("clicked"); sendMessage();});

    init();
});

var init = function () {
    setInterval(function () {
        var url = '/api/room/' + $('#roomname').text().substring(10) + '/getCanvas';

        $.get(url).done( function (data) {
            var img = new Image;
            img.src = data.currCanvas;
            document.getElementById("colors_sketch").getContext("2d").drawImage(img, 0, 0);
        });
    }, 1000);
}

function killRoom () {
    var url = '/room/' + $('#roomname').text().substring(10) + '/kill';

    $.post(url);
}




var socket = io.connect();

function addMessage(msg, username) {
    $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + msg + '</p></div>');
}



function sendMessage() {
    if ($('#guess_input').val() != "")
    {   console.log("guessing client sending message");
        var username = $('#username').html();
        var roomname = $('#roomname').html();
        var info = {'username' : username.slice(7), 'guess' : $('#guess_input').val(), 'roomname' : roomname.slice(10)};
        socket.emit('message', info);
        addMessage($('#guess_input').val(), "Me");
        $('#guess_input').val('');
    }
}


socket.on('correct', function(data){
    console.log("correct reched:" + $('#roomname').text().slice(10));
    if (data['roomname'] === $('#roomname').text().slice(10)) {
        console.log("won reached");
        addMessage("won. The answer is "+data['guess'] +". Painter please re-start the game", data['username']);
    } else {}
});

socket.on('message', function(data) {
    console.log("guessing cliet on messge");
    if (data['roomname'] === $('#roomname').text().slice(10)) { 
        console.log("sending sending");
        addMessage(data['guess'], data['username']);
    } else {}
});