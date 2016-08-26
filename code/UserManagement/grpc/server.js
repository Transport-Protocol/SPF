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
        login: login
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the register RPC method.
 */
function register(call, callback) {
    winston.log('info', 'rpc method register request: ' + JSON.stringify(call.request));
    if (!call.request.name || !call.request.password) {
        _error('register', 'missing parameter', callback);
    } else if (call.request.name.length < nconf.get('userNameMinLength')) {
        _error('register', 'name has to be at least ' + nconf.get('userNameMinLength') + ' characters', callback);
    } else if (call.request.password.length < nconf.get('passwordMinLength')) {
        _error('register', 'password has to be at least ' + nconf.get('passwordMinLength'), callback);
    } else {
        db.createUser(call.request.name, call.request.password, function (err, createdUser) {
            if (err) {
                winston.log('error', 'error performing rpc method createUser: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed createUser rpc method');
                return callback(null, {status: 'created'});
            }
        });
    }
}

/**
 * Implements the login RPC method.
 */
function login(call, callback) {
    winston.log('info', 'rpc method login request: ' + JSON.stringify(call.request));
    if (!call.request.name || !call.request.password) {
        _error('login', 'missing parameter', callback);
    } else {
        db.readUser(call.request.name, function (err, user) {
            if (err) {
                winston.log('error', 'error performing rpc method login: ', err);
                return callback(null, {err: err.message});
            }
            user.comparePassword(call.request.password, function (err, isCorrect) {
                if (err) {
                    winston.log('error', 'error performing rpc method login while comparing passwords: ', err);
                    return callback(null, {err: err.message});
                }
                winston.log('info', 'succesfully performed login rpc method');
                return callback(null, {status: 'login successful'});
            });
        });
    }
}


function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}