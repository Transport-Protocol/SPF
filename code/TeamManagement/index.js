/**
 * Created by PhilippMac on 24.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    server = require('./grpc/server');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    winston.log('info', 'Team management service init succesful');
}


function main() {
    init();
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();
}


main();