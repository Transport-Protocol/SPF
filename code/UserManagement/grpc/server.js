/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    db = require('.././db/db');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var userManagementProto = grpc.load('./proto/usermanagement.proto').userManagement;
    _server = new grpc.Server();
    _server.addProtoService(userManagementProto.UserManagement.service, {
        createUser: createUser
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    db.connect();
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the createUser RPC method.
 */
function createUser(call, callback) {
    winston.log('info', 'createUser rpc method request: ' + JSON.stringify(call.request));
    db.createUser(call.request.name, call.request.password, function (err, createdUser) {
        if (err) {
            winston.log('error', 'error performing rpc method createUser: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed createUser rpc method');
        return callback(null, {status:'created'});
    });
}

