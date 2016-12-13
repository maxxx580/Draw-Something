$(function() {
    init();
});

var init = function () {
    setInterval(function () {
        var url = '/api/room/' + $('#roomname').text().substring(10) + '/getCanvas';

        $.get(url, function (data) {
            var img = new Image;
            img.src = data.currCanvas;
            document.getElementById("colors_sketch").getContext("2d").drawImage(img, 0, 0);
        });
    }, 1000);
}

var socket = io.connect();

function addMessage(msg, username) {
    $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + msg + '</p></div>');
}

socket.on('message', function(data) {
    console.log('viewer receive message from server');
    if ($('#roomname').text().slice(10) === data['roomname']){ 
        addMessage(data['guess'], data['username']);
    } else {}
})

socket.on('correct', function(data) {
    console.log('viewer gets the correct message from server');
    if($('#roomname').text().slice(10) === data['roomname']){
        addMessage("won. The answer is "+data['guess'] +". Painter please re-start the game", data['username']);
    } else{}
})