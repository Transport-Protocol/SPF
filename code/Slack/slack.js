/**
 * Created by phili on 02.08.2016.
 */
/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    Hashmap = require('hashmap'),
    winston = require('winston');


//Key : userid, Value : username
var userIdUsernameCache = new Hashmap();


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
        _parseChannelMessages(access_token, body, function (err, messages) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, messages);
            }
        });
    });
};

function _getUsernameById(access_token, userId, callback) {
    var url = 'https://slack.com/api/users.info'
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token,
            user: userId
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
        winston.log('info', 'succesfully got username from id');
        return callback(null, body.user.name);
    });
}

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

function _parseChannelMessages(access_token, body, callback) {
    var result = [];
    var username = {};

    //recursive function
    var step = function (i) {
        if (i === body.messages.length) {
            return callback(null, {
                'messages': result
            });
        } else {
            var userid = body.messages[i].user;
            if (userIdUsernameCache.has(userid)) {
                username = userIdUsernameCache.get(userid);
                result[i] = {
                    message: body.messages[i].text,
                    username: username
                }
                step(i + 1);
            } else {
                _getUsernameById(access_token, userid, function (err, user) {
                    if (err) {
                        winston.log('error', 'couldnt get username from id - ', err);
                        step(i + 1);
                    } else {
                        userIdUsernameCache.set(userid,user);
                        result[i] = {
                            message: body.messages[i].text,
                            username: user
                        }
                        step(i + 1);
                    }
                });
            }
        }
    }

    if (body.messages.length > 0) {
        step(0);
    } else {
        return callback(new Error('no messages in channel'))
    }
}


module.exports = {
    getChannelList: getChannelList,
    getChannelMessages: getChannelMessages
};