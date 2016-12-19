/**
 * Created by PhilippMac on 24.08.16.
 */
'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    server = require('./grpc/server');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    winston.log('info', 'Team management service init succesful');
}


function main() {
    init();
    server.start();
}


main();