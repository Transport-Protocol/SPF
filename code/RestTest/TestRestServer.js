/**
 * Created by PhilippMac on 13.07.16.
 */
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/dropbox', function (req, res) {
    res.send('Hello dropbox!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});