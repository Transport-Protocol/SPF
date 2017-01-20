/**
 * Created by Philipp on 10.08.2016.
 */
'use strict';


var grpc = require('grpc'),
    winston = require('winston'),
    RpcJsonResponseBuilder = require('./../utility/rpcJsonResponseBuilder'),
    fs = require('fs'),
    nconf = require('nconf'),
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker');


function CustomRoute(jsonConfigFilePath, protoFileName) {
    self = this;
    this.config = JSON.parse(fs.readFileSync(jsonConfigFilePath));
    this.paramChecker = new ParamChecker();
    this.headerChecker = new HeaderChecker();
    this.client = {};
    this._userClient = {};
    this.notificationService = {};

    _initGRPC(this, protoFileName);
    _initUserService(this);
}

var self = {};
var notificationServiceUrl = 'localhost:50039';

function _initGRPC(self, protoFileName) {
    var url = self.config['grpc_ip'] + ':' + self.config['grpc_port'];
    winston.log('info', '%s grpc url: %s', self.config['service_name'], url);
    var proto = grpc.load('./proto/' + protoFileName)[self.config['grpc_package_name']];
    self.client = new proto[self.config['grpc_service_name']](url,
        grpc.credentials.createInsecure());

    proto = grpc.load('./proto/notification.proto').notification;
    self.notificationService = new proto.Notification(notificationServiceUrl,
        grpc.credentials.createInsecure());
}

function _initUserService(self) {
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url for custom route: %s', url);
    var proto = grpc.load('./proto/authentication.proto').authentication;
    self.userClient = new proto.Authentication(url,
        grpc.credentials.createInsecure());
}


CustomRoute.prototype.route = function (router) {
    var self = this;
    let requestArray = this.config['requests'];
    //build all routes specified in config file
    for (let i in requestArray) {
        //listen on http method on route
        let curConfig = requestArray[i];
        router[curConfig['http-method']](curConfig['route'], function (req, res) {
            if (!self.paramChecker.containsParameter(curConfig['query_parameter'], req, res)) {
                return;
            }
            if (!self.headerChecker.containsParameter(curConfig['header_parameter'], req, res)) {
                return;
            }
            _handleAuth(self.config, req.username, function (err, token) {
                if (err) {
                    var result = RpcJsonResponseBuilder.buildError(err.message);
                    return res.json(result);
                }
                var authToken = token;
                winston.log('info', 'authToken: ', authToken);
                var jsonGrpcArgs = _createGrpcJsonArgs(self.config, req, curConfig['query_parameter'], curConfig['reserved_parameter'], authToken);
                self.client[curConfig['grpc_function']](jsonGrpcArgs, function (err, response) {
                    if (err) {
                        return _grpcError(res,self.config['service_name'],err);
                    } else {
                        if (response.err) {
                            return res.status(response.err.code).send(response.err.msg);
                        }
                        //notification?
                        if (curConfig['notification'] === true) {
                            _sendNotification(req.username, req.query.team, curConfig['message'], self.config['service_name'], self.notificationService);
                        }
                        var result = _createHttpJsonResult(curConfig['response_parameter'], response);
                        winston.log('info', 'RPC Method %s successful.', curConfig['grpc_function']);
                        return res.json(result);
                    }
                });
            });
        });
    }
    return router;
};

function _sendNotification(username, team, message, service, notificationService) {
    if (!team && team !== '') {
        winston.log('error','no query.team set - cant create notification');
    } else {
        notificationService.create({
            username: username,
            team: team,
            message: message,
            service: service.toUpperCase()
        }, function (err, response) {
            if (err) {
                winston.log('error', 'couldnt create notification: ', err);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt create notification: ', response.err);
                } else {
                    winston.log('info', 'successfully created notification');
                }
            }
        });
    }
}

function _handleAuth(config, username, callback) {
    if (config.authentication_type === '') {
        return callback(null, null);
    }
    self.userClient.getAuthentication({
        service: config.service_name,
        username: username
    }, function (err, response) {
        if (err) {
            return callback(new Error('User service for authentication offline'));
        }
        if (response.err) {
            return callback(new Error('Authentication for ' + config.service_name + ' not set'));
        }
        return callback(null, response.token);
    });
}

function _setAuthorization(token, authType) {
    var parsedToken;
    if (authType === 'OAUTH2') {
        parsedToken = token;
    } else if (authType === 'BASIC') {
        parsedToken = token;
    }
    return {token: parsedToken, type: authType};
}

function _createHttpJsonResult(params, grpcResponse) {
    var result = {};
    var noJson = false;
    result.ok = true;
    for (var i in params) {
        try {
            result[params[i]] = JSON.parse(grpcResponse[params[i]]);
        } catch (e) {
            result[params[i]] = grpcResponse[params[i]];
            noJson = true;
        }
    }
    if (noJson) {
        winston.log('error', 'connector %s responded without json', self.config['service_name']);
    }
    return result;
}

function _createGrpcJsonArgs(config, req, queryParams, reservedParams, token) {
    var grpcArgs = {};
    //encrypt authentication and set grpc parameter
    if (token) grpcArgs['auth'] = _setAuthorization(token, config['authentication_type']);
    if (queryParams) {
        var params = queryParams.concat(reservedParams);
        for (var i in params) {
            var param = params[i];
            if (param === 'userName') {
                grpcArgs['userName'] = req.username;
            } else if (req.query.hasOwnProperty(param) || req.params.hasOwnProperty(param)) {
                grpcArgs[param] = req.query[param] || req.params[param];
            } else if (param === 'fileName') {
                grpcArgs[param] = req.files[Object.keys(req.files)[0]].name;
            } else if (param === 'fileBuffer') {
                grpcArgs[param] = req.files[Object.keys(req.files)[0]].data;
            }
        }
    }
    return grpcArgs;
}

function _noFileUploadedError(res) {
    res.status(400).send("no uploaded file found under 'file'");
}

function _grpcError(res, serviceName, err) {
    var result = RpcJsonResponseBuilder.buildError(serviceName + ': ' + err);
    return res.json(result);
}


module.exports = CustomRoute;