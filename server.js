var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');
var answer = {};
var app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;

var server = app.listen(port);

//var io = require('socket.io').listen(server);

// Mongoose connection
mongoose.connect("mongodb://testdata:datatest@ds059316.mlab.com:59316/module2db");


//================================================================== Data Schema
// Define user scheme and object
var UserSchema = new mongoose.Schema({
    username: String
});
var User = mongoose.model('user', UserSchema);

// Define room scheme and object
var RoomSchema = new mongoose.Schema({
    RoomName: String,
    RoomNum: Number,
    RoomType: String,
    PassWord: String,
    Word: String,
    CanvasDataUrl: String,
    Chats: [{ Player: String, Body: String }],
    Active: Boolean
});
var Room = mongoose.model('room', RoomSchema);

// Define word scheme and object
var WordSchema = new mongoose.Schema({
    Category: String,
    Context: String
});
var Word = mongoose.model('word', WordSchema);

// Use middlewares
app.use(session({
    secret: 'Rain is a cat.',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function isLoggedIn (req, res, next) {
    if (req.session.username) {
        return next();
    }

    res.redirect('/login');
}

function clearRole (req, res, next) {
    req.session.role = -1;
    req.session.inRoom = '';

    return next();
}


//================================================================== Routing

//------------------------------------------------------------------ Login Routing
app.get('/', isLoggedIn, clearRole, function(req, res) {
    Room.find({ Active : true }, function(err, rooms) {
        if(err){
            console.log("error find room");
        }
        else {
            res.render('index', {user : req.session.username, msg : '', rooms});
        }
    });

});

app.get('/login', function (req, res) {
    if (req.session.username) {
        res.redirect('/');
    }

    res.render('login', {'msg' : ''});
});

app.get('/logout', isLoggedIn, function (req, res) {
    var tobedeletede = req.session.username;
    req.session.destroy(function () {
        User.remove({ username : tobedeletede }, function(err, removed) {
            if(err){
                console.log("wrong with remove");
            }
            else {
                res.render('login', {'msg' : ''});
            }
        });
    });
});

app.post('/create-player', function (req, res) {
    var un = req.body.login_name;
    //console.log(un);
    
    if (un.length < 5) {
        res.render('login', {'msg' : 'User name has to have at least 5 characters.'});
    }
    else {
        User.findOne({
            username: un
        }, function(err, user) {
            if (user) {
                res.render('login', {'msg' : 'User name "' + un + '" already exist!'});
            }
            else {
                var newUser = new User({
                    username: un
                });

                newUser.save(function (err, data) {
                    if (err) {
                        res.render('login', {'msg' : err});
                    }
                    else {
                        req.session.username = un;
                        req.session.role = -1;
                        req.session.inRoom = '';
                        Room.find({}, function(err, rooms) {
                            if(err){
                                console.log("error find room");
                            }
                            else {
                                res.render('index', {user : req.session.username, msg : '', rooms});
                            }
                        });
                    }
                });
            }
        });
    }
});



//------------------------------------------------------------------ Room Routing
app.post('/create-room', isLoggedIn, function (req, res) {
    var rn = req.body.room_name;
    var rt = req.body.room_type;
    var rp = req.body.room_pwd;

    if (rn.length < 5 && !/[^a-zA-Z0-9]/.test(rn)) {
        res.send('Room name has to have at least 5 characters, alphanumeric only.');//('index', { user : req.session.username, msg : 'Room name has to have at least 5 characters, alphanumeric only.'});
    }
    else {
        Room.findOne({
            RoomName: rn,
            Active: true
        }, function(err, room) {
            if (room) {
                res.send('Room name already exist!');//('index', { user : req.session.username, msg : 'Room name "' + rn + '" already exist!'});
            }
            else {
                var newRoom = new Room({
                    RoomName: rn,
                    RoomNum: 1,
                    RoomType: rt,
                    PassWord: rp,
                    Word: "word",
                    CanvasDataUrl: '',
                    Chats: [],
                    Active: true
                });

                newRoom.save(function (err, data) {
                    if (err) {
                        res.send(err);//('index', { user : req.session.username, 'msg' : err});
                    }
                    else {
                        req.session.role = 0;
                        req.session.inRoom = data.RoomName;
                        res.render('room', {data : data, viewmode : 0, user : req.session.username });
                    }
                });
            }
        });
    }
});

app.get('/room/:roomname/view', isLoggedIn, function (req, res) {
    Room.findOne({
        RoomName: req.params.roomname,
        Active: true
    }, function(err, room) {
        if (room) {
            if (room.RoomType === 'private') {
                if (req.body.validation != room.PassWord) {
                    res.render('index', { user : req.session.username, 'msg' : 'Wrong PassWord!!!'});
                }
            }
            req.session.role = 2;
            req.session.inRoom = room.RoomName;
            res.render('room', { data : room, viewmode : 2, user : req.session.username });
        }
        else {
            res.sendStatus(404);
        }
    });
});

app.get('/room/:roomname/join', isLoggedIn, function (req, res) {
    Room.findOneAndUpdate({ RoomName: req.params.roomname, Active: true }, { $inc : {RoomNum: 1 }},  { new : true }, function(err, room) {
        if (room) {
            if (room.RoomType === 'private') {
                if (req.body.validation != room.PassWord) {
                    res.send('Wrong PassWord!!!');
                }
            }
            req.session.role = 1;
            req.session.inRoom = room.RoomName;
            res.render('room', { data : room, viewmode: 1, user : req.session.username });
        }
        else {
            res.sendStatus(404);
        }
    });
});

app.post('/room/:roomname/kill', isLoggedIn, function (req, res) {
    if (req.session.role === 0) {
        Room.findOneAndUpdate(
            { RoomName: req.params.roomname }, 
            { Active: false }, 
            { new : true }, 
            function (err, doc) {
                if (err) {
                    console.log(err);
                    res.sendStatus(404);
                }
                else {
                    // system message broadcast
                    res.sendStatus(200);
                }
        });
    }
    else if (req.session.role === 1) {
        Room.findOneAndUpdate(
            { RoomName: req.params.roomname }, 
            { $inc : {RoomNum: -1 }}, 
            { new : true }, 
            function (err, doc) {
                if (err) {
                    console.log(err);
                    res.sendStatus(404);
                }
                else {
                    // system message broadcast
                    res.sendStatus(200);
                }
        });
    }
    else {
        console.log("Room name not match");
        res.sendStatus(404);
    }
});

app.get('/api/room/:roomname/getCanvas',  isLoggedIn, function (req, res) {
    var rn = req.params.roomname;

    Room.findOne(
        { RoomName: rn, Active: true }, 
        function (err, doc) {
            if (doc) {
                res.send({ currCanvas : doc.CanvasDataUrl });
            }
            else {
                console.log(err);
                res.sendStatus(500);
            }
    });
});

app.post('/api/room/:roomname/saveCanvas', isLoggedIn, function (req, res) {
    var rn = req.params['roomname'];
    Room.findOneAndUpdate(
        { RoomName: rn, Active: true }, 
        { CanvasDataUrl : req.body.CanvasDataUrl, Word: req.body.Word }, 
        { new : true }, 
        function (err, doc) {
            if (err) {
                console.log("save error");
                res.sendStatus(500);
            }
            else {
                res.sendStatus(200);
            }
    });
});


//  TODO ========================================================================
// 随机取出一个词
app.get('/api/word/getRandom', function (req, res) {
    var rand = Math.floor(Math.random() * 50); //把这个50替换成词库真正的大小
    var rn = req.params.roomname;
    Word.findOne().skip(rand).exec(
        function (err, result) {
            if (err) {
                console.log(err);
                res.sendstatus(500);
            }
            else {
                var getword = result.Context;
                answer[rn] = getword;
                res.send({word : getword});
            }
        }
    );
});
//  TODO ========================================================================












// ------------------------------------------------------------------guessing socket 
var io = require('socket.io').listen(server);

(io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {
        var username = data['username'];
        var guess = data['guess'];
        var roomname = data['roomname'];
        Room.findOne(
            {RoomName : roomname, Active : true},
            function(err, doc) {
                 var return_data = {'username' : username, 'guess' : guess, 'roomname' : roomname};
                if (err){
                    console.log("Get Room Wrong");
                }
                console.log(doc['Word']);
                if (doc['Word'] == guess) {
                    socket.emit("correct", return_data); 
                    socket.broadcast.emit("correct", return_data); 
                }
                else {
                    socket.broadcast.emit("message", return_data);
                }
            }
        );
    });
}));



// -------------------------------------------------------------------end guessing socket


//--------------------------------------------------------------------words saving
var words = 
{"animal" : ["cat", "dog", "rabbit", "mouse", "elephant",
            "panda","duck", "fish", "snake","bear", "bird"],
"color" : ["blue", "red", "black", "yellow","green"],
"body" : ["hand", "head", "eye", "ear", "nose",
        "mouth", "foot","leg", "arm", "finger"],
"fruit" : ["apple", "pineapple", "banana", "lemon", "watermelon"],
"country" : ["America", "China", "Japan", "British", "Canada"],
"natural" : ["mountain", "moon", "river","star", "cloud",
            "flower", "rainbow"],
"food" : ["fries", "burger", "cookie", "egg", "cheese", "ice cream", "sushi"]};

app.get("/save_words",function(req, res){
    var keys = Object.keys(words);
    var category_length = keys.length;
    var array_length;
    var i;
    var j;
    var category;
    for (i = 0; i < category_length; i++){
        category = keys[i];
        array_length = words[category].length;
        for (j = 0; j < array_length; j++){
            var newWord = new Word({
                Category: category,
                Context: words[category][j]
            });
            newWord.save(function(err, data) {
                if (err){
                    console.log(err);
                }
                else{
                    console.log(data);
                }
            });
        }
    }
});

//------------------------------------------------------------------end of word saving
