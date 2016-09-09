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

    var access_token = 'ya29.Ci9ZAzLmuWRBTv4RNIwDcahsznBFhCTOpwGsp4YvG7c8HFTXlR3G4LckkO_Db10MfA';



}


main();