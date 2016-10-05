/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    connector = require('.././fsConnector');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var fileStorageProto = grpc.load('./proto/seCoFileStorage.proto').seCoFileStorage;
    _server = new grpc.Server();
    _server.addProtoService(fileStorageProto.SeCoFileStorage.service, {
        getFile: getFile,
        getFileTree: getFileTree,
        uploadFile: uploadFile
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    connector.init();
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
    checkParamater(call.request, ['teamName', 'filePath'], callback);
    connector.getFile(call.request.teamName, call.request.filePath, function (err, fileName, fileBuffer) {
        if (err) {
            winston.log('error', 'error performing getFile: ', err);
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
    checkParamater(call.request, ['teamName', 'filePath'], callback);
    connector.getFileTree(call.request.teamName, call.request.filePath, function (err, dirs) {
        if (err) {
            winston.log('error', 'error performing getFileTree: ', err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getFileTree rpc method', dirs);
        return callback(null, {dirs: JSON.stringify(dirs)});
    });
}

/**
 * Implements the UploadFile RPC method.
 */
function uploadFile(call, callback) {
    winston.log('info', 'uploadFile rpc method request',call.request);
    checkParamater(call.request, ['teamName', 'filePath', 'userName', 'serviceName', 'fileName', 'fileBuffer'], callback);
    connector.uploadFile(call.request.userName, call.request.serviceName, call.request.filePath, call.request.fileName, call.request.fileBuffer, function (err, status) {
        if (err) {
            winston.log('error', 'error performing uploadFile: ', err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed uploadFile rpc method');
        return callback(null, {status: status});
    });
}

function checkParamater(request, params, callback) {
    var missingParams = [];
    for (var i = 0; i < params.length; i++) {
        var param = params[i];
        if (!request.hasOwnProperty(param)) {
            missingParams.push(param);
        } else if (request[param] === '') {
            missingParams.push(param);
        }
    }
    if (missingParams.length > 0) {
        return callback(null, {err: 'missing grpc parameter: ' + missingParams.toString()});
    }
}