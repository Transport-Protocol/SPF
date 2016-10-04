/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    server = require('./grpc/server'),
    nconf = require('nconf');

function init() {
    nconf.file({file: './config/config.json'});
    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    server.start();
    winston.log('info', 'SeCoFileStorage service init succesful');
}

function main() {
    init();
}

main();