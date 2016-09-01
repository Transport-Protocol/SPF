/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    connector = require('.././github');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var versionControlProto = grpc.load('./proto/versionControl.proto').versionControl;
    _server = new grpc.Server();
    _server.addProtoService(versionControlProto.VersionControl.service, {
        getRepositories: getRepositories,
        getRepositoryContent: getRepositoryContent,
        addUserToRepository: addUserToRepository
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the GetFile RPC method.
 */
function getRepositories(call, callback) {
    winston.log('info', 'getRepositories rpc method request: ' + JSON.stringify(call.request));
    var userCred = _basicAuthEncryption(call.request.auth.token);
    connector.getRepositories(userCred, function (err, repos) {
        if (err) {
            winston.log('error', 'error performing getRepositories: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getRepositories rpc method');
        return callback(null, {repos : repos});
    });
}


/**
 * Implements the GetFileTree RPC method.
 */
function getRepositoryContent(call, callback) {
    winston.log('info', 'getRepositoryContent rpc method request: ' + JSON.stringify(call.request));
    var userCred = _basicAuthEncryption(call.request.auth.token);
    connector.getRepoFiles(userCred, call.request.repo,call.request.path, function (err, dirs) {
        if (err) {
            winston.log('error', 'error performing getRepositoryContent: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getRepositoryContent rpc method',dirs);
        return callback(null, {dirs: dirs});
    });
}

/**
 * Implements the UploadFile RPC method.
 */
function addUserToRepository(call, callback) {
    winston.log('info', 'addUserToRepository rpc method request');
    var userCred = _basicAuthEncryption(call.request.auth.token);
    connector.addUserToRepo(userCred, call.request.repo, call.request.userToAdd, function (err, status) {
        if (err) {
            winston.log('error', 'error performing addUserToRepository: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed addUserToRepository rpc method');
        return callback(null, {status: status});
    });
}

function _basicAuthEncryption(token){
    var withoutBasic = token.substr(6);
    var readableString = new Buffer(withoutBasic, 'base64').toString()
    var userPasswordArray = readableString.split(':');
    return {username:userPasswordArray[0],password:userPasswordArray[1]};
}