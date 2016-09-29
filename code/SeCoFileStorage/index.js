/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    fileStorage = require('./fileStorage');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    fileStorage.init();
    winston.log('info', 'SeCoFileStorage service init succesful');
}


function main() {
    init();
/*
    fs.readFile('./Projektplan.pdf', function read(err, data) {
        if (err) {
            throw err;
        }
        fileStorage.uploadFile('test1','team2','DROPBOX','code','Projektplan2.pdf',data,function(err){
           if(err){
               winston.log('error','couldnt upload file',err);
           } else {
               winston.log('info','successfully uploaded file');
           }
        });
    });
    */

    fileStorage.getFile('team2','code',function(err,fileName,fileBuffer){
       if(err){
           winston.log('error','getFile',err);
       } else {
           winston.log('info','got file with name: %s',fileName);
       }
    });

}


main();