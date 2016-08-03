/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    //server = require('./grpc/server'),
    dropbox = require('./dropbox');


dropbox.getFileTree('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7','/BA',function(err,dirs){
   if(err){
       console.log(err);
   } else {
       console.log(dirs);
   }
});


dropbox.getFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7','awsCommands.txt',function(err,fileName,fileBuffer){
    if(err){
        console.log(err);
    } else {
        console.log(fileName);
        console.log(fileBuffer);
    }
});


dropbox.uploadFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7','BA1','adasdad','test.txt',function(err,status){
    if(err){
        console.log(err);
    } else {
        console.log(status);
    }
});