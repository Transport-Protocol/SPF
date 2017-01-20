/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    uuid = require('node-uuid'),
    User = require('./models/User'),
    logger = require('winston');


function connect(dbPoolsize, dbPath) {
    var options = {
        db: {native_parser: true},
        server: {poolSize: dbPoolsize},
        user: '', //local access no user needed
        pass: ''
    };

    mongoose.connect(dbPath, options);
    var connection = mongoose.connection;
    connection.on('error', function callback(err) {
        logger.log('error', err);
        throw err;
    });
    connection.once('open', function callback() {
        //enable keep alive so a long session cant be interrupted
        options.server.socketOptions = options.replset.socketOptions = {keepAlive: 1};
        logger.log('info', "connect to db: ", connection.name, " successful!");
    });
}

/**
 * Creates a user in mongodb
 * @param name
 * @param password
 * @param callback err,user
 */
function createUser(name, password, callback) {
    // create a user a new user
    var newUser = new User({
        username: name,
        password: password
    });
// save user to database
    newUser.save(function (err) {
        if (err) {
            logger.log('error', 'creating new User', err.message);
            return callback(err);
        }
        logger.log('info', 'successfully created User with name: ' + name);
        return callback(null, newUser);
    });
}

function readUser(name, callback) {
    User.findOne({username: name}, function (err, user) {
        if (err) {
            logger.log('error', 'read User', err.message);
            return callback(err);
        }
        if (!user) {
            var error = new Error('no user with ' + name + ' found');
            _notFoundError(name, 'readUser', callback);
        } else {
            logger.log('info', 'successfully read User with name: ' + name);
            return callback(null, user);
        }
    });
}

/**
 * Removes a user from mongodb
 * @param name
 * @param callback err,isRemoved
 */
function deleteUser(name, callback) {
    User.remove({username: name}, function (err, removed) {
        if (err) {
            logger.log('error', 'delete User - ', err.message);
            return callback(err);
        }
        if (removed.result.n === 0) {
            _notFoundError(name, 'deleteUser', callback);
        } else {
            logger.log('info', 'successfully deleted User with name: ' + name);
            return callback(null, removed);
        }
    });
}

/**
 * Checks the login credentials
 * @param name
 * @param password
 * @param callback err,isCorrect(bool)
 */
function isLoginCorrect(name, password, callback) {
    readUser(name, function (err, user) {
        if (err) {
            logger.log('error', 'isLoginCorrect - ', err.message);
            return callback(err);
        }
        user.comparePassword(password, function (err, isMatch) {
            if (err) {
                logger.log('error', 'isLoginCorrect - ', err.message);
                return callback(err);
            }
            logger.log('info', 'successfully checked isLoginCorrect for name: ' + name + '  result: ' + isMatch);
            return callback(null, isMatch);
        });
    });
}

/**
 * Sets a sessionId for user and returns it
 * @param name
 * @param callback
 */
function setSessionId(name, callback) {
    readUser(name, function (err, user) {
        if (err) {
            logger.log('error', 'setSessionId couldnt get user: ', name);
            return callback(err);
        } else {
            var sessionId = uuid.v4();
            user.sessionId = sessionId;
            user.save(function (err) {
                if (err) {
                    logger.log('error', 'set sessionId ', err.message);
                    return callback(err);
                }
                logger.log('info', 'successfully set sessionId for user : ' + user);
                return callback(null, sessionId);
            });
        }
    });
}

/**
 * Checks if specified sessionId is matching
 * @param name
 * @param sessionId
 * @param callback err,boolean
 */
function isSessionIdCorrect(name, sessionId, callback) {
    readUser(name, function (err, user) {
        if (err) {
            logger.log('error', 'isSessionIdCorrect couldnt get user: ', name);
            return callback(err);
        } else {
            if (sessionId == user.sessionId) {
                logger.log('info', 'sessionId is correct');
                return callback(null, true);
            } else {
                logger.log('info', 'sessionId is not correct');
                return callback(null, false);
            }
        }
    });
}

/**
 * Adds authentication for a service
 * @param username
 * @param service
 * @param access_token
 * @param refresh_token {optional}
 * @param callback
 */
function addAuthentication(username, service, access_token, refresh_token, callback) {
    readUser(username, function (err, user) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < user.auth.length; i++) {
            if (user.auth[i].service === service) {
                //Entry already registered;update
                logger.log('info', 'authentication entry already registered for user %s on service %s - remove old value', username, service);
                user.auth.splice(i, 1);
                break;
            }
        }
        user.auth.push({
            service: service,
            access_token: access_token,
            refresh_token: refresh_token,
            tsOfSet: new Date().getTime()
        });
        user.save(function (err) {
            if (err) {
                logger.log('error', 'adding authentication ', err.message);
                return callback(err);
            }
            logger.log('info', 'successfully added authentication for user : ', username);
            return callback(null, user);
        });
    });
}

function refreshAuthentication(username, service, access_token, callback) {
    readUser(username, function (err, user) {
        if (err) {
            return callback(err);
        }
        var savedRefToken;
        for (var i = 0; i < user.auth.length; i++) {
            if (user.auth[i].service === service) {
                logger.log('info', 'remove old value');
                savedRefToken = user.auth[i].refresh_token;
                user.auth.splice(i, 1);
                break;
            }
        }
        user.auth.push({
            service: service,
            access_token: access_token,
            refresh_token: savedRefToken,
            tsOfSet: new Date().getTime()
        });
        user.save(function (err) {
            if (err) {
                logger.log('error', 'refreshing authentication ', err.message);
                return callback(err);
            }
            logger.log('info', 'successfully refreshed authentication for user : ', username);
            return callback(null, user);
        });
    });
}

function getUsernameBySessionId(sessionId, callback) {
    User.findOne({sessionId: sessionId}, function (err, user) {
        if (err) {
            logger.log('error', 'getUserBySessionId', err);
            return callback(err);
        }
        if (!user) {
            logger.log('error', 'user with sessionId: %s not found', sessionId);
            return callback(new Error('not found'));
        }
        logger.log('info', 'found user with sessionId: ', sessionId);
        return callback(null, user.username);
    });
}

function getAuthStatusList(username, callback) {
    readUser(username, function (err, user) {
        if (err) {
            return callback(err);
        } else {
            var list = [];
            console.log(user);
            for (var i = 0; i < user.auth.length; i++) {
                list[i] = user.auth[i].service;
            }
            return callback(null, list);
        }
    });
}

/**
 * Whenever a user is not found this method is called and returns
 * not found error on previous callback
 * @param name
 * @param functionName
 * @param callback
 * @returns {*}
 * @private
 */
function _notFoundError(name, functionName, callback) {
    var error = new Error('no user with ' + name + ' found while performing: ' + functionName);
    logger.log('error', error.message);
    return callback(error);
}


module.exports = {
    connect: connect,
    createUser: createUser,
    readUser: readUser,
    deleteUser: deleteUser,
    isLoginCorrect: isLoginCorrect,
    addAuthentication: addAuthentication,
    refreshAuthentication: refreshAuthentication,
    setSessionId: setSessionId,
    isSessionIdCorrect: isSessionIdCorrect,
    getUsernameBySessionId: getUsernameBySessionId,
    getAuthStatusList: getAuthStatusList
};