/**
 * Created by phili on 02.08.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    connector = require('.././slack');


var exports = module.exports = {};

//global var
var _server;

exports.init = function (serverIp, serverPort) {
    var slackProto = grpc.load('./proto/slackMessaging.proto').slackMessaging;
    _server = new grpc.Server();
    _server.addProtoService(slackProto.SlackMessaging.service, {
        getChannelList: getChannelList,
        getChannelMessages: getChannelMessages,
        sendMessage: sendMessage
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
 * Implements the getChannelList RPC method.
 */
function getChannelList(call, callback) {
    winston.log('info', 'getChannelList rpc method request: ' + JSON.stringify(call.request));
    connector.getChannelList(call.request.auth.token, function (err, channelList) {
        if (err) {
            winston.log('error', 'error performing getChannelList: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getChannelList rpc method');
        return callback(null, {channels : JSON.stringify(channelList)});
    });
}


/**
 * Implements the getChannelMessages RPC method.
 */
function getChannelMessages(call, callback) {
    winston.log('info', 'getChannelMessages rpc method request: ' + JSON.stringify(call.request));
    connector.getChannelMessages(call.request.auth.token, call.request.channel,call.request.oldest, function (err, result) {
        if (err) {
            winston.log('error', 'error performing getChannelMessages: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed getChannelMessages rpc method');
        return callback(null, {messages: JSON.stringify(result.messages), timeStampOfLastMsg: result.tsOfLastMsg});
    });
}

/**
 * Implements the sendMessage RPC method.
 */
function sendMessage(call, callback) {
    winston.log('info', 'sendMessage rpc method request');
    var asUser = false;
    if(call.request.as_user === 'true'){
        asUser = true;
    }
    connector.sendMessage(call.request.auth.token, call.request.channel, call.request.message, asUser, function (err, status) {
        if (err) {
            winston.log('error', 'error performing sendMessage: ',err);
            return callback(null, {err: err.message});
        }
        winston.log('info', 'succesfully performed sendMessage rpc method');
        return callback(null, {status: status});
    });
}