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
var _authService;

exports.init = function (serverIp, serverPort) {
    var userManagementProto = grpc.load('./proto/usermanagement.proto').userManagement;
    var authProto = grpc.load('./proto/authentication.proto').authentication;
    _server = new grpc.Server();
    _server.addProtoService(userManagementProto.UserManagement.service, {
        register: register,
        login: login,
        getUsernameBySessionId: getUsernameBySessionId,
        isLoginCorrect: isLoginCorrect,
        getAuthStatusList: getAuthStatusList
    });
    _server.addProtoService(authProto.Authentication.service, {
        setAuthentication: setAuthentication,
        getAuthentication: getAuthentication
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());

    //init auth service connection
    var url = nconf.get('authServiceIp') + ':' + nconf.get('authServicePort');
    winston.log('info', 'authservice grpc url: %s', url);
    var proto = grpc.load('./proto/authService.proto').authService;
    _authService = new proto.AuthService(url,
        grpc.credentials.createInsecure());

    db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the getAuthStatusList RPC method.
 */
function getAuthStatusList(call, callback) {
    winston.log('info', 'rpc method getAuthStatusList request: ' + JSON.stringify(call.request));
    if (!call.request.username) {
        _error('register', 'missing grpc parameter', callback);
    } else {
        db.getAuthStatusList(call.request.username, function (err, list) {
            if (err) {
                var errMsg = err;
                winston.log('error', 'error performing rpc method getAuthStatusList: ', errMsg);
                return callback(null, {err: errMsg.message});
            } else {
                winston.log('info', 'succesfully performed getAuthStatusList rpc method');
                return callback(null, {list: JSON.stringify(list)});
            }
        });
    }
}

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
                var errMsg = err;
                if (err.message.indexOf('duplicate key') !== -1) {
                    errMsg = new Error('username already in use');
                }
                winston.log('error', 'error performing rpc method createUser: ', errMsg);
                return callback(null, {err: errMsg.message});
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
                var targetServiceAuthEntry;
                for (var i = 0; i < user.auth.length; i++) {
                    if (user.auth[i].service === call.request.service) {
                        targetServiceAuthEntry = user.auth[i];
                        break;
                    }
                }
                if (!targetServiceAuthEntry) {
                    return callback(null, {err: 'not found'});
                } else {
                    console.log(targetServiceAuthEntry);
                    if (targetServiceAuthEntry.refresh_token) {
                        if (new Date().getTime() > targetServiceAuthEntry.tsOfSet + 3600000) {
                            //token aelter als eine stunde
                            _refreshAccessToken(call.request.username, targetServiceAuthEntry.service.toUpperCase(), targetServiceAuthEntry.refresh_token, function (err, accessToken) {
                                if (err) {
                                    console.log('error refreshing', err);
                                    return callback(null, {err: 'could not refresh tokens'});
                                } else {
                                    winston.log('info', 'successfully refreshed tokens');
                                    _getAuthenticationSuccess(accessToken, callback);
                                }
                            });
                        } else {
                            _getAuthenticationSuccess(targetServiceAuthEntry.access_token, callback);
                        }
                    } else {
                        _getAuthenticationSuccess(targetServiceAuthEntry.access_token, callback);
                    }
                }
            }
        });
    }
}

function _getAuthenticationSuccess(access_token, callback) {
    winston.log('info', 'succesfully performed getAuthentication rpc method');
    return callback(null, {token: access_token});
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

function _refreshAccessToken(username, service, refresh_token, callback) {
    _authService.refreshAccessToken({
        service: service,
        refresh_token: refresh_token
    }, function (err, response) {
        if (err) {
            return callback('authService offline');
        } else {
            if (response.err) {
                return callback(err.message);
            } else {
                db.refreshAuthentication(username, service, response.access_token, function (err) {
                    if (err) {
                        winston.log('error', 'couldnt refresh auth in db');
                    }
                });
                return callback(null, response.access_token);
            }
        }
    });
}

function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}