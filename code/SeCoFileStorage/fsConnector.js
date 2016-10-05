/**
 * Created by PhilippMac on 28.09.16.
 */
'use strict';
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


function uploadFile(username, teamName, serviceName, filePath, fileName, fileBuffer, callback) {
    //1. hole auth für den Storage dienst von usermanagement service
    authService.getAuthentication({
        username: username,
        service: serviceName
    }, function authResult(err, response) {
        if (err) {
            return callback(new Error('auth service offline'));
        } else {
            if (response.err) {
                return callback(new Error(response.err));
            } else {
                winston.log('info', 'successfully got auth from auth service.token: ', response.token);
                //2. upload file zu FS dienst in einen Folder + filepath mit dem Namen prefix+teamName (EFP)
                var serviceFp = 'SeCo' + teamName;
                _uploadToService(response.token, serviceName, serviceFp, fileName, fileBuffer, function (err, status) {
                    if (err) {
                        return callback(err);
                    } else {
                        //3. speichere FS filepath (EFP) in db und mappe es mit username + richtiger filepath (SFP) + fs service name beim upload
                        db.insertTeamStorageEntry(teamName, fileName, filePath, serviceFp, username, serviceName, function (err) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null);
                            }
                        });
                    }
                });
            }
        }
    });
}

function getFile(teamName, filePath, callback) {
    var parsed = parser.parsePath(filePath);
    if (!parsed) {
        return callback(new Error('wrong path syntax'));
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
        .then(result => {
            return callback(null, result.fileName, result.fileBuffer);
        })
        .catch(error => {
            return callback(error);
        });
}

function getFileTree(teamName, path, callback) {
    _getFileStorages(teamName)
        .then(files => {
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
                    reject(err);
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
                    reject(new Error('auth service offline'));
                }
                if (response.err) {
                    reject(new Error(response.err));
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
            _getService(serviceName).getFile({
                path: serviceFilePath + "/" + fileName,
                auth: auth
            }, function getFileResult(err, response) {
                if (err) {
                    reject(new Error(entry.serviceName + ' service offline'));
                } else {
                    var result = {
                        fileName: response.fileName,
                        fileBuffer: response.fileBuffer
                    };
                    resolve(result);
                }
            });
        });
}

function _getFileStorages(teamName) {
    return new Promise(
        function (resolve, reject) {
            db.getFileStorages(teamName, function (err, files) {
                if (err) {
                    reject(error);
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
                if (files[i].seCoFilePath.indexOf(path) != -1) {
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
                            var error = new Error('wrong path');
                            reject(error);
                        }
                        var folderName = splitted[splitted.length - 1];
                        if (!_gotFolder(dirs, folderName)) {
                            //foldername noch nicht geaddet
                            dirs.push({
                                tag: 'folder',
                                name: folderName
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

function _uploadToService(auth, serviceName, filePath, fileName, fileBuffer, callback) {
    var service = _getService(serviceName);
    var authentication = {
        token: auth
    };
    service.uploadFile({
        path: filePath,
        fileName: fileName,
        fileBuffer: fileBuffer,
        auth: authentication
    }, function uploadResult(err, response) {
        if (err) {
            return callback(new Error('auth service offline'));
        } else {
            if (response.err) {
                return callback(new Error(response.err));
            } else {
                return callback(null, response.status);
            }
        }
    });
}

function _getService(serviceName) {
    for (var i = 0; i < services.length; i++) {
        if (services[i].name === serviceName) {
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