/* global process */
/* global require */
/* global console */
/* global module */
/* global __dirname */

'use strict';
var express = require('express'),
    app = express();
 
app.get('/', function (req, res) {
  res.send('Hello World');
});
 
app.listen(8080);