/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    connector = require('.././bitbucket');


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
    if (!call.request.auth) {
        _error('getRepositories', 'missing parameter auth', callback);
    } else {
        var auth = call.request.auth;
        console.log(auth);
        connector.getRepositories(auth.token, function (err, repos) {
            if (err) {
                winston.log('error', 'error performing getRepositories: ', err);
                return callback(null, {err: err.message});
            }
            winston.log('info', 'succesfully performed getRepositories rpc method: ',repos);
            return callback(null, {repos: JSON.stringify(repos)});
        });
    }
}


/**
 * Implements the getRepositoryContent RPC method.
 */
function getRepositoryContent(call, callback) {
    winston.log('info', 'getRepositoryContent rpc method request: ' + JSON.stringify(call.request));
    if (!call.request.auth || !call.request.repository || !call.request.path) {
        _error('getRepositoryContent', 'missing parameter', callback);
    } else {
        var auth = call.request.auth;
        var token;
        if (auth.type === 'BASIC') {
            token = _basicAuthEncryption(call.request.auth.token)
        } else {
            token = auth.token;
        }
        console.log(token);
        connector.getRepoFiles(token, call.request.repository, call.request.path, function (err, dirs) {
            if (err) {
                winston.log('error', 'error performing getRepositoryContent: ', err);
                return callback(null, {err: err.message});
            }
            winston.log('info', 'succesfully performed getRepositoryContent rpc method', dirs);
            return callback(null, {dirs: JSON.stringify(dirs)});
        });
    }
}

/**
 * Implements the addUserToRepository RPC method.
 */
function addUserToRepository(call, callback) {
    winston.log('info', 'addUserToRepository rpc method request');
    if (!call.request.auth || !call.request.repository || !call.request.usernameToAdd) {
        _error('addUserToRepository', 'missing parameter', callback);
    } else {
        var auth = call.request.auth;
        connector.addUserToRepo(auth.token, call.request.repository, call.request.usernameToAdd, function (err, status) {
            if (err) {
                winston.log('error', 'error performing addUserToRepository: ', err);
                return callback(null, {err: err.message});
            }
            winston.log('info', 'succesfully performed addUserToRepository rpc method');
            return callback(null, {status: status});
        });
    }
}


function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}