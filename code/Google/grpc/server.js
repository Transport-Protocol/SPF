/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    connector = require('.././google');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;
    _server = new grpc.Server();
    _server.addProtoService(fileStorageProto.FileStorage.service, {
        getFile: getFile,
        getFileTree: getFileTree,
        uploadFile: uploadFile
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the GetFile RPC method.
 */
function getFile(call, callback) {
    winston.log('info', 'getFile rpc method request: ' + JSON.stringify(call.request));
    connector.getFile(call.request.auth.token, call.request.path, function (err, fileName, fileBuffer) {
        if (err) {
            winston.log('error', 'error performing getFile: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getFile rpc method');
        return callback(null, {fileName: fileName, fileBuffer: fileBuffer});
    });
}


/**
 * Implements the GetFileTree RPC method.
 */
function getFileTree(call, callback) {
    winston.log('info', 'getFileTree rpc method request: ' + JSON.stringify(call.request));
    connector.getFileTree(call.request.auth.token, call.request.path, function (err, dirs) {
        if (err) {
            winston.log('error', 'error performing getFileTree: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getFileTree rpc method',dirs);
        return callback(null, {dirs: JSON.stringify(dirs)});
    });
}

/**
 * Implements the UploadFile RPC method.
 */
function uploadFile(call, callback) {
    winston.log('info', 'uploadFile rpc method request');
    connector.uploadFile(call.request.auth.token, call.request.path, call.request.fileBuffer, call.request.fileName, function (err, status) {
        if (err) {
            winston.log('error', 'error performing uploadFile: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed uploadFile rpc method');
        return callback(null, {status: status});
    });
}