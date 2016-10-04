/**
 * Created by PhilippMac on 24.08.16.
 *
 * https://docs.mongodb.com/manual/reference/operator/query-array/
 * https://docs.mongodb.com/manual/tutorial/model-tree-structures/#model-tree-structures-with-materialized-paths
 *
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    TeamStorage = require('./models/TeamStorage'),
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

function _createTeamStorage(teamName,callback){
    var teamStorage = new TeamStorage({
        teamName: teamName
    });
    // save  to database
    teamStorage.save(function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null, teamStorage);
    });
}

function _addFileToTeamStorage(teamStorage,fileStorage,callback){
    teamStorage.files.push(fileStorage);
    teamStorage.save(function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null, teamStorage);
    });
}

function _insertFileToTeamStorage(teamStorage,fileStorage,callback){
    _addFileToTeamStorage(teamStorage,fileStorage,function(err,teamStorage){
        if(err){
            return callback(err);
        }
        return callback(null,teamStorage);
    });
}

function _deleteFileStorage(teamStorage,seCoFP){
    for(var i = 0;i<teamStorage.files.length;i++){
        if(teamStorage.files[i].seCoFilePath === seCoFP){
            teamStorage.files.splice(i,1);
            break;
        }
    }
}

function _hasFileStorage(teamStorage,seCoFP,fileName){
    var hasFs = false;
    for(var i = 0;i<teamStorage.files.length;i++){
        if(teamStorage.files[i].seCoFilePath === seCoFP && teamStorage.files[i].fileName === fileName){
            hasFs =  true;
            break;
        }
    }
    return hasFs;
}


function insertTeamStorageEntry(teamName,fileName,seCoFp, serviceFp, username, serviceName, callback) {
    var fileStorage = {
        fileName: fileName,
        seCoFilePath: seCoFp,
        serviceFilePath: serviceFp,
        username: username,
        serviceName: serviceName
    };
    _hasTeamStorageEntry(teamName,function(err,teamStorage){
       if(err){
           return callback(err);
       }
       if(!teamStorage){
           _createTeamStorage(teamName,function(err,teamStorage){
               if(err){
                   return callback(err);
               }
                _insertFileToTeamStorage(teamStorage,fileStorage,callback);
           });
       } else {
           if(_hasFileStorage(teamStorage,fileStorage.seCoFilePath,fileStorage.fileName)){
               _deleteFileStorage(teamStorage,fileStorage.seCoFilePath);
           }
           _insertFileToTeamStorage(teamStorage,fileStorage,callback);
       }
    });
}

function getFileStorageEntry(seCoFp,fileName,teamName,callback){
    TeamStorage.findOne({teamName: teamName},function(err,entry){
       if(err){
           return callback(err);
       }
       if(!entry){
           return callback(new Error('not found'));
       } else {
           var file;
           for(var i = 0;i<entry.files.length;i++){
               if(entry.files[i].seCoFilePath === seCoFp && entry.files[i].fileName === fileName){
                   file = entry.files[i];
                   break;
               }
           }
           if(!file){
               return callback(new Error('not found'));
           }
           return callback(null,file);
       }
    });
}

function getFileStorages(teamName,callback){
    TeamStorage.findOne({teamName: teamName},function(err,entry) {
        if (err) {
            return callback(err);
        }
        if(!entry){
            return callback(new Error('no files uploaded yet'));
        }
        return callback(null,entry.files);
    });
}

function _hasTeamStorageEntry(teamName,callback){
    TeamStorage.findOne({ teamName:teamName}, function(err,teamStroage) {
       if(err){
           return callback(err);
       } else {
           if(!teamStroage){
               return callback(null,null);
           }
           return callback(null,teamStroage);
       }
    });
}

module.exports = {
    connect: connect,
    insertTeamStorageEntry: insertTeamStorageEntry,
    getFileStorageEntry: getFileStorageEntry,
    getFileStorages: getFileStorages
}