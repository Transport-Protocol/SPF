/**
 * Created by PhilippMac on 01.08.16.
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
    winston.log('info', 'Dropbox service init succesful');
}


function main() {
    init();
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();
}


main();