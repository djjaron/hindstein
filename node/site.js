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
server.listen(8080);


// Sockets Connectoin
io.on('connection', function (socket) {

    //------------------- SOCKETS ---------------------  
    // Socket phoneNumber
    socket.on('phoneNumber', function (data) {
        twillioSend('+19496671979', '+1 424-231-2986', 'http://www.google.com', 'http://s3-us-west-2.amazonaws.com/images.hellogiggles.com/uploads/2014/04/14/2013-Kate-Upton-HD-Wallpapers-e1360405079523-500x375c.jpeg');
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