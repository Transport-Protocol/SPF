/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    User = require('./models/user'),
    logger = require('winston');

var options = {
    db: {native_parser: true},
    server: {poolSize: nconf.get('dbPoolSize')},
    user: nconf.get('dbUsername'),
    pass: nconf.get('dbPassword')
};

function connect() {
    var connection;
    mongoose.connect(nconf.get('dbPath'), options);
    connection = mongoose.connection;
    connection.on('error', function callback(err) {
        logger.log('error', err);
        throw err;
    });
    connection.once('open', function callback() {
        //enable keep alive so a long session cant be interrupted
        options.server.socketOptions = options.replset.socketOptions = {keepAlive: 1};
        logger.log('info', "connect to db: ", connection.name, " succesful!");
    });
}


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
        logger.log('info', 'succesfully created User with name: ' + name);
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
            logger.log('info', 'succesfully read User with name: ' + name);
            return callback(null, user);
        }
    });
}


function deleteUser(name, callback) {
    User.remove({username: name}, function (err, removed) {
        if (err) {
            logger.log('error', 'delete User', err.message);
            return callback(err);
        }
        if (removed.result.n === 0) {
            _notFoundError(name, 'deleteUser', callback);
        } else {
            logger.log('info', 'succesfully deleted User with name: ' + name);
            return callback(null, removed);
        }
    });
}

function _notFoundError(name, functionName, callback) {
    var error = new Error('no user with ' + name + ' found while performing: ' + functionName);
    logger.log('error', error.message);
    return callback(error);
}


module.exports = {
    connect: connect,
    createUser: createUser,
    readUser: readUser,
    deleteUser: deleteUser
};