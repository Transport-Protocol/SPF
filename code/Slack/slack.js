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
var idNameCache = new Hashmap();


/**
 * Returns a list of channels corresponding to account specified by access_token
 * @param access_token
 * @param callback
 */
function getChannelList(access_token, callback) {
    var url = 'https://slack.com/api/channels.list';
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token
        },
        json: true
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
        if (body.error) {
            winston.log('error', 'slack error: ', body.error);
            return callback(body.error);
        }
        winston.log('info', 'succesfully got channel list');
        var parsed = _parseChannelList(body);
        return callback(null, parsed);
    });
}

/**
 * Returns a list of messages from channel
 * @param access_token
 * @param channelId
 * @param callback
 */
function getChannelMessages(access_token, channelId,tsOfOldestMessage, callback) {
    var url = 'https://slack.com/api/channels.history';
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token,
            channel: channelId,
            oldest: tsOfOldestMessage
        },
        json: true
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
        if (body.error) {
            winston.log('error', 'slack error: ', body.error);
            return callback(body.error);
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
}

/**
 * Sends a message to specified channel
 * @param access_token
 * @param channelId
 * @param message
 * @param as_user if true,send message as user,if false,as bot
 * @param callback
 */
function sendMessage(access_token, channelId, message,as_user, callback) {
    var url = 'https://slack.com/api/chat.postMessage';
    var options = {
        method: 'POST',
        uri: url,
        qs: {
            token: access_token,
            channel: channelId,
            text: message,
            as_user: as_user
        },
        json: true
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
        if (body.error) {
            winston.log('error', 'slack error: ', body.error);
            return callback(body.error);
        }
        winston.log('info', 'succesfully send  message');
        return callback(null, 'ok');
    });
}

/**
 * Gets name corresponding to id. works for user and bots.
 * @param access_token
 * @param id
 * @param isBot
 * @param callback
 * @private
 */
function _getNameById(access_token, id, isBot, callback) {
    var url = {};
    if (!isBot) {
        url = 'https://slack.com/api/users.info';
    } else {
        url = 'https://slack.com/api/bots.info';
    }
    var options = {
        method: 'GET',
        uri: url,
        qs: {
            token: access_token,
            user: id,
            bot: id
        },
        json: true
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
        if (body.error) {
            winston.log('error', 'slack error: ', body.error);
            return callback(body.error);
        }
        winston.log('info', 'succesfully got name from id');
        if (!isBot) {
            return callback(null, body.user.name);
        } else {
            return callback(null, body.bot.name);
        }
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
    var name = {};
    var ts = {};

    //recursive function to retrieve all usernames from ids.Also fills cache
    var step = function (i) {
        if (i === body.messages.length) {
            return callback(null, {
                'messages': result,
                'tsOfLastMsg': body.messages[i-1].ts
            });
        } else {
            var id = body.messages[i].user;
            var bot = false;
            if (!id) {
                //message comes from bot
                id = body.messages[i].bot_id;
                bot = true;
            }
            if (idNameCache.has(id)) {
                name = idNameCache.get(id);
                result[i] = {
                    message: body.messages[i].text,
                    name: name
                };
                step(i + 1);
            } else {
                _getNameById(access_token, id,bot, function (err, name) {
                    if (err) {
                        winston.log('error', 'couldnt get username from id - ', err);
                        step(i + 1);
                    } else {
                        idNameCache.set(id, name);
                        result[i] = {
                            message: body.messages[i].text,
                            name: name
                        };
                        step(i + 1);
                    }
                });
            }
        }
    };

    if (body.messages.length > 0) {
        step(0);
    } else {
        return callback(new Error('no messages in channel'))
    }
}


module.exports = {
    getChannelList: getChannelList,
    getChannelMessages: getChannelMessages,
    sendMessage: sendMessage
};