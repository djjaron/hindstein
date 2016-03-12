/* global process */
/* global require */
/* global console */
/* global module */
/* global document */
/* global __dirname */

'use strict';

(function () {
///---------------------- START ------------------------    
    
    
    console.log('STARTING');

    document.getElementById("sendPhoneNumber").addEventListener("click", sendPhoneNumber);

    var sendPhoneNumber = function () {
        console.log('FIRE BUTTON');
        var phoneNumber = document.getElementById("phoneNumber");
        console.log(phoneNumber);
    };
   
 ///---------------------- END ------------------------     
})();