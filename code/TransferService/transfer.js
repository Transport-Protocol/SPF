/**
 * Created by PhilippMac on 10.01.17.
 */
"use strict";
process.chdir(__dirname); //set working directory to path of file that is being executed
var winston = require('winston'),
    grpc = require('grpc'),
    chunk = require('chunk'),
    nconf = require('nconf');


var grpcServices = [];

function GrpcService(name, grpcClient, authType) {
    this.name = name;
    this.grpcClient = grpcClient;
    this.authType = authType || 'OAUTH2';
}

function init() {
    initGrpcServices();
}

function initGrpcServices() {
    var url = nconf.get('authServiceIp') + ':' + nconf.get('authServicePort');
    winston.log('info', 'userservice grpc url: %s', url);
    var proto = grpc.load('./proto/authentication.proto').authentication;
    var authService = new proto.Authentication(url,
        grpc.credentials.createInsecure());
    grpcServices.push(new GrpcService('USERAUTH', authService));

    var fsProto = grpc.load('./proto/fileStorage.proto').fileStorage;

    url = nconf.get('owncloudServiceIp') + ':' + nconf.get('owncloudServicePort');
    winston.log('info', 'owncloud grpc url: %s', url);
    var ownCloud = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    grpcServices.push(new GrpcService('OWNCLOUD', ownCloud, 'BASIC'));

    url = nconf.get('dropboxServiceIp') + ':' + nconf.get('dropboxServicePort');
    winston.log('info', 'dropbox grpc url: %s', url);
    var dropbox = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    grpcServices.push(new GrpcService('DROPBOX', dropbox));

    url = nconf.get('googleServiceIp') + ':' + nconf.get('googleServicePort');
    winston.log('info', 'google grpc url: %s', url);
    var google = new fsProto.FileStorage(url,
        grpc.credentials.createInsecure());
    grpcServices.push(new GrpcService('GOOGLE', google));
}

function _getGrpcServiceByName(name) {
    let upperCased = name.toUpperCase();
    for (let i = 0; i < grpcServices.length; i++) {
        if (grpcServices[i].name === upperCased) {
            return grpcServices[i].grpcClient;
        }
    }
}

function _getAuthTypeByServiceName(name) {
    let upperCased = name.toUpperCase();
    for (let i = 0; i < grpcServices.length; i++) {
        if (grpcServices[i].name === upperCased) {
            return grpcServices[i].authType;
        }
    }
}

function _getAuth(serviceName, targetUser, callback) {
    var service = _getGrpcServiceByName('USERAUTH');
    service.getAuthentication({
        service: serviceName.toUpperCase(),
        username: targetUser
    }, function (err, response) {
        if (err) {
            return callback({msg:'User service for authentication offline',code:502});
        }
        if (response.err) {
            return callback({msg:'Authentication for ' + serviceName + ' not set',code:407});
        } else {
            return callback(null, response.token);
        }
    });
}

function _uploadFile(auth, fileName, path, serviceName, grpcCall, callback) {
    var service = _getGrpcServiceByName(serviceName);

    var metadata = new grpc.Metadata();
    metadata.add('path', path);
    metadata.add('fileName', fileName);
    metadata.add('authToken', auth.token);

    var call = service.uploadFile(metadata, function (err, response) {
        if (err) {
            return callback(err);
        }
        if (response.err) {
            winston.log('info','error while uploading file');
            return callback(response.err);
        }
        return callback(null, response.status);
    });

    grpcCall.on('data', function (chunk) {
        console.log('transfer chunk received');
        call.write({
            chunk: chunk['chunk']
        })
    });
    grpcCall.on('end', function () {
        console.log('end stream');
        call.end();
    });
}

function _setAuthorization(token, authType) {
    var parsedToken;
    if (authType === 'OAUTH2') {
        parsedToken = token;
    } else if (authType === 'BASIC') {
        parsedToken = token;
    }
    return {token: parsedToken, type: authType};
}

function toFileStorage(service, targetUser, fileName, path, grpcCall, callback) {
    _getAuth(service, targetUser, function (err, auth) {
        if (err) {
            return callback(err);
        } else {
            _uploadFile(_setAuthorization(auth, _getAuthTypeByServiceName(service)), fileName, path, service, grpcCall, function (err, status) {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, status);
                }
            });
        }
    });
}

module.exports = {
    init: init,
    toFileStorage: toFileStorage
};