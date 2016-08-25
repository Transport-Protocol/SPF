/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    db = require('.././db/db');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var userManagementProto = grpc.load('./proto/usermanagement.proto').userManagement;
    _server = new grpc.Server();
    _server.addProtoService(userManagementProto.UserManagement.service, {
        register: register,

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
function register(call, callback) {
    winston.log('info', 'createUser rpc method request: ' + JSON.stringify(call.request));
    if(!call.request.name | !call.request.password){
        _error(register,'missing parameter',callback);
    }
    if(call.request.name.length < nconf.get('userNameMinLength')){
        _error(register,'name has to be at least ' + nconf.get('userNameMinLength'),callback);
    }
    if(call.request.password.length < nconf.get('passwordMinLength')){
        _error(register,'password has to be at least ' + nconf.get('passwordMinLength'),callback);
    }
    db.createUser(call.request.name, call.request.password, function (err, createdUser) {
        if (err) {
            winston.log('error', 'error performing rpc method createUser: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed createUser rpc method');
        return callback(null, {status:'created'});
    });
}


function _error(functionName,errorMessage,callback){
    var error = new Error(errorMessage);
    winston.log('error','error performing rpc method ' + functionName + ' ' + error);
    return callback(null,{err:error.message});
}