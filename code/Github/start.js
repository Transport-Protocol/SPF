/**
 * Created by PhilippMac on 01.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    github = require('./github');


function init() {
   // nconf.argv()
     //   .env()
       // .file({file: './config/config.json'});
    winston.log('info', 'Github service init succesful');
}


function main() {
    init();
    //server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    //server.start();
    github.getRepositories(function(err,res){

    });
}


main();