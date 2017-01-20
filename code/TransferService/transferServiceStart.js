'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var winston = require('winston'),
    fs = require('fs'),
    server = require('./grpc/server'),
    nconf = require('nconf');

function init() {
    nconf.file({file: './config/config.json'});
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();
    winston.log('info', 'transfer service init succesful');
}

function main() {
    init();
}

main();