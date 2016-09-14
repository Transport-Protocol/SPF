/**
 * Created by PhilippMac on 01.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    slack = require('./slack');
    //server = require('./grpc/server');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    winston.log('info', 'Google service init succesful');
}


function main() {
    init();
    //server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    //server.start();

    var access_token = 'xoxp-11952872597-11961057271-79718090480-c8f859272a';

    slack.getChannelList(access_token,function(err,channelList){
        if(err){
            console.log(err);
        } else {
            console.log(channelList);
        }
    });

    slack.getChannelMessages(access_token,'C0BU2EU4Q',function(err,messages){
       if(err){
           console.log(err);
       } else {
           console.log(messages);
       }
    });
}


main();