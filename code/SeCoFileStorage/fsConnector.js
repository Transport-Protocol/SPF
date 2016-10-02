/**
 * Created by PhilippMac on 28.09.16.
 */
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
    //1. hole entry aus db anhand von filepath(SFP) und teamname.
    db.getFileStorageEntry(parsed.path, parsed.fileName, teamName, function (err, entry) {
        if (err) {
            return callback(err);
        }
        //2. hole auth von user service anhand des username + service
        authService.getAuthentication({
            username: entry.username,
            service: entry.serviceName
        }, function authResult(err, response) {
            if (err) {
                return callback(new Error('auth service offline'));
            } else {
                if (response.err) {
                    return callback(new Error(response.err));
                } else {
                    //3. getFIle vom Service mit auth und gemapptem filepath
                    var auth = {
                        token: response.token,
                        type: "OAUTH2"
                    };
                    _getService(entry.serviceName).getFile({
                        path: entry.serviceFilePath + "/" + entry.fileName,
                        auth: auth
                    }, function getFileResult(err, response) {
                        if (err) {
                            return callback(new Error(entry.serviceName + ' service offline'));
                        } else {
                            return callback(null, response.fileName, response.fileBuffer);
                        }
                    });
                }
            }
        });
    });
}

function getFileTree(teamName, path, callback) {
    //1. Hole filestorages array
    db.getFileStorages(teamName, function (err, files) {
        if (err) {
            return callback(err);
        }
        var dirs = [];
        //2. schreibe alle files mit dem gleichen path heraus
        for (var i = 0; i < files.length; i++) {
            if (files[i].seCoFilePath.indexOf(path) != -1) {
                //eintrag ist file oder folder
                if(files[i].seCoFilePath.length === path.length){
                    //ist eine file
                    dirs.push({
                        tag: 'file',
                        name: files[i].fileName
                    })
                } else {
                    //ist ein directory
                    var splitted = files[i].seCoFilePath.split('/');
                    if(splitted.length === 0){
                        //falscher path aufbau
                        return callback(new Error('wrong path'));
                    }
                    var folderName = splitted[splitted.length-1];
                    if(!_gotFolder(dirs,folderName)){
                        //foldername noch nicht geaddet
                        dirs.push({
                            tag: 'folder',
                            name: folderName
                        })
                    }
                }
            }
        }
        return callback(null,dirs);
    });
}

function _gotFolder(dirs,folder){
    var gotF = false;
    for(var i = 0;i<dirs.length;i++){
        if(dirs[i].name === folder){
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
}