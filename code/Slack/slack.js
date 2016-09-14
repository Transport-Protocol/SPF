/**
 * Created by phili on 02.08.2016.
 */
/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');


/**
 * Returns a list of channels corresponding to account specified by access_token
 * @param path
 * @param callback
 */
function getChannelList(access_token, callback) {
    var url = 'https://slack.com/api/channels.list'
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token
        },
        json: true,
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        if (body.err) {
            winston.log('error', 'slack error: ', body.err);
            return callback(body.err);
        }
        winston.log('info', 'succesfully got channel list');
        var parsed = _parseChannelList(body);
        return callback(null, parsed);
    });
};

/**
 * Returns a list of channels corresponding to account specified by access_token
 * @param access_token
 * @param callback
 */
function getChannelList(access_token, callback) {
    var url = 'https://slack.com/api/channels.list'
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token
        },
        json: true,
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        if (body.err) {
            winston.log('error', 'slack error: ', body.err);
            return callback(body.err);
        }
        winston.log('info', 'succesfully got channel list');
        var parsed = _parseChannelList(body);
        return callback(null, parsed);
    });
};

/**
 * Returns a list of messages from channel
 * @param access_token
 * @param channelId
 * @param callback
 */
function getChannelMessages(access_token, channelId, callback) {
    var url = 'https://slack.com/api/channels.history'
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token,
            channel: channelId
        },
        json: true,
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        if (body.err) {
            winston.log('error', 'slack error: ', body.err);
            return callback(body.err);
        }
        winston.log('info', 'succesfully got channel messages');
        var parsed = _parseChannelMessages(body);
        return callback(null, parsed);
    });
};

function _parseChannelList(body) {
    var result = [];
    for (var i = 0; i < body.channels.length; i++) {
        result[i] = {
            name: body.channels[i].name,
            id: body.channels[i].id
        }
    }
    return {
        'channels': result
    };
}

function _parseChannelMessages(body) {
    var result = [];
    for( var i = 0;i<body.messages.length;i++){
        result[i] = {
            message : body.messages[i].text,
            userId : body.messages[i].user
        }
    }
    return {
        'messages' : result
    }
}


module.exports = {
    getChannelList: getChannelList,
    getChannelMessages: getChannelMessages
};