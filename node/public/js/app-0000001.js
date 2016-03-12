/* global process */
/* global require */
/* global console */
/* global module */
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

//----- Functoins
    function sendPhoneNumber() {
        var phoneNumber = document.getElementById("phoneNumber").value;
        socket.emit('phoneNumber', { phoneNumber: phoneNumber});
    }
    
//----- Incoming Socket
    
  socket.on('phoneNumber', function (data) {
    console.log(data);
  });


 ///---------------------- END ------------------------     
})();