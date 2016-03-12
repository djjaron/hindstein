/* global process */
/* global require */
/* global console */
/* global module */
/* global __dirname */

'use strict';
var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('/public/index.html');
});

console.log('Starting Hindste');
app.listen(8080);