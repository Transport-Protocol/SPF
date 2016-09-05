/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston');


var exports = module.exports = {};

//global var
var _server;
var _services = [];

function init(serverIp, serverPort, oauth2Services) {
    var authServiceProto = grpc.load('./proto/authService.proto').authService;
    _services = oauth2Services;
    _server = new grpc.Server();
    _server.addProtoService(authServiceProto.AuthService.service, {
        getAuthorizationUrl: getAuthorizationUrl,
        getAccessToken: getAccessToken
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

function start() {
    _server.start();
    winston.log('info', 'RPC server started');
};

function _getOAuth2ServiceByName(name) {
    var res;
    for (var i = 0; i < _services.length; i++) {
        if (_services[i].getServiceName() === name) {
            res = _services[i];
            break;
        }
    }
    if (!res) {
        winston.log('error', 'no service found for name %s ', name);
    }
    return res;
}

/**
 * Implements the GetFile RPC method.
 */
function getAuthorizationUrl(call, callback) {
    winston.log('info', 'getAuthorizationUrl rpc method request: ' + JSON.stringify(call.request));
    var service = _getOAuth2ServiceByName(call.request.service);
    var url = service.getAuthorizationURL(call.request.username);
    if (!url) {
        return callback(null, {err: 'no service for ' + call.request.service + 'found'})
    }
    return callback(null, {url: url});
}


/**
 * Implements the GetFileTree RPC method.
 */
function getAccessToken(call, callback) {
    winston.log('info', 'getAccessToken rpc method request: ' + JSON.stringify(call.request));
}


module.exports = {
    init: init,
    start: start
}