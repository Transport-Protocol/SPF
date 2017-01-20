/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    grpcFileStreamer = require('./grpcFileStreamer'),
    transfer = require('.././transfer');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var fileTransferProto = grpc.load('./proto/fileTransfer.proto').fileTransfer;
    _server = new grpc.Server();
    _server.addProtoService(fileTransferProto.FileTransfer.service, {
        transferTo: transferTo
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    transfer.init();
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the TransferTo RPC method.
 */
function transferTo(call, callback) {
    winston.log('info', 'transferTo rpc method request');
    winston.log('info', 'encrypted basic auth');
    transfer.toFileStorage(call.metadata.get('service')[0], call.metadata.get('username')[0], call.metadata.get('filename')[0], call.metadata.get('path')[0], call, function (err, status) {
        if (err) {
            callback(null, {err: err});
        } else {
            callback(null, {status: status});
        }
    });
}
