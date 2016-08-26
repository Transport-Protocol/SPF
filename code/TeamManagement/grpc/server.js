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

exports.init = function (serverIp, serverPort) {
    var teamManagementProto = grpc.load('./proto/teammanagement.proto').teamManagement;
    _server = new grpc.Server();
    _server.addProtoService(teamManagementProto.TeamManagement.service, {
        create: create,
        join: join
    });
    var serverUri = serverIp + ':' + serverPort;
    _server.bind(serverUri, grpc.ServerCredentials.createInsecure());
    db.connect(nconf.get('dbPoolSize'), nconf.get('dbPath'));
    winston.log('info', 'RPC init succesful on: ' + serverUri);
};

exports.start = function () {
    _server.start();
    winston.log('info', 'RPC server started');
};

/**
 * Implements the register RPC method.
 */
function create(call, callback) {
    winston.log('info', 'rpc method register request: ' + JSON.stringify(call.request));
    if (!call.request.teamName || !call.request.password || !call.request.teamCreator) {
        _error('register', 'missing parameter', callback);
    } else if (call.request.teamName.length < nconf.get('teamNameMinLength')) {
        _error('register', 'teamname has to be at least ' + nconf.get('teamNameMinLength') + ' characters', callback);
    } else if (call.request.password.length < nconf.get('passwordMinLength')) {
        _error('register', 'password has to be at least ' + nconf.get('passwordMinLength'), callback);
    } else {
        db.createTeam(call.request.teamCreator,call.request.teamName, call.request.password, function (err, createdUser) {
            if (err) {
                winston.log('error', 'error performing rpc method createTeam: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed createTeam rpc method');
                return callback(null, {status: 'created'});
            }
        });
    }
}

/**
 * Implements the login RPC method.
 */
function join(call, callback) {
    winston.log('info', 'rpc method login request: ' + JSON.stringify(call.request));
    if (!call.request.name || !call.request.password) {
        _error('login', 'missing parameter', callback);
    } else {
        db.readUser(call.request.name, function (err, user) {
            if (err) {
                winston.log('error', 'error performing rpc method login: ', err);
                return callback(null, {err: err.message});
            }
            user.comparePassword(call.request.password, function (err, isCorrect) {
                if (err) {
                    winston.log('error', 'error performing rpc method login while comparing passwords: ', err);
                    return callback(null, {err: err.message});
                }
                winston.log('info', 'succesfully performed login rpc method');
                return callback(null, {status: 'login successful'});
            });
        });
    }
}


function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}