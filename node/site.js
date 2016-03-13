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
    io = require('socket.io')(server),
    accountSid = 'AC7ebe34d91f75cad45e7f096d011f2d21',
    authToken = '48e9253927058f8421e9a47aaac4c6fe', 
    client = require('twilio')(accountSid, authToken); 

// allow access to all public files
app.use(express.static(__dirname + '/public'));

// serve index.html
app.get('/', function (req, res) {
    res.render('/public/index.html');
});

// start the server in port 8080 (nginx is listening)
server.listen(9000);


// Sockets Connectoin
io.on('connection', function (socket) {

    //------------------- SOCKETS ---------------------  
    // Welcome Message
    socket.on('phoneNumber', function (data) {
        twillioSend('data.phoneNumber', '+1 424-231-2986', 'Welcome to Hindstein!', 'http://www.hindste.in/img/uploads/000000000001.gif');
    });
    
     //------------------- TWILLIO --------------------- 

    function twillioSend(to, from, body, mediaUrl) {
        client.messages.create({
            to: to,
            from: from,
            body: body,
            mediaUrl: mediaUrl,
        }, function (err, message) {
            console.log(message.sid);
            socket.emit('phoneNumber', { tillioError: 'err', twillioMessage: message});
            // SAVE TO DATABASE
        });
    }
  
    //------------------- END ---------------------  
});