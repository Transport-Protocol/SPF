/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    User = require('./models/user'),
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
        var alreadyRegistered = false;
        for (var i = 0; i < user.auth.length; i++) {
            if (user.auth[i].service === service) {
                //Entry already registered;update
                logger.log('info', 'authentication entry already registered for user %s on service %s', username, service);
                alreadyRegistered = true;
                user.auth[i].access_token = access_token;
                user.auth[i].refresh_token = refresh_token;
            }
        }
        if (!alreadyRegistered) user.auth.push({
            service: service,
            access_token: access_token,
            refresh_token: refresh_token
        });
        user.save(function (err) {
            if (err) {
                logger.log('error', 'adding authentication ', err.message);
                return callback(err);
            }
            logger.log('info', 'successfully added authentication for user : ' + user);
            return callback(null, user);
        });
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
    addAuthentication: addAuthentication
};