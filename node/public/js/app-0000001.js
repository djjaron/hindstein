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
    document.getElementById("sendPhoneNumber").addEventListener("click", sendPhoneNumber);
    document.getElementById("phoneNumber").addEventListener("focus", addCountryCode);
    window.addEventListener("load", restylePhoneNumber);
    window.addEventListener("resize", restylePhoneNumber);

//----- Functoins
    function sendPhoneNumber() {
        var phoneNumber = document.getElementById("phoneNumber").value;
        socket.emit('phoneNumber', { phoneNumber: phoneNumber});
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
    }
    
//----- Incoming Socket
    
  socket.on('phoneNumber', function (data) {
    console.log(data);
  });


 ///---------------------- END ------------------------     
})();