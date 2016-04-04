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
    uuid = require('uuid-js'),
    AWS = require('aws-sdk');
    AWS.config.loadFromPath('./s3_config.json');
    var s3Bucket = new AWS.S3( { params: {Bucket: 'img.hindste.in'} } );
    var firebaseRoot = new Firebase("https://hindstein.firebaseio.com/");
    
    

// allow access to all public files
app.use(express.static(__dirname + '/public'));

// serve index.html
app.get('/', function (req, res) {
    res.render('/public/index.html');
    console.log('Page Served');
});


app.get('/pass/', function(req, res){
  var file = __dirname + '/public/pass/hindstein.pkpass';
    res.setHeader('Content-type', 'application/vnd.apple.pkpass');
    res.download(file); 
});



// start the server in port 9000 (nginx is listening)
server.listen(9000);


// Sockets Connectoin
io.on('connection', function (socket) {
    console.log('Connected');

    //------------------- SOCKETS ---------------------  
    // Welcome Message
    // When a new number is entered on the home page
    // get the welcome message from the database
    // send the new subscriber a message
    // save new number to the database
    
    socket.on('phoneNumber', function (data) {
         new Promise(function(resolve, reject) {
            var db = firebaseRoot.child("hindstein/welcomeSMS");
                db.once("value", function(snapshot) {
                    var message = snapshot.val();
                    var cleanMessage = message.text; 
                    var messageToSend = {message:cleanMessage, to:data.phoneNumber};
                    resolve(messageToSend);
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                    reject
                    })
        }) 
        .then(function(result) {
                    var d = new Date();
                    var n = d.getTime();
             twillioSend(result.to,  "+17027488799", result.message, "http://img.hindste.in/welcome.png?id="+n);
            socket.emit('phoneNumberGood', {number:'good'}); 
       });        
    });
    
    
    // Admin Login
      socket.on('adminLogin', function (data) {           
        firebaseRoot.authWithPassword({
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
             var db = firebaseRoot.child("hindstein/phoneNumbers");
                db.once("value", function(snapshot) {
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
            
            if(data.image.length > 60){
                console.log('Saving New Image');
                base64S3(data.image, 'welcome.png', 'png');
            }
            var db = firebaseRoot.child("hindstein/welcomeSMS");
                db.set({
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
        var db = firebaseRoot.child("hindstein/welcomeSMS");
          db.once("value", function(snapshot) {
              var data = snapshot.val();
                socket.emit('getWelcome', {image:data.image, text:data.text}); 
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);       
            })
    });
    
    // sendMessage
    socket.on('sendMessage', function(data){
            var myID = makeID();
            if(data.image){
                base64S3(data.image, myID+'.png', 'png');
            }
        var db = firebaseRoot.child("hindstein/phoneNumbers");
            db.once("value", function(snapshot) {
            // Start Loop
                snapshot.forEach(function(childSnapshot) {
                    var sendTo = (childSnapshot.val().phone_number);
                     twillioSend(sendTo, '+17027488799', data.text, 'http://img.hindste.in/'+myID+'.png');
                });
            // End Loop
                socket.emit('sendMessage', {state:'complete'}); 
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                })
    });
        
    //------------------- TWILLIO --------------------- 

    function twillioSend(to, sentFrom, body, mediaUrl) {            
        client.messages.create({ 
            to: to, 
            from: sentFrom, 
            body: body, 
            mediaUrl: mediaUrl,  
        }, function(err, message) { 
            if (err) {
                console.log(err);
                socket.emit('phoneNumber', { twillioError: 'err' });
            } else {
                console.log('SMS Sent: '+to);
                savePhoneNumber(to);
            }
        });
    }
    
    //------------------- UUID --------------------
    
    function makeID() {
        return uuid.create().toString();
    }

    //------------------- AWS --------------------------
    
    function base64S3(image, name, type){
        var buf = new Buffer(image.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var data = {Key: name, Body: buf, ContentType: 'image/' + type };
            s3Bucket.putObject(data, function(err, data){
                if (err) { 
                console.log('Error uploading data: ', data); 
                } else {
                console.log('succesfully uploaded the image!');
                }
            }); 
    }
 
    //------------------- FIREBASE --------------------- 
    
    //-- SAVE PHONE NUMBER
    function savePhoneNumber(phoneNumber) {
        var myFirebaseRef = new Firebase("https://hindstein.firebaseio.com/hindstein/phoneNumbers/" + phoneNumber);
        myFirebaseRef.set({
            phone_number: phoneNumber         
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