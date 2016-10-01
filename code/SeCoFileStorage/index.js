/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    db = require('./db/db'),
    fsConnector = require('./fsConnector'),
    TeamStorage = require('./db/models/TeamStorage');


function init() {
    nconf.file({file: './config/config.json'});
    fsConnector.init();
    //db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));
    winston.log('info', 'SeCoFileStorage service init succesful');
}


function main() {
    init();


    /*
     db.insertTeamStorageEntry('team2','file2','test/seco','documents/today','user2','GOOGLE',function(err,entry){
     if(err){
     winston.log('error',err);
     } else {
     winston.log('info','added');
     }
     });
     */

    /*
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
     */

}


main();