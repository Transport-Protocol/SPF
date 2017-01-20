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
function getFile(call) {
    winston.log('info', 'getFile rpc method request: ' + JSON.stringify(call.request));
    var filePath = call.request.filePath;
    if(filePath === ''){
        filePath = '/'; //if empty dir,set to root
    }
    connector.getFile(call.request.teamName, filePath, function (err, getFileCall) {
        if (err) {
            winston.log('error', 'error performing getFile: ', err);
            call.write({err: err});
            call.end();
        } else {
            getFileCall.on('data',function(chunk){
               call.write({chunk: chunk.chunk});
            });
            getFileCall.on('end',function(){
               call.end();
                winston.log('info', 'succesfully performed getFile rpc method');
            });
        }
    });
}


/**
 * Implements the GetFileTree RPC method.
 */
function getFileTree(call, callback) {
    winston.log('info', 'getFileTree rpc method request: ' + JSON.stringify(call.request));
    var filePath = call.request.filePath;
    if(filePath === ''){
        filePath = '/'; //if empty dir,set to root
    }
    connector.getFileTree(call.request.teamName,filePath, function (err, dirs) {
        if (err) {
            winston.log('error', 'error performing getFileTree: ', err);
            return callback(null, {err: err});
        }
        winston.log('info', 'succesfully performed getFileTree rpc method', dirs);
        return callback(null, {dirs: JSON.stringify(dirs)});
    });
}

/**
 * Implements the UploadFile RPC method.
 */
function uploadFile(call, callback) {
    winston.log('info', 'uploadFile rpc method request');
    var filePath = call.metadata.get('path')[0];
    if(filePath === ''){
        filePath = '/'; //if empty dir,set to root
    }
    connector.uploadFile(call.metadata.get('username')[0],call.metadata.get('teamName')[0], call.metadata.get('serviceName')[0].toUpperCase(),filePath, call.metadata.get('fileName')[0],call, function (err, status) {
        if (err) {
            winston.log('error', 'error performing uploadFile: ', err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed uploadFile rpc method');
        return callback(null, {status: status});
    });
}
