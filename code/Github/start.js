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
/*
    github.getRepositories({username:'philipphaw',password:'Injection1'},function(err,res){

    });

    github.addUserToRepo({username:'philipphaw',password:'Injection1'},'testApi','germanyforwm',function(err,res){

    });

    */

    github.getRepoFiles({username:'philipphaw',password:'Injection1'},'libgdx',function(err,res){
        if(err){
            winston.log('error',err);
        } else {
            winston.log('info',res);
        }
    });

}


main();