$(function() {
    $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000'], function() {
        $('.tools').append("<a href='#colors_sketch' data-color='" + this + "' style='border: 1px solid black; padding: 10px 20px; margin-right: 5px; background: " + this + ";'></a> ");
    });
    $.each([ { name: 'xs', size: 3 }, { name: 'sm', size: 5 }, { name: 'md', size: 10 }, { name: 'lg', size: 15 }, {name: 'huge', size: 70 } ], function() {
        $('.tools').append("<a href='#colors_sketch' data-size='" + this.size + "' style='border: 1px solid black; padding: 10px 15px; margin-right: 5px; text-decoration: none; background: #ccc'>" + this.name + "</a> ");
    });

    $('.tools').append("<a href='#colors_sketch' data-color='#fff' style='border: 1px solid black; padding: 10px 15px; text-decoration: none; background: #ccc'>Canvas Eraser</a>")

    $('#colors_sketch').sketch();

    window.onbeforeunload = killRoom;

    init();
});

var init = function () {
    setInterval(function () {
        var url = '/api/room/' + $('#roomname').text().substring(10) + '/saveCanvas';
        var newCanvas = document.getElementById("colors_sketch").toDataURL();
        var word = document.getElementById("word").innerHTML;
        $.post(url, { CanvasDataUrl : newCanvas, Word: word});
    }, 1000);
}

function fetchword(){
    var word;
    var urlword = '/api/word/getRandom';
    //var url = '/api/room/'+  $('#roomname').text().substring(10) +'/getRandom';
    $.get(urlword).done( function (data) {
        document.getElementById("word").innerHTML = data.word;
    });
}

function killRoom () {
    var url = '/room/' + $('#roomname').text().substring(10) + '/kill';

    $.post(url);
}


var socket = io.connect();

function addMessage(msg, username) {
    console.log("paintting client adding message");
    $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + msg + '</p></div>');
}


socket.on('message', function (data) {
    console.log('painter gets the message from server');
    if ($('#roomname').text().slice(10) === data['roomname']){
        addMessage(data['guess'], data['username']);
    } else {}    
});


socket.on('correct', function (data) {
    console.log('painter gets the correct message from server');
    if ($('#roomname').text().slice(10) === data ['roomname']){
        addMessage("won. The answer is "+data['guess'] +". Painter please re-start the game", data['username']);
    } else {} 
});









