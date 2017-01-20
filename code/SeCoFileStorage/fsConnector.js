/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    parser = require('./pathParser'),
    db = require('./db/db');


var authService;
var services = [];

function init() {
    db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));

    var url = nconf.get('authServiceIp') + ':' + nconf.get('authServicePort');
    winston.log('info', 'userservice grpc url: %s', url);
    var proto = grpc.load('./proto/authentication.proto').authentication;
    authService = new proto.Authentication(url,
        grpc.credentials.createInsecure());

    var fsProto = grpc.load('./proto/fileStorage.proto').fileStorage;

    url = nconf.get('owncloudServiceIp') + ':' + nconf.get('owncloudServicePort');
    winston.log('info', 'owncloud grpc url: %s', url);
    var ownCloud = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    services.push({name: 'OWNCLOUD', service: ownCloud});

    url = nconf.get('dropboxServiceIp') + ':' + nconf.get('dropboxServicePort');
    winston.log('info', 'dropbox grpc url: %s', url);
    var dropbox = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    services.push({name: 'DROPBOX', service: dropbox});

    url = nconf.get('googleServiceIp') + ':' + nconf.get('googleServicePort');
    winston.log('info', 'google grpc url: %s', url);
    var google = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    services.push({name: 'GOOGLE', service: google});
}


/*
 SeCo Filepath (SFP): normaler Pfad
 externer Filepath (EFP): Pfad beim fs service(dropbox,google,owncloud)
 */


function uploadFile(username, teamName, serviceName, filePath, fileName, grpcCall, callback) {
    //1. hole auth für den Storage dienst von usermanagement service
    authService.getAuthentication({
        username: username,
        service: serviceName.toUpperCase()
    }, function authResult(err, response) {
        if (err) {
            return callback({msg:'auth service offline', code:502});
        } else {
            if (response.err) {
                return callback({msg:response.err,code:500});
            } else {
                winston.log('info', 'successfully got auth from auth service.token: ', response.token);
                //2. upload file zu FS dienst in einen Folder + filepath mit dem Namen prefix+teamName (EFP)
                filePath = _parsePath(filePath);
                winston.log('info', 'parsed filePath: ' + filePath);
                var serviceFp = 'ServiceComposition-' + teamName;
                _uploadToService(response.token, serviceName, serviceFp, fileName, grpcCall, function (err, status) {
                    if (err) {
                        return callback(err);
                    } else {
                        //3. speichere FS filepath (EFP) in db und mappe es mit username + richtiger filepath (SFP) + fs service name beim upload
                        db.insertTeamStorageEntry(teamName, fileName, filePath, serviceFp, username, serviceName, function (err) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null,status);
                            }
                        });
                    }
                });
            }
        }
    });
}

function _parsePath(path) {
    var parsed = 'root';
    if (path !== '' && path !== '/') {
        if (path.charAt(0) === '/') {
            parsed = 'root' + path;
        } else {
            parsed = 'root/' + path;
        }
    }
    return parsed;
}

function getFile(teamName, filePath, callback) {
    var parsed = parser.parsePath(filePath);
    if (!parsed) {
        return callback({msg:'wrong path syntax',code:400});
    }
    console.log('parsed ' + parsed.path + '   ' + parsed.fileName);
    var fileEntry;
    _getFileStoragesByPathNameTeam(parsed.path, parsed.fileName, teamName)
        .then(entry => {
            fileEntry = entry;
            return _getAuthentication(entry.username, entry.serviceName);
        })
        .then(token => {
            return _getFileFromService(token, fileEntry.serviceName, fileEntry.serviceFilePath, fileEntry.fileName);
        })
        .then(grpcCall => {
            return callback(null, grpcCall);
        })
        .catch(error => {
            return callback(error);
        });
}

function getFileTree(teamName, path, callback) {
    _getFileStorages(teamName)
        .then(files => {
            path = _parsePath(path);
            winston.log('info', 'parsed path: ' + path);
            return _getFilesInPath(files, path);
        })
        .then(dirs => {
            return callback(null, dirs);
        })
        .catch(error => {
            return callback(error);
        });
}


/*******PRIVATE FUNCTIONS**********/

function _getFileStoragesByPathNameTeam(path, fileName, teamName) {
    return new Promise(
        function (resolve, reject) {
            db.getFileStorageEntry(path, fileName, teamName, function (err, entry) {
                if (err) {
                    reject({msg:err.message,code:500});
                }
                resolve(entry);
            });
        });
}

function _getAuthentication(username, serviceName) {
    return new Promise(
        function (resolve, reject) {
            authService.getAuthentication({
                username: username,
                service: serviceName
            }, function authResult(err, response) {
                if (err) {
                    reject({msg:'auth service offline',code:502});
                }
                if (response.err) {
                    reject({msg:'auth not set for service: ' + serviceName,code:401});
                }
                resolve(response.token);
            });
        });
}

function _getFileFromService(token, serviceName, serviceFilePath, fileName) {
    return new Promise(
        function (resolve, reject) {
            var auth = {
                token: token,
                type: "OAUTH2"
            };
            var grpcCall =_getService(serviceName).getFile({path: serviceFilePath + "/" + fileName, auth: auth});
            if(!grpcCall) reject({msg:'unexpected error',code:500});
            resolve(grpcCall);
        });
}

function _getFileStorages(teamName) {
    return new Promise(
        function (resolve, reject) {
            db.getFileStorages(teamName, function (err, files) {
                if (err) {
                    reject({msg: err.message, code: 500});
                }
                resolve(files);
            });
        });
}

function _getFilesInPath(files, path) {
    return new Promise(
        function (resolve, reject) {
            var dirs = [];
            for (var i = 0; i < files.length; i++) {
                if (files[i].seCoFilePath.indexOf(path) !== -1) {
                    //eintrag ist file oder folder
                    if (files[i].seCoFilePath.length === path.length) {
                        //ist eine file
                        dirs.push({
                            tag: 'file',
                            name: files[i].fileName
                        })
                    } else {
                        //ist ein directory
                        var splitted = files[i].seCoFilePath.split('/');
                        if (splitted.length === 0) {
                            //falscher path aufbau
                            reject({msg: 'wrong path', code: 400});
                        }
                        var targetIndex;
                        for (var j = 0; j < splitted.length; j++) {
                            if (path.indexOf(splitted[j]) === -1) {
                                targetIndex = j;
                                break;
                            }
                        }
                        if (!_gotFolder(dirs, splitted[targetIndex])) {
                            //foldername noch nicht geaddet
                            dirs.push({
                                tag: 'folder',
                                name: splitted[targetIndex]
                            })
                        }
                    }
                }
            }
            resolve(dirs);
        });
}

function _gotFolder(dirs, folder) {
    var gotF = false;
    for (var i = 0; i < dirs.length; i++) {
        if (dirs[i].name === folder) {
            gotF = true;
            break;
        }
    }
    return gotF;
}

function _uploadToService(auth, serviceName, filePath, fileName, grpcCall, callback) {
    var service = _getService(serviceName);
    var metadata = new grpc.Metadata();
    metadata.add('authToken',auth);
    metadata.add('path',filePath);
    metadata.add('fileName',fileName);
    var uploadFileCall = service.uploadFile(metadata, function uploadResult(err, response) {
        if (err) {
            return callback({msg: serviceName + ' service is offline',code: 502});
        } else {
            if (response.err) {
                return callback(response.err);
            } else {
                return callback(null, response.status);
            }
        }
    });

    grpcCall.on('data',function(chunk){
       uploadFileCall.write({chunk:chunk.chunk});
    });

    grpcCall.on('end', function(){
       uploadFileCall.end();
    });
}

function _getService(serviceName) {
    for (var i = 0; i < services.length; i++) {
        if (services[i].name === serviceName.toUpperCase()) {
            return services[i].service
        }
    }
    return null;
}


module.exports = {
    init: init,
    uploadFile: uploadFile,
    getFile: getFile,
    getFileTree: getFileTree
};