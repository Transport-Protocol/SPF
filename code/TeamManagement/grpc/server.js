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
    var teamManagementProto = grpc.load('./proto/teamManagement.proto').teamManagement;
    _server = new grpc.Server();
    _server.addProtoService(teamManagementProto.TeamManagement.service, {
        create: create,
        join: join,
        list: list,
        addServices: addServices
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
 * Implements the create team RPC function.
 * Check for missing parameter. check for valid input.
 * CreateTeam in mongodb.
 */
function create(call, callback) {
    winston.log('info', 'rpc method register request: ' + JSON.stringify(call.request));
    if (!call.request.team || !call.request.password || !call.request.teamCreator) {
        _error('register', 'missing parameter', callback);
    } else if (call.request.team.length < nconf.get('teamNameMinLength')) {
        _error('register', 'teamname has to be at least ' + nconf.get('teamNameMinLength') + ' characters', callback);
    } else if (call.request.password.length < nconf.get('passwordMinLength')) {
        _error('register', 'password has to be at least ' + nconf.get('passwordMinLength'), callback);
    } else {
        db.createTeam(call.request.teamCreator, call.request.team, call.request.password, function (err, createdTeam) {
            if (err) {
                winston.log('error', 'error performing rpc method createTeam: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed createTeam rpc method: ', createdTeam);
                return callback(null, {status: 'created'});
            }
        });
    }
}

/**
 * Implements the join team RPC function.
 * Check missing parameter.
 * Add user to team members.
 */
function join(call, callback) {
    winston.log('info', 'rpc method login request: ' + JSON.stringify(call.request));
    if (!call.request.team || !call.request.password || !call.request.username) {
        _error('login', 'missing parameter', callback);
    } else {
        db.isTeamLoginCorrect(call.request.team, call.request.password, function (err) {
            if (err) {
                winston.log('error', 'error performing rpc method join: ', err);
                return callback(null, {err: err.message});
            } else {
                db.readTeam(call.request.team, function addUserToTeam(err, team) {
                    if (err) {
                        winston.log('error', 'error performing rpc method join: ', err);
                        return callback(null, {err: err.message});
                    } else {
                        //add user to team
                        team.members.push(call.request.username);
                        team.save(function (err) {
                            if (err) {
                                winston.log('error', 'creating adding member to  Team ', err);
                                return callback(null, {err: err.message});
                            } else {
                                winston.log('info', 'succesfully added member to Team with name: ' + team.name);
                                return callback(null, {status: 'joined'});
                            }
                        });
                    }
                });
            }
        });
    }
}

/**
 * Implements the list teams rpc function
 * @param call
 * @param callback
 */
function list(call,callback){
    winston.log('info', 'rpc method list request: ' + JSON.stringify(call.request));
    if (!call.request.username) {
        _error('login', 'missing parameter', callback);
    } else {
        db.listTeams(call.request.username, function(err,teams){
            if(err){
                winston.log('error','couldnt list teams for user %s %s',call.request.username,err);
                return callback(null,{err: err.message});
            } else {
                winston.log('info', 'successfully list teams for user %s',call.request.username);
                return callback(null,{teamList: JSON.stringify(teams)});
            }
        });
    }
}

/**
 * Implements the addServices rpc function
 * @param call
 * @param callback
 */
function addServices(call,callback){
    winston.log('info', 'rpc method addServices request: ' + JSON.stringify(call.request));
    if (!call.request.services || !call.request.team) {
        _error('login', 'missing parameter', callback);
    } else {
        db.addServices(call.request.team,call.request.services, function(err){
            if(err){
                winston.log('error','couldnt add Services %s to team %s',call.request.team,call.request.services,err);
                return callback(null,{err: err.message});
            } else {
                winston.log('info', 'successfully add Services %s to team',call.request.services,call.request.team);
                return callback(null,{status: 'ok'});
            }
        });
    }
}



function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}