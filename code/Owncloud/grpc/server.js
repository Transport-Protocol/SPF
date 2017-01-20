/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    path = require('path'),
    Readable = require('stream').Readable,
    path = require('path'),
    connector = require('.././owncloud');


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
    winston.log('info', 'RPC init succesful on ' + serverUri);
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
    var encrypted = _basicAuthEncryption(call.request.auth.token);
    var request = connector.getFile(encrypted.username, encrypted.password, call.request.path);
    var endStream = false;
    request.on('response', function (response) {
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            console.log('statuscode error found');
            endStream = true;
            call.write({err: {msg: response.statusMessage, code: response.statusCode}});
        }
        response.on('error', function (err) {
            console.log('http error found');
            if (!endStream) call.write({err: {msg: err.message, code: 500}});
        });
        response.on('data', function (chunk) {
            if (!endStream) call.write({chunk: chunk});
        });
        response.on('end', function () {
            console.log('end stream');
            call.end();
        });
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
    var encrypted = _basicAuthEncryption(call.request.auth.token);
    var getFileRequest = connector.getFile(encrypted.username, encrypted.password, call.request.path);
    getFileRequest.on('response', function (response) {
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            console.log('statuscode error found');
            call.write({err: {msg: response.statusMessage, code: response.statusCode}});
        } else {
            var metadata = new grpc.Metadata();
            metadata.add('service', call.request.targetService);
            metadata.add('username', call.request.userName);
            metadata.add('filename', path.basename(call.request.path));
            metadata.add('path', path.dirname(call.request.path));
            var transferCall = _fileTransferClient.transferTo(metadata, function (err, response) {
                if (err) {
                    return callback(null, {err: {msg:'Transfer Service offline', code: 502}});
                } else {
                    if (response.err) {
                        return callback(null, {err: response.err});
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


/**
 * Implements the GetFileTree RPC method.
 */
function getFileTree(call, callback) {
    winston.log('info', 'getFileTree rpc method request: ' + JSON.stringify(call.request));
    var encrypted = _basicAuthEncryption(call.request.auth.token);
    connector.getFileTree(encrypted.username, encrypted.password, call.request.path, function (err, dirs) {
        if (err) {
            winston.log('error', 'error performing getFileTree: ', err);
            return callback(null, {err: err});
        }
        winston.log('info', 'succesfully performed getFileTree rpc method', dirs);
        return callback(null, {dirs: dirs});
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
    var encrypted = _basicAuthEncryption(call.metadata.get('authToken')[0]);
    winston.log('info', 'encrypted basic auth');
    connector.uploadFile(encrypted.username, encrypted.password, call.metadata.get('path')[0], call.metadata.get('fileName')[0], function (request) {
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
                call.write({err: {msg: response.statusMessage, code: response.statusCode}});
            }

            response.on('end', function () {
                if (!grpcCallAnswered) return callback(null, {status: 'ok'});
            });
        });
    });
}

function _basicAuthEncryption(token) {
    var withoutBasic = token.substr(6);
    var readableString = new Buffer(withoutBasic, 'base64').toString();
    var userPasswordArray = readableString.split(':');
    return {username: userPasswordArray[0], password: userPasswordArray[1]};
}