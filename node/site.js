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
    var AWS = require('aws-sdk');
    AWS.config.loadFromPath('./s3_config.json');
    var s3Bucket = new AWS.S3( { params: {Bucket: 'img.hindste.in'} } );

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
    socket.on('saveWelcome', function (data){
        var isAdmin = checkAdmin(data.uid);
        if (isAdmin == false){
            socket.emit('authAdmin', {auth:'failed'}); 
        } else {
            base64S3(data.image, 'welcome.jpg');
            var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/welcomeSMS/");
                myFirebaseRef.set({
                        text: data.text,
                }, function(error){
                        if (error) {
                           console.log("Data could not be saved." + error);
                        } else {
                            console.log("Data saved to Firebase successfully.");
                            socket.emit('saveWelcome', {state:'saved'}); 
                        }
                });
        }
    });
    
    // getWelcome
    socket.on('getWelcome', function (data){
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/welcomeSMS/");
          myFirebaseRef.once("value", function(snapshot) {
              var data = snapshot.val();
                socket.emit('getWelcome', {image:data.image, text:data.text}); 
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);       
            })
        
    });
    
    // sendMessage
    socket.on('sendMessage', function(data){
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/phoneNumbers/");
            myFirebaseRef.once("value", function(snapshot) {
            // Start Loop
                snapshot.forEach(function(childSnapshot) {
                    var to = childSnapshot.val(); // Check this is a number
                console.log(to); // Delete once checked
                    var from = '+1 424-231-2986'; // This needs to be stored as a global variable
                    var body = data.body;
                    var mediaUrl = data.image /// TODO This needs to come from S3 Bucket!!
                    twillioSend(to, from, body, mediaUrl);
                });
            // End Loop
                socket.emit('sendMessage', {state:'complete'}); 
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                })
    });
    
    /// SHOULD WE STOP ANOTHER MESSAGE BEING SENT TODAY?
    /// SHOULD WE SEND A TEST TO ADMIN BEFORE SENDING TO SIBSCRIBERS?
    
    
      
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
    
    
    //------------------- AWS --------------------------
    
    function base64S3(image, name){
        var buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var data = {
            Key: name, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
  
            s3Bucket.putObject(data, function(err, data){
                if (err) { 
                console.log(err);
                console.log('Error uploading data: ', data); 
                } else {
                console.log('succesfully uploaded the image!');
            }
        }); 
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
            return true;
        }, function (errorObject) {
            return false;
        });
    }
    

       
    //------------------- END ---------------------  
});