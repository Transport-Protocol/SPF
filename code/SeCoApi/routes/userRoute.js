'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    RpcJsonResponseBuilder = require('./../utility/rpcJsonResponseBuilder'),
    grpc = require('grpc'),
    auth = require('basic-auth'),
    winston = require('winston'),
    nconf = require('nconf');

var client;

function UserRoute() {
    this.paramChecker = new ParamChecker();
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url: %s', url);
    var proto = grpc.load('./proto/userManagement.proto').userManagement;
    client = new proto.UserManagement(url,
        grpc.credentials.createInsecure());
}

UserRoute.prototype.checkSession = function (req, res, next) {
    winston.log('info', 'check if session exists');
    if (req.cookies.sessionId) {
        winston.log('info', 'cookie with sessionId received');
        client.getUsernameBySessionId({
            sessionId: req.cookies.sessionId
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt get username from sessionId', response.err);
                    next();
                } else {
                    winston.log('info', 'successfully got username from sessionId.name: ', response.username);
                    req.session.username = response.username;
                    next();
                }
            }
        });
    } else {
        winston.log('info', 'no cookie for sessionId received');
        next();
    }
};

UserRoute.prototype.route = function (router) {
    var self = this;
    //REGISTER ROUTE
    router.post('/user/register', function (req, res) {
        var user = auth(req);
        if (typeof user === 'undefined' || user.name.length === 0 || user.pass.length === 0) {
            var errMsg = 'invalid or missing basic authentication';
            winston.log('error', errMsg + ' for route user/register');
            var jsonResponse = RpcJsonResponseBuilder.buildError(errMsg);
            return res.json(jsonResponse);
        }
        client.register({
            name: user.name,
            password: user.pass
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt register user ', response.err);
                    var jsonResponse = RpcJsonResponseBuilder.buildError(response.err);
                    return res.json(jsonResponse);
                } else {
                    winston.log('info', 'successfully registered user: ', user.name);
                    var jsonResponse = RpcJsonResponseBuilder.buildParams(['status'], [response.status]);
                    return res.json(jsonResponse);
                }
            }
        });
    });

    //auth list ROUTE
    router.get('/user/auth/list', function (req, res) {
        var user = auth(req);
        console.log('auth/list route');
        if (typeof user === 'undefined' || user.name.length === 0 || user.pass.length === 0) {
            var errMsg = 'invalid or missing basic authentication';
            winston.log('error', errMsg + ' for route user/login');
            var jsonResponse = RpcJsonResponseBuilder.buildError(errMsg);
            return res.json(jsonResponse);
        }
        client.getAuthStatusList({
            username: user.name
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt list auths ', response.err);
                    var jsonResponse = RpcJsonResponseBuilder.buildError(response.err);
                    return res.json(jsonResponse);
                } else {
                    winston.log('info', 'successful list auths for user: ', user.name);
                    //res.cookie('sessionId', response.sessionId);
                    var jsonResponse = RpcJsonResponseBuilder.buildParams(['list'], [JSON.parse(response.list)]);
                    return res.json(jsonResponse);
                }
            }
        });
    });

    //LOGIN ROUTE
    router.post('/user/login', function (req, res) {
        var user = auth(req);
        if (typeof user === 'undefined' || user.name.length === 0 || user.pass.length === 0) {
            var errMsg = 'invalid or missing basic authentication';
            winston.log('error', errMsg + ' for route user/login');
            var jsonResponse = RpcJsonResponseBuilder.buildError(errMsg);
            return res.json(jsonResponse);
        }
        client.login({
            name: user.name,
            password: user.pass
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt login user ', response.err);
                    var jsonResponse = RpcJsonResponseBuilder.buildError(response.err);
                    return res.json(jsonResponse);
                } else {
                    if (!response.loginSuccessful) {
                        winston.log('info', 'wrong login from user: ', user.name);
                        var jsonResponse = RpcJsonResponseBuilder.buildError(response.status);
                        return res.json(jsonResponse);
                    } else {
                        winston.log('info', 'successful login for user: ', user.name);
                        //res.cookie('sessionId', response.sessionId);
                        var jsonResponse = RpcJsonResponseBuilder.buildParams(['status', 'username'], [response.status, user.name]);
                        return res.json(jsonResponse);
                    }
                }
            }
        });
    });
    return router;
};


module.exports = UserRoute;


function _offlineError(res) {
    var errMsg = 'usermanagement service offline';
    winston.log('error', errMsg);
    var jsonResponse = RpcJsonResponseBuilder.buildError(errMsg);
    return res.json(jsonResponse);
}