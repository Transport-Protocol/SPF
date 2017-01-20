/**
 * Created by PhilippMac on 11.01.17.
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

var googleClient,
    userClient,
    config,
    paramChecker = new ParamChecker(),
    headerChecker = new HeaderChecker();

function GoogleRoute(configPath) {
    config = JSON.parse(fs.readFileSync(configPath));
    _initGoogleClient();
    _initUserClient();
}

function _initGoogleClient() {
    var url = config['grpc_ip'] + ':' + config['grpc_port'];
    winston.log('info', '%s grpc url: %s', config['service_name'], url);
    var proto = grpc.load('./proto/' + 'fileStorageStream.proto')[config['grpc_package_name']];
    googleClient = new proto[config['grpc_service_name']](url,
        grpc.credentials.createInsecure());
}

function _initUserClient() {
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url for custom route: %s', url);
    var proto = grpc.load('./proto/authentication.proto').authentication;
    userClient = new proto.Authentication(url,
        grpc.credentials.createInsecure());
}

GoogleRoute.prototype.route = function (router) {
    //Get File Route
    router.get('/google/file', function (req, res) {
        _getFileRoute(req, res, _getRequestConfig('/google/file', 'get'));
    });

    router.get('/google/filetree', function (req, res) {
        _getFileTreeRoute(req, res, _getRequestConfig('/google/filetree', 'get'));
    });

    router.put('/google/file', function (req, res) {
        _uploadFileRoute(req, res, _getRequestConfig('/google/file', 'put'));
    });

    router.post('/dropbox/file/transfer', function (req, res) {
        _fileTransfer(req, res, _getRequestConfig('/dropbox/file/transfer', 'post'));
    });

    return router;
};

function _fileTransfer(req, res, requestConfig) {
    _checkQueryAndHeaderParams(req, res, requestConfig);
    _handleAuth(config, req.username, function (err, token) {
        if (err) {
            var result = RpcJsonResponseBuilder.buildError(err.message);
            return res.json(result);
        }
        var authToken = token;
        winston.log('info', 'authToken: ', authToken);
        var jsonGrpcArgs = _createGrpcJsonArgs(config, req, requestConfig['query_parameter'], requestConfig['reserved_parameter'], authToken);
        googleClient[requestConfig['grpc_function']](jsonGrpcArgs, function (err, response) {
            if (err) {
                return _grpcError(res, config['service_name'], err);
            } else {
                if (response.err) {
                    winston.log('error','file transfer owncloud connector error response. statusCode: %s msg: %s',response.err.code,response.err.msg);
                    return res.status(response.err.code).send(response.err.msg);
                }
                var result = _createHttpJsonResult(requestConfig['response_parameter'], response);
                winston.log('info', 'RPC Method %s successful.', requestConfig['grpc_function']);
                return res.json(result);
            }
        });
    });
}

function _uploadFileRoute(req, res, requestConfig) {
    _checkQueryAndHeaderParams(req, res, requestConfig);
    _handleAuth(config, req.username, function (err, token) {
        if (err) {
            var result = RpcJsonResponseBuilder.buildError(err.message);
            return res.json(result);
        }

        var fileName = path.basename(req.query['path']);
        var dirName = path.dirname(req.query['path']);
        if(dirName === '.') dirName = '/';

        var auth = _setAuthorization(token, config['authentication_type']);

        var metadata = new grpc.Metadata();
        metadata.add('fileName',fileName);
        metadata.add('path',dirName);
        metadata.add('authToken',auth.token);
        var call = googleClient[requestConfig['grpc_function']](metadata,function (err, response) {
            if (err) {
                return _grpcError(res, config['service_name'], err);
            } else {
                if (response.err) {
                    winston.log('error','upload File owncloud connector error response. statusCode: %s msg: %s',response.err.code,response.err.msg);
                    return res.status(response.err.code).send(response.err.msg);
                }
                var result = _createHttpJsonResult(requestConfig['response_parameter'], response);
                winston.log('info', 'RPC Method %s successful.', requestConfig['grpc_function']);
                return res.json(result);
            }
        });
        req.on('data', function (chunk) {
            call.write({chunk: chunk});
        });

        req.on('end', function(){
            call.end();
        });
    });
}

function _getFileTreeRoute(req, res, requestConfig) {
    _checkQueryAndHeaderParams(req, res, requestConfig);
    _handleAuth(config, req.username, function (err, token) {
        if (err) {
            var result = RpcJsonResponseBuilder.buildError(err.message);
            return res.json(result);
        }
        var authToken = token;
        winston.log('info', 'authToken: ', authToken);
        var jsonGrpcArgs = _createGrpcJsonArgs(config, req, requestConfig['query_parameter'], requestConfig['reserved_parameter'], authToken);
        googleClient[requestConfig['grpc_function']](jsonGrpcArgs, function (err, response) {
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
    });
}

function _getFileRoute(req, res, requestConfig) {
    winston.log('info', requestConfig['route'] + ' route');
    _checkQueryAndHeaderParams(req, res, requestConfig);
    _handleAuth(config, req.username, function (err, token) {
        if (err) {
            var result = RpcJsonResponseBuilder.buildError(err.message);
            return res.json(result);
        }
        var authToken = token;
        winston.log('info', 'authToken: ', authToken);
        var jsonGrpcArgs = _createGrpcJsonArgs(config, req, requestConfig['query_parameter'], requestConfig['reserved_parameter'], authToken);
        var call = googleClient.getFile(jsonGrpcArgs);
        grpcFileStreamer.receiveFileStream(res, call, ['fileName'], 'err', 'chunk');
    });
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

function _handleAuth(config, username, callback) {
    if (config.authentication_type === '') {
        return callback(null, null);
    }
    userClient.getAuthentication({
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


module.exports = GoogleRoute;


function _grpcError(res, serviceName) {
    return res.status(502).send(serviceName + ' service is offline');
}