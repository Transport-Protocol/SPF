/**
 * Created by PhilippMac on 01.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    google = require('./google'),
    server = require('./grpc/server');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    winston.log('info', 'Google service init succesful');
}


function main() {
    init();
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();

    var access_token = 'ya29.CjBcA_1gRLtSIGg-RTkYiIf2q7C7wxbm_HM3RO6HbwowVkQ1dTWl6bios9zIDQBe8PE';
    fs.readFile("./test.pdf", function (err, data) {
        google.uploadFile(access_token, 'test1', data, 'test5.pdf', function (err, msg) {
            if (err) {
                console.log(err);
            } else {
                console.log(msg);
            }
        });
    });
}


main();