var express = require('express');
var path = require('path');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static("public"));

var users = [];
io.on('connection', function(socket) {
    console.log('socket');

    socket.on('join', data => {
        socket.nickname = data.nickname;
        users[socket.nickname] = socket;

        users.push({
            nickname: data.nickname,
            sockerId: socket.id
        });

        io.emit('all-users', users);
    })

    //dołączenie do prywatnego pokoju
    socket.on('join-private', data => {
        socket.join('private');
    })
    //wysyłanie do prywatnych
    socket.on('send-message-private-group', (data) => {
        socket.broadcast.to('private').emit('message-private-group', data)
    })

    socket.on('disconnect', () => { // disconect sie wywoła podczas zamknięcia, przerwania połączenia
        //kasowanie z users np po id czy nickename socket.id , socket.nickename

        io.emit('all-users', users);
    })

    socket.on('send-message', (data) => {
        socket.broadcast.emit('message-receiced', data) // wysyła wszędzie oprócz tego socketa
    })

    socket.on('send-message-private', (data) => {
        socket.broadcast.to(data.id).emit('message-private', data) // wysyłanie do socketa o id
    })

    socket.on('get-all-users', () => {
        socket.emit('all-users', users);
    })
});

app.listen(8080, function() {
    console.log('listen 8080');
});

// nodemon // do resetowania servera npm poczas zmian  i zamiast npm dajemy nodemon