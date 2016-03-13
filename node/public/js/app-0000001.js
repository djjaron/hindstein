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
    document.getElementById("number").addEventListener("click", focusPhoneNumber);
    
    
    window.addEventListener("load", restylePhoneNumber);
    window.addEventListener("resize", restylePhoneNumber);

//----- Functoins
    function sendPhoneNumber() {
        var phoneNumber = document.getElementById("phoneNumber").value;
        var cleanNumber = phoneNumber.replace(/\D/g,'');
        var raw_number = cleanNumber.replace(/[^0-9]/g, '');
        var regex1 = /^1?([2-9]..)([2-9]..)(....)$/;
        if (!regex1.test(raw_number)) {
            console.log('BAD BOY');
        } else {
            var formatted_number = cleanNumber.replace(regex1, '1 ($1) $2 $3');
            var readyNumber = formatted_number.replace(/\D/g,'');
            socket.emit('phoneNumber', { phoneNumber: '+'+readyNumber});
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
    
//----- Incoming Socket
    
  socket.on('phoneNumber', function (data) {
    console.log(data);
  });


 ///---------------------- END ------------------------     
})();