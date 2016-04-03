/* global process */
/* global require */
/* global console */
/* global module */
/* global window */
/* global io */
/* global document */
/* global __dirname */

'use strict';

(function () {
///---------------------- START ------------------------    
 
//---- Grab a socket
   var socket = io.connect('http://hindste.in');

//---- Event Listeners
    var loc = window.location.pathname;
//-- HOME
    if (loc ==''){
    document.getElementById("sendPhoneNumber").addEventListener("click", sendPhoneNumber);
    document.getElementById("phoneNumber").addEventListener("focus", addCountryCode);
    document.getElementById("number").addEventListener("click", focusPhoneNumber);
    window.addEventListener("load", restylePhoneNumber);
    window.addEventListener("resize", restylePhoneNumber);
    }
//--Admin Login
    if(loc =='/admin/'){
    document.getElementById("login").addEventListener("click", adminLogin);
    }
//--Admin Home
    if(loc =='/admin/home/'){
    authAdmin();
    window.addEventListener("load", restyleAdmin);
    window.addEventListener("load", getWelcome);
    window.addEventListener("resize", restyleAdmin);
    document.getElementById("saveWelcome").addEventListener("click", saveWelcome);
    document.getElementById("saveWelcome").addEventListener("click", sendMessage);
    document.getElementById("welcomeUpload").addEventListener("change", welcomeUpload);
    document.getElementById("messageUpload").addEventListener("change", messageUpload);
    }


//----- Functoins
    function sendPhoneNumber() {
        var phoneNumber = document.getElementById("phoneNumber").value;
        console.log('YOU ENTERED: '+phoneNumber);
        var cleanNumber = phoneNumber.replace(/\D/g,'');
        var raw_number = cleanNumber.replace(/[^0-9]/g, '');
        var regex1 = /^1?([2-9]..)([2-9]..)(....)$/;
        if (!regex1.test(raw_number)) {
            console.log('BAD BOY');
        } else {
            var formatted_number = cleanNumber.replace(regex1, '1 ($1) $2 $3');
            var readyNumber = formatted_number.replace(/\D/g,'');
            console.log('We SENT: +'+readyNumber);
            socket.emit('phoneNumber', { phoneNumber: '+'+readyNumber});
             document.getElementById("number").style.opacity = "0";
        }   
    }
    
    function restylePhoneNumber(){
        var width = window.innerWidth;
        var phoneNumer = document.getElementById("phoneNumber");
         phoneNumer.style.opacity = "1";
        if (width > 500){
           phoneNumer.style.fontSize = '1em';
           phoneNumer.style.width = '300px';
           phoneNumer.placeholder = 'ENTER YOUR PHONE NUMBER HERE';
        }else{
          phoneNumer.style.width = '200px';
          phoneNumer.placeholder = 'YOUR PHONE NUMBER';
        }
    }
    
    function addCountryCode(){
        document.getElementById("countryCode").style.opacity = "1";
        document.getElementById("phoneNumber").placeholder = '';
        document.getElementById("phoneNumber").style.width = '200px';
    }
    
    function focusPhoneNumber(){
         document.getElementById("phoneNumber").focus();
    }
    
    function adminLogin(){
        var userName = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        socket.emit('adminLogin', { username:userName, password:password});
    }
    
    function authAdmin(){
        var card = document.getElementById("body");
        card.classList.add("hide");
        var uid = localStorage.getItem("uid");
        if (!uid){
        window.location="http://www.hindste.in/admin/";
        } else{
        socket.emit('authAdmin', { uid:uid });
        };
    }
    
    function restyleAdmin(){
        console.log('resize');
        var width = window.innerWidth;
        if(width < 716){
            console.log('resize under 400');
            card.classList.add('mobileAdmin');
        }else{
            console.log('resize over 400');
            card.classList.remove('mobileAdmin');
        }  
    }
    
 
         //---------------------- IMAGE RESIZE -----------------------//
  
    function imageResize(Width, Height, files, outputId) {
            
                var wantedWidth = Width;
                var wantedHeight = Height;
                var selectedFile = files[0];

                File.prototype.convertToBase64 = function(callback) {
                    var reader = new FileReader();
                reader.onload = function(e) {
                    callback(e.target.result);
                };
                reader.readAsDataURL(this);
            };

            selectedFile.convertToBase64(function(base64) {
                var img = document.createElement('img');
                img.src = base64;
                
  //----- SIZE THEY GAVE US
    
                img.onload = function() {
                   var givenWidth = img.naturalWidth;
                   var givenHeight = img.naturalHeight;
                   
  //----- CALCULATE THE RESIZE & CENTER
                   
                    var PercentA = givenWidth / wantedWidth;
                    var TestA = givenHeight / PercentA;

            if ( TestA > wantedHeight ){
                    var resizeWidth = givenWidth / PercentA;
                    var resizeHeight = givenHeight / PercentA; 
            } else {
                    var PercentB = givenHeight / wantedHeight; 
                    var resizeWidth = givenWidth / PercentB;
                    var resizeHeight = givenHeight / PercentB; 
            }
                    var centerWidth = 0 - ((resizeWidth - wantedWidth) /2);
                    var centerHeight = 0 - ((resizeHeight - wantedHeight) /2);
                    
 //----- PAINT THE CANVAS
                        
                    // improve final qulaity with progressive downsampling
                    // Clauculate the number of samples to reduce by 50% for each sample, from original to target   
                                
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = Width;
                    canvas.height = Height;
                    ctx.drawImage(this, centerWidth, centerHeight, resizeWidth, resizeHeight);
                    document.getElementById(outputId).src = canvas.toDataURL();
                    
                    
                };
            });
        }; // END image resize
    
    
    function welcomeUpload(){
        var image = document.getElementById("welcomeUpload").files;
        var imageResized = imageResize(400, 400, image, 'weclomeImage')
    }
    
    function saveWelcome(){
        var image = document.getElementById("weclomeImage").src;
        var text = document.getElementById("welcomeText").value;
        var uid = localStorage.getItem("uid");
        socket.emit('saveWelcome', { image:image, text:text, uid:uid });
        document.getElementById("saveWelcome").value = "SAVING..."; 
    }
    
    function getWelcome(){
         var uid = localStorage.getItem("uid");
         socket.emit('getWelcome', { uid:uid });
    }
    
    function messageUpload(){
        var image = document.getElementById("messageUpload").files;
        var imageResized = imageResize(400, 400, image, 'messageImage')
    }
    
    function sendMessage(){
        var image = document.getElementById("").src;
        var text = document.getElementById("").value;
        var uid = localStorage.getItem("uid");
        socket.emit('sendSMS',{ image:image, text:text, uid:uid});
        document.getElementById("sendMessage").value = "SENDING...";
    }
    
    function getMessage(){
        var uid = localStorage.getItem("uid");
        socket.emit('getMessage',{uid:uid});
    }
    
//----- Incoming Socket

//-- Auth Admin
  socket.on('authAdmin', function (data) {
        if(data.auth == 'passed'){
            var card = document.getElementById("body");
            card.classList.remove("hide");
            document.getElementById("subscriberCount").innerHTML = data.subscribers;
        } else {
            window.location="./welcome/";
        } 
  });

//-- Phone number    
  socket.on('phoneNumberGood', function (data) {
        window.location="http://www.hindste.in/welcome/";
  });
  
//-- Admin login
  socket.on('adminLogin', function (data) {
        if(data.login =='failed'){
            //TODO: tell the user it failed
        }
        if(data.login =='passed'){
            localStorage.setItem("uid", data.uid);
            window.location="./admin/home/";
        }
  });
  
  //-- Save Welcome
    socket.on('saveWelcome', function (data) {
        if(data.state =='saved'){
            document.getElementById("saveWelcome").value = "SAVE WELCOME"; 
            document.getElementById("weclomeImage").src = 'https://s3-us-west-2.amazonaws.com/img.hindste.in/welcome.jpg';  
        } else{
            
        }
  });
  
  //-- Get Welcome
  socket.on('getWelcome', function (data) {
      document.getElementById("weclomeImage").src = 'https://s3-us-west-2.amazonaws.com/img.hindste.in/welcome.jpg'; 
      document.getElementById("welcomeText").value = data.text;   
  })
  
  //-- Send Message
  socket.on('sendMessage', function (data) {
      if(data.state =='complete'){
          document.getElementById("sendMessage").value = "SEND MESSAGE";    
      }
  })
  

 ///---------------------- END ------------------------     
})();