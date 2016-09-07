/**
 * Created by PhilippMac on 01.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    server = require('./grpc/server'),
    bitbucket = require('./bitbucket');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    winston.log('info', 'Bitbucket service init succesful');
}


function main() {
    init();
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();
}


main();