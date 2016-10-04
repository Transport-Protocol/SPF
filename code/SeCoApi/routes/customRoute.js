/**
 * Created by Philipp on 10.08.2016.
 */
'use strict';


var grpc = require('grpc'),
    winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    HashMap = require('hashmap'),
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker');


function CustomRoute(jsonConfigFilePath, protoFileName) {
    self = this;
    this.config = JSON.parse(fs.readFileSync(jsonConfigFilePath));
    this.paramChecker = new ParamChecker();
    this.headerChecker = new HeaderChecker();
    this.client = {};
    this.userClient = {};

    _initGRPC(this, protoFileName);
    _initUserService(this);
}

var self = {};

function _initGRPC(self, protoFileName) {
    var url = self.config['grpc_ip'] + ':' + self.config['grpc_port'];
    winston.log('info', '%s grpc url: %s', self.config['service_name'], url);
    var proto = grpc.load('./proto/' + protoFileName)[self.config['grpc_package_name']];
    self.client = new proto[self.config['grpc_service_name']](url,
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
    var requestArray = this.config['requests'];
    var requestMap = new HashMap();
    //Map routes to array index, necessary for secondary for loop to get the right config
    for (var j in requestArray) {
        requestMap.set(requestArray[j]['route'], j);
    }
    //build all routes specified in config file
    for (var i in requestArray) {
        //listen on http method on route
        router[requestArray[i]['http-method']](requestArray[i]['route'], function (req, res) {
            var requestID = requestMap.get(req.route.path);
            if (!self.paramChecker.containsParameter(requestArray[requestID]['query_parameter'], req, res)) {
                return;
            }
            if (!self.headerChecker.containsParameter(requestArray[requestID]['header_parameter'], req, res)) {
                return;
            }
            self.userClient.getAuthentication({
                service: self.config.service_name,
                username: req.username
            }, function (err, response) {
                if (err) {
                    return res.status(504).send('User service for authentication offline');
                }
                if (response.err) {
                    return res.json(response.err);
                }
                var authToken = response.token;
                winston.log('info','authToken: ',authToken);
                var jsonGrpcArgs = _createGrpcJsonArgs(req, requestArray[requestID]['query_parameter'], authToken);
                self.client[requestArray[requestID]['grpc_function']](jsonGrpcArgs, function (err, response) {
                    if (err) {
                        return _offlineError(res, self.config['service_name']);
                    } else {
                        if (response.err) {
                            return res.json(response.err);
                        }
                        var result = _createHttpJsonResult(requestArray[requestID]['response_parameter'], response);
                        winston.log('info', 'RPC Method %s successful.', requestArray[requestID]['grpc_function']);
                        return res.json(result);
                    }
                });
            });
        });
    }
    return router;
};

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

function _createGrpcJsonArgs(req, params,token) {
    var resultAsObj = {};
    //encrypt authentication and set grpc parameter
    resultAsObj['auth'] = _setAuthorization(token, self.config['authentication_type'])
    for (var i in params) {
        var param = params[i];
        if (req.query.hasOwnProperty(param)) {
            resultAsObj[param] = req.query[param];
        }
        if (param === 'fileName') {
            resultAsObj[param] = req.files.file.name;
        }
        if (param === 'fileBuffer') {
            resultAsObj[param] = req.files.file.data;
        }
    }
    return resultAsObj;
}

function _noFileUploadedError(res) {
    res.status(400).send("no uploaded file found under 'file'");
}

function _offlineError(res, serviceName) {
    res.status(504).send(serviceName + ' connector offline');
}


module.exports = CustomRoute;