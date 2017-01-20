/**
 * Created by PhilippMac on 17.01.17.
 */
'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker'),
    RpcJsonResponseBuilder = require('./../utility/rpcJsonResponseBuilder'),
    grpcFileStreamer = require('./../utility/grpcFileStreamer'),
    grpc = require('grpc'),
    auth = require('basic-auth'),
    chunk = require('chunk'),
    fs = require('fs'),
    winston = require('winston'),
    nconf = require('nconf'),
    path = require('path');

var abstractFsClient,
    userClient,
    config,
    paramChecker = new ParamChecker(),
    headerChecker = new HeaderChecker();

function AbstractFsRoute(configPath) {
    config = JSON.parse(fs.readFileSync(configPath));
    _initAbstractFsClient();
    _initUserClient();
}

function _initAbstractFsClient() {
    var url = config['grpc_ip'] + ':' + config['grpc_port'];
    winston.log('info', '%s grpc url: %s', config['service_name'], url);
    var proto = grpc.load('./proto/' + 'seCoFileStorage.proto')[config['grpc_package_name']];
    abstractFsClient = new proto[config['grpc_service_name']](url,
        grpc.credentials.createInsecure());
}

function _initUserClient() {
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url for custom route: %s', url);
    var proto = grpc.load('./proto/authentication.proto').authentication;
    userClient = new proto.Authentication(url,
        grpc.credentials.createInsecure());
}

AbstractFsRoute.prototype.route = function (router) {
    //Get File Route
    router.get('/filestorage/file', function (req, res) {
        _getFileRoute(req, res, _getRequestConfig('/filestorage/file', 'get'));
    });

    router.get('/filestorage/filetree', function (req, res) {
        _getFileTreeRoute(req, res, _getRequestConfig('/filestorage/filetree', 'get'));
    });

    router.put('/filestorage/file', function (req, res) {
        _uploadFileRoute(req, res, _getRequestConfig('/filestorage/file', 'put'));
    });

    return router;
};

function _uploadFileRoute(req, res, requestConfig) {
    _checkQueryAndHeaderParams(req, res, requestConfig);
    _handleAuth(req.query['serviceName'], req.username, function (err, token) {
        if (err) {
            var result = RpcJsonResponseBuilder.buildError(err.message);
            return res.json(result);
        }

        var fileName = path.basename(req.query['filePath']);
        var dirName = path.dirname(req.query['filePath']);
        if (dirName === '.') dirName = '/';

        var metadata = new grpc.Metadata();
        metadata.add('fileName', fileName);
        metadata.add('path', dirName);
        metadata.add('authToken', token);
        metadata.add('serviceName', req.query['serviceName']);
        metadata.add('username', req.username);
        metadata.add('teamName', req.query['teamName']);
        var call = abstractFsClient[requestConfig['grpc_function']](metadata, function (err, response) {
            if (err) {
                return _grpcError(res, config['service_name'], err);
            } else {
                if (response.err) {
                    winston.log('error', 'upload File owncloud connector error response. statusCode: %s msg: %s', response.err.code, response.err.msg);
                    return res.status(response.err.code).send(response.err.msg);
                }
                var result = _createHttpJsonResult(requestConfig['response_parameter'], response);
                winston.log('info', 'RPC Method %s successful.', requestConfig['grpc_function']);
                return res.json(result);
            }
        });
        req.on('data', function (chunk) {
            console.log('chunk rec');
            call.write({chunk: chunk});
        });

        req.on('end', function () {
            call.end();
        });
    });
}

function _getFileTreeRoute(req, res, requestConfig) {
    _checkQueryAndHeaderParams(req, res, requestConfig);
    var jsonGrpcArgs = _createGrpcJsonArgs(config, req, requestConfig['query_parameter'], requestConfig['reserved_parameter']);
    abstractFsClient[requestConfig['grpc_function']](jsonGrpcArgs, function (err, response) {
        if (err) {
            return _grpcError(res, config['service_name'], err);
        } else {
            if (response.err) {
                return res.status(response.err.code).send(response.err.msg);
            }
            var result = _createHttpJsonResult(requestConfig['response_parameter'], response);
            winston.log('info', 'RPC Method %s successful.', requestConfig['grpc_function']);
            return res.json(result);
        }
    });
}

function _getFileRoute(req, res, requestConfig) {
    winston.log('info', requestConfig['route'] + ' route');
    _checkQueryAndHeaderParams(req, res, requestConfig);
    var jsonGrpcArgs = _createGrpcJsonArgs(config, req, requestConfig['query_parameter'], requestConfig['reserved_parameter']);
    var call = abstractFsClient.getFile(jsonGrpcArgs);
    grpcFileStreamer.receiveFileStream(res, call, ['fileName'], 'err', 'chunk');
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
        winston.log('error', 'connector %s responded without json', config['service_name']);
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
            } else if (req.query.hasOwnProperty(param)) {
                grpcArgs[param] = req.query[param];
            } else if (req.params.hasOwnProperty(param)) {
                grpcArgs[param] = req.params[param];
            } else if (param === 'fileName') {
                grpcArgs[param] = req.files[Object.keys(req.files)[0]].name;
            } else if (param === 'fileBuffer') {
                grpcArgs[param] = req.files[Object.keys(req.files)[0]].data;
            }
        }
    }
    return grpcArgs;
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

function _checkQueryAndHeaderParams(req, res, config) {
    if (!paramChecker.containsParameter(config['query_parameter'], req, res)) {
        return;
    }
    if (!headerChecker.containsParameter(config['header_parameter'], req, res)) {
        return;
    }
}

function _getRequestConfig(routeUrl, routeFunction) {
    let requestConfigArray = config['requests'];
    for (let i = 0; i < requestConfigArray.length; i++) {
        if (requestConfigArray[i]['route'] === routeUrl && requestConfigArray[i]['http-method'] === routeFunction) {
            return requestConfigArray[i];
        }
    }
}

function _handleAuth(serviceName, username, callback) {
    userClient.getAuthentication({
        service: serviceName.toUpperCase(),
        username: username
    }, function (err, response) {
        if (err) {
            return callback(new Error('User service for authentication offline'));
        }
        if (response.err) {
            return callback(new Error('Authentication for ' + serviceName + ' not set'));
        }
        return callback(null, response.token);
    });
}


module.exports = AbstractFsRoute;


function _grpcError(res, serviceName) {
    return res.status(502).send(serviceName + ' service is offline');
}