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

    bitbucket.downloadRepository('TdNo4SIQlHhro9-QnkUviFq9J7joVjbT8pwT2nkHTlwi_3yzmPg8TLnGfvMLhq-rDngxaPVgqhcBNhp8mv0=','moba',function(err,content){
        if(err){
            console.log(err);
        } else {
            console.log('got content',content);
        }
    });
}


main();