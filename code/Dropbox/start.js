/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    //server = require('./grpc/server'),
    connector = require('./dropbox');


connector.getFileTree('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7','',function(err,dirs){
   if(err){
       console.log(err);
   } else {
       console.log(dirs);
   }
});
