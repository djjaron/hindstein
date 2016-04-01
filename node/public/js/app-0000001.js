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

 ///---------------------- END ------------------------     
})();