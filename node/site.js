/* global process */
/* global require */
/* global console */
/* global module */
/* global __dirname */

'use strict';

//------------------- START ---------------------  
var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

// allow access to all public files
app.use(express.static(__dirname + '/public'));

// serve index.html
app.get('/', function (req, res) {
    res.render('/public/index.html');
});

// start the server in port 8080 (nginx is listening)
server.listen(8080);


// Sockets Connectoin
io.on('connection', function (socket) {

    //------------------- SOCKETS ---------------------  
    // Socket phoneNumber
    socket.on('phoneNumber', function (data) {
        socket.emit('phoneNumber', { phoneNumber: 'saved' });
        console.log(data);
    });
  
  
    //------------------- END ---------------------  
});