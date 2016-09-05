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

function init(serverIp, serverPort,oauth2Services) {
    var fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;
    _services = oauth2Services;
    _server = new grpc.Server();
    _server.addProtoService(fileStorageProto.FileStorage.service, {
        getAuthorizationUrl: getAuthorizationUrl,
        getAccessToken: getAccessToken,
        uploadFile: uploadFile
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

function start() {
    _server.start();
    winston.log('info', 'RPC server started');
};

function _getOAuth2ServiceByName(name){
    var res;
    for(var i = 0;i<_services.length;i++){
        if(_services[i].getServiceName() === name){
            res = _services[i];
            break;
        }
    }
    return res;
}

/**
 * Implements the GetFile RPC method.
 */
function getAuthorizationUrl(call, callback) {
    winston.log('info', 'getAuthorizationUrl rpc method request: ' + JSON.stringify(call.request));
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