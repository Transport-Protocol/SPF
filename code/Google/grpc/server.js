/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    chunk = require('chunk'),
    path = require('path'),
    Readable = require('stream').Readable,
    connector = require('.././google');


var exports = module.exports = {};

//global var
var _server;
var _fileTransferClient;

exports.init = function (serverIp, serverPort) {
    var url = nconf.get('grpcFileTransferIp') + ':' + nconf.get('grpcFileTransferPort');
    winston.log('info', 'fileTransfer grpc url: %s', url);
    var proto = grpc.load('./proto/fileTransfer.proto').fileTransfer;
    _fileTransferClient = new proto.FileTransfer(url,
        grpc.credentials.createInsecure());


    var fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;
    _server = new grpc.Server();
    _server.addProtoService(fileStorageProto.FileStorage.service, {
        getFile: getFile,
        getFileTree: getFileTree,
        uploadFile: uploadFile,
        fileTransfer: fileTransfer
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
function getFile(call) {
    winston.log('info', 'getFile rpc method request: ' + JSON.stringify(call.request));
    var request = connector.getFile(call.request.auth.token, call.request.path, function (err, request) {
        if (err) {
            call.write({err: err});
        } else {
            var endStream = false;
            request.on('response', function (response) {
                if (response.statusCode >= 400 && response.statusCode <= 499) {
                    console.log('statuscode error found');
                    endStream = true;
                    call.write({err: {msg: response.statusMessage, code: response.statusCode}});
                }
                response.on('error', function (err) {
                    console.log('http error found');
                    if (!endStream) call.write({err: err});
                });
                response.on('data', function (chunk) {
                    console.log('chunk received');
                    if (!endStream) call.write({chunk: chunk});
                });
                response.on('end', function () {
                    console.log('end');
                    call.end();
                });
            });
        }
    });
}

/**
 * Implements the FileTransfer RPC method.
 * encrypt basic auth
 * getfile
 * wenn fehler,return
 * wenn ok, sende chunks an filetransferservice
 */
function fileTransfer(call, callback) {
    winston.log('info', 'fileTransfer rpc method request: ' + JSON.stringify(call.request));
    connector.getFile(call.request.auth.token, call.request.path, function (err, getFileRequest) {
        if (err) {
            return callback(null, {err: err});
        } else {
            getFileRequest.on('response', function (response) {
                if (response.statusCode >= 400 && response.statusCode <= 499) {
                    console.log('statuscode error found');
                    return callback(null, {err: {msg: response.statusMessage, code: response.statusCode}});
                } else {
                    var metadata = new grpc.Metadata();
                    metadata.add('service', call.request.targetService);
                    metadata.add('username', call.request.userName);
                    metadata.add('filename', path.basename(call.request.path));
                    metadata.add('path', path.dirname(call.request.path));
                    var transferCall = _fileTransferClient.transferTo(metadata, function (err, response) {
                        if (err) {
                            return callback(null, {err: {msg: 'Transfer Service offline', code: 502}});
                        } else {
                            if (response.err) {
                                return callback(null, {err: response.err, errStatusCode: response.errStatusCode});
                            }
                            return callback(null, {status: response.status});
                        }
                    });
                    response.on('data', function (chunk) {
                        transferCall.write({chunk: chunk});
                    });
                    response.on('end', function () {
                        console.log('end stream');
                        transferCall.end();
                    });
                }
            });
        }
    });
}


/**
 * Implements the GetFileTree RPC method.
 */
function getFileTree(call, callback) {
    winston.log('info', 'getFileTree rpc method request: ' + JSON.stringify(call.request));
    connector.getFileTree(call.request.auth.token, call.request.path, function (err, dirs) {
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
 * Create read stream
 * encrypt basic auth
 * write grpc data into readstream
 * uploadfile request and pipe readstream into request
 */
function uploadFile(call, callback) {
    winston.log('info', 'uploadFile rpc method request');
    var readStream = Readable();
    readStream._read = function () {
    };
    connector.uploadFile(call.metadata.get('authToken')[0], call.metadata.get('path')[0], call.metadata.get('fileName')[0], function (err, request) {
        if (err) {
            return callback(null, {err: {msg: err.msg, code: 500}});
        } else {
            call.on('data', function (chunk) {
                readStream.push(chunk['chunk']);
            });

            call.on('end', function () {
                readStream.push(null);
            });

            readStream.pipe(request);

            var grpcCallAnswered = false;
            request.on('response', function (response) {
                if (response.statusCode >= 400 && response.statusCode <= 499) {
                    console.log('statuscode error found');
                    grpcCallAnswered = true;
                    return callback(null, {err: {msg: response.statusMessage, code: response.statusCode}});
                }

                response.on('end', function () {
                    if (!grpcCallAnswered) return callback(null, {status: 'ok'});
                });
            });
        }
    });
}