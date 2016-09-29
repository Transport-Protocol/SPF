/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    FileStorage = require('./models/FileStorage'),
    logger = require('winston');


function connect(dbPoolsize, dbPath) {
    var options = {
        db: {native_parser: true},
        server: {poolSize: dbPoolsize},
        user: '', //local access no user needed
        pass: ''
    };

    mongoose.connect(dbPath, options);
    var connection = mongoose.connection;
    connection.on('error', function callback(err) {
        logger.log('error', err);
        throw err;
    });
    connection.once('open', function callback() {
        //enable keep alive so a long session cant be interrupted
        options.server.socketOptions = options.replset.socketOptions = {keepAlive: 1};
        logger.log('info', "connect to db: ", connection.name, " successful!");
    });
}

function insertFileStorageEntry(seCoFp, serviceFp, username, serviceName,teamName, callback) {
    _deleteEntry(seCoFp,teamName,function (){
        var newEntry = new FileStorage({
            seCoFilePath: seCoFp,
            serviceFilePath: serviceFp,
            username: username,
            teamName: teamName,
            serviceName: serviceName
        });

        // save  to database
        newEntry.save(function (err) {
            if (err) {
                logger.log('error', 'creating new FileStorage Entry', err);
                return callback(err);
            }
            logger.log('info', 'successfully created FileStorage Entry');
            return callback(null, newEntry);
        });
    });
}

function _deleteEntry(seCoFp,teamName,callback){
    FileStorage.find({ seCoFilePath:seCoFp,teamName: teamName }).remove( function(err) {
       if(err){
           logger.log('info','entry didnt exist,nothing to delete');
           return callback(null);
       } else {
           logger.log('info','deleted entry');
           return callback(null);
       }
    });
}

module.exports = {
    connect: connect,
    insertFileStorageEntry: insertFileStorageEntry
}