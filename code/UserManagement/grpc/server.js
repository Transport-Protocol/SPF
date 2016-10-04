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
    var authProto = grpc.load('./proto/authentication.proto').authentication;
    _server = new grpc.Server();
    _server.addProtoService(userManagementProto.UserManagement.service, {
        register: register,
        login: login,
        getUsernameBySessionId: getUsernameBySessionId,
        isLoginCorrect: isLoginCorrect
    });
    _server.addProtoService(authProto.Authentication.service, {
        setAuthentication: setAuthentication,
        getAuthentication: getAuthentication
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
        _error('register', 'missing grpc parameter', callback);
    } else if (call.request.name.length < nconf.get('userNameMinLength')) {
        _error('register', 'name has to be at least ' + nconf.get('userNameMinLength') + ' characters', callback);
    } else if (call.request.password.length < nconf.get('passwordMinLength')) {
        _error('register', 'password has to be at least ' + nconf.get('passwordMinLength') + ' characters', callback);
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
        _error('login', 'missing grpc parameter', callback);
    } else {
        //get user
        db.readUser(call.request.name, function (err, user) {
            if (err) {
                winston.log('error', 'error performing rpc method login: ', err);
                return callback(null, {err: err.message});
            }
            //is password correct?
            user.comparePassword(call.request.password, function (err, isCorrect) {
                if (err) {
                    winston.log('error', 'error performing rpc method login while comparing passwords: ', err);
                    return callback(null, {err: err.message});
                }
                winston.log('info', 'succesfully performed login rpc method');
                var status = {};
                //password correct
                if (isCorrect) {
                    status = 'login successful';
                    db.setSessionId(user.username, function (err, sessionId) {
                        if (err) {
                            //login correct but problems setting sessionId
                            return callback(null, {err: err});
                        } else {
                            //login ok and sessionid set
                            return callback(null, {status: status, sessionId: sessionId, loginSuccessful: true});
                        }
                    });
                    //password wrong
                } else {
                    status = 'wrong login credentials';
                    return callback(null, {status: status, loginSuccessful: false});
                }
            });
        });
    }
}

/**
 * Implements the setAccessToken RPC method.
 */
function setAuthentication(call, callback) {
    winston.log('info', 'rpc method setAuthentication request: ' + JSON.stringify(call.request));
    if (!call.request.service || !call.request.username || !call.request.access_token) {
        _error('setAuthentication', 'missing grpc parameter', callback);
    } else {
        db.addAuthentication(call.request.username, call.request.service, call.request.access_token, call.request.refresh_token, function (err, user) {
            if (err) {
                winston.log('error', 'error performing rpc method setAuthentication: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed setAuthentication rpc method');
                return callback(null, {status: 'created'});
            }
        });
    }
}

/**
 * Implements the getAccessToken RPC method.
 */
function getAuthentication(call, callback) {
    winston.log('info', 'rpc method getAuthentication request: ' + JSON.stringify(call.request));
    if (!call.request.service || !call.request.username) {
        _error('getAuthentication', 'missing grpc parameter', callback);
    } else {
        db.readUser(call.request.username, function (err, user) {
            if (err) {
                winston.log('error', 'error performing rpc method getAuthentication: ', err);
                return callback(null, {err: err.message});
            } else {
                var token;
                for (var i = 0; i < user.auth.length; i++) {
                    if (user.auth[i].service === call.request.service) {
                        token = user.auth[i].access_token;
                        break;
                    }
                }
                if (!token) {
                    return callback(null, {err: 'not found'});
                } else {
                    winston.log('info', 'succesfully performed getAuthentication rpc method');
                    return callback(null, {token: token});
                }
            }
        });
    }
}

function getUsernameBySessionId(call, callback) {
    winston.log('info', 'rpc method getUsernameBySessionId request: ' + JSON.stringify(call.request));
    if (!call.request.sessionId) {
        _error('getUsernameBySessionId', 'missing grpc parameter', callback);
    } else {
        db.getUsernameBySessionId(call.request.sessionId, function (err, username) {
            if (err) {
                winston.log('error', 'error performing rpc method getUsernameBySessionId: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed getUsernameBySessionId rpc method.');
                return callback(null, {username: username});
            }
        });
    }
}

function isLoginCorrect(call, callback) {
    winston.log('info', 'rpc method isLoginCorrect request: ' + JSON.stringify(call.request));
    if (!call.request.name || !call.request.password) {
        _error('isLoginCorrect', 'missing grpc parameter', callback);
    } else {
        db.isLoginCorrect(call.request.name, call.request.password, function (err, isMatch) {
            if (err) {
                winston.log('error', 'error performing rpc method isLoginCorrect: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed isLoginCorrect rpc method.');
                return callback(null, {isCorrect: isMatch});
            }
        });
    }
}


function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}