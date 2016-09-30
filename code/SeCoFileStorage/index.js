/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    db = require('./db/db'),
    TeamStorage = require('./db/models/TeamStorage');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    //fileStorage.init();
    db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));
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
    /*
     fileStorage.getFile('team2','code',function(err,fileName,fileBuffer){
     if(err){
     winston.log('error','getFile',err);
     } else {
     winston.log('info','got file with name: %s',fileName);
     }
     });

     */
    /*
     db.insertTeamStorageEntry('team2','file2','test/seco','documents/today','user2','GOOGLE',function(err,entry){
     if(err){
     winston.log('error',err);
     } else {
     winston.log('info','added');
     }
     });
     */

    db.insertTeamStorageEntry('team3', 'file2', 'test/seco', 'documents/today', 'user3', 'GOOGLE', function (err, entry) {
        if (err) {
            winston.log('error', err);
        } else {
            winston.log('info', 'added');
        }
    });



    db.getFileStorageEntry('test/seco', 'team2', function (err, entry) {
        var start = new Date().getMilliseconds();
        if (err) {
            winston.log('error', err);
        } else {
            winston.log('info', 'retrieved in %d', new Date().getMilliseconds() - start);
        }
    });

}


main();