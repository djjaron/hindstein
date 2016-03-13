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
    console.log('Page Served');
});

// start the server in port 9000 (nginx is listening)
server.listen(9000);


// Sockets Connectoin
io.on('connection', function (socket) {
    console.log('Connected');

    //------------------- SOCKETS ---------------------  
    // Welcome Message
    socket.on('phoneNumber', function (data) {
        console.log('data: '+data);
        console.log('data.phoneNumber'+data.phoneNumber);
        twillioSend(data.phoneNumber, '+1 424-231-2986', 'Welcome to Hindstein!', 'http://www.hindste.in/img/uploads/000000000001.gif');
    });
    
     //------------------- TWILLIO --------------------- 

    function twillioSend(to, from, body, mediaUrl) {
        console.log('To '+to);
        console.log('From '+ from);
        console.log('Body '+body);
        console.log('mediaUrl '+mediaUrl);
        
        client.messages.create({
            to: to,
            from: from,
            body: body,
            mediaUrl: mediaUrl,
        }, function (err, message) {
            console.log('ERR'+err);
            console.log('message'+message);
            socket.emit('phoneNumber', { twillioError: 'err', twillioMessage: message});
            // SAVE TO DATABASE
        });
    }
  
    //------------------- END ---------------------  
});