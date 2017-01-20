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
    var notificationProto = grpc.load('./proto/notification.proto').notification;
    _server = new grpc.Server();
    _server.addProtoService(notificationProto.Notification.service, {
        create: create,
        list: list,
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
 * Implements the create notification RPC function.
 * Check for missing parameter. check for valid input.
 * CreateNotification in mongodb.
 */
function create(call, callback) {
    winston.log('info', 'rpc method create request: ' + JSON.stringify(call.request));
    if (!call.request.team || !call.request.username || !call.request.message || !call.request.service) {
        _error('create', 'missing parameter', callback);
    } else {
        db.createNotification(call.request.username, call.request.team, call.request.message, call.request.service, function (err, createdNotification) {
            if (err) {
                winston.log('error', 'error performing rpc method create: ', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'succesfully performed create rpc method: ', JSON.stringify(createdNotification));
                return callback(null, {status: 'created'});
            }
        });
    }
}

/**
 * Implements the list notifications rpc function
 * @param call
 * @param callback
 */
function list(call, callback) {
    winston.log('info', 'rpc method list request: ' + JSON.stringify(call.request));
    if (!call.request.team || !call.request.username || !call.request.timeStamp) {
        _error('list', 'missing parameter', callback);
    } else {
        db.listNotifications(call.request.username, call.request.team, call.request.timeStamp, function (err, list) {
            if (err) {
                winston.log('error', 'couldnt list notifications', err);
                return callback(null, {err: err.message});
            } else {
                winston.log('info', 'successfully list notifications', JSON.stringify(list));
                return callback(null, {notifications: JSON.stringify(list)});
            }
        });
    }
}


function _error(functionName, errorMessage, callback) {
    var error = new Error(errorMessage);
    winston.log('error', 'error performing rpc method ' + functionName + ' ' + error);
    return callback(null, {err: error.message});
}