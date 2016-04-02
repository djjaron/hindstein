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
    client = require('twilio')(accountSid, authToken),
    Firebase = require('firebase'),
    uuid = require('uuid-js');

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
        console.log('data: ' + data);
        console.log('data.phoneNumber' + data.phoneNumber);
        twillioSend(data.phoneNumber, '+1 424-231-2986', 'Welcome to Hindstein!', 'http://www.hindste.in/img/uploads/000000000001.gif');
    });
    // Admin Login
      socket.on('adminLogin', function (data) {           
        var ref = new Firebase("https://hindstein.firebaseio.com");
        ref.authWithPassword({
                email    : data.username,
                password : data.password
        }, function(error, authData) {
            if (error) {
                 socket.emit('adminLogin', {login:'failed'});
            } else {
                saveAdmin(authData.uid);
                socket.emit('adminLogin', {login:'passed', uid:authData.uid});
            }
        });

    });
    
   // Auth Admin
    socket.on('authAdmin', function (data) {
        var isAdmin = checkAdmin(data.uid);
        if(isAdmin == false){
            socket.emit('authAdmin', {auth:'failed'}); 
        } else {
        new Promise(function(resolve, reject) {
             var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/phoneNumbers/");
                myFirebaseRef.once("value", function(snapshot) {
                    var subscribers = snapshot.numChildren();
                    resolve(subscribers);
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                    reject
                    })
        }) 
        .then(function(result) {
            socket.emit('authAdmin', {auth:'passed', subscribers:result}); 
        });
        } // End Else
    });
    
    // Save Welcome SMS
    socket.on('saveWelcome'), function (data){
        var image = data.image;
        var text = data.text;
        var uid = data.uid;
        var isAdmin = checkAdmin(data.uid);
        if (isAdmin == false){
            socket.emit('authAdmin', {auth:'failed'}); 
        } else {
            var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/");
                myFirebaseRef.set({
                    welcomeSMS: {
                        image: image,
                        text: text,
                        uid: uid
                    }
                }, function(error){
                        if (error) {
                           console.log("Data could not be saved." + error);
                        } else {
                            console.log("Data saved successfully.");
                        }
                });
           socket.emit('saveWelcome', {state:'saved'}); 
        }
    }
    
    
    //------------------- TWILLIO --------------------- 

    function twillioSend(to, from, body, mediaUrl) {
        console.log('To ' + to);
        console.log('From ' + from);
        console.log('Body ' + body);
        console.log('mediaUrl ' + mediaUrl);

        client.messages.create({
            to: to,
            from: from,
            body: body,
            mediaUrl: mediaUrl,
        }, function (err, message) {

            if (err) {
                console.log('------ ERROR ------');
                console.log(err);
                socket.emit('phoneNumber', { twillioError: 'err' });
            } else {
                console.log('------ MESSAGE------');
                console.log(message);
                socket.emit('phoneNumber', { twillioMessage: message });
                savePhoneNumber(to);
            }
        });
    }
    
    
    //------------------- UUID --------------------
    
    function makeID() {
        return uuid.create().toString();
    }
  
    //------------------- FIREBASE --------------------- 
    
    //-- SAVE PHONE NUMBER
    function savePhoneNumber(phoneNumber) {
        var id = makeID();
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/phoneNumbers/" + id);
        myFirebaseRef.set({
            phoneNumber: phoneNumber         
        });
    }
    
    //-- SAVE ADMIN
    function saveAdmin(uid) {
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/admin/" + uid);
        myFirebaseRef.set({
            uid: uid         
        });
    }
    
    //-- IS USER ADMIN
    function checkAdmin(uid) {
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/admin/" + uid);
        myFirebaseRef.once("value", function(snapshot) {
            console.log(snapshot.val());
            return true;
        }, function (errorObject) {
            return false;
        });
    }
    

       
    //------------------- END ---------------------  
});