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
};


function createUser(name, password, callback) {
    // create a user a new user
    var newUser = new User({
        username: name,
        password: password
    });
// save user to database
    newUser.save(function (err) {
        if (err) return callback(err);
        return callback(null, newUser);
    });
};

function readUser(name, callback) {
    User.findOne({username:name}, function(err,user){
       if(err){
           return callback(err);
       }
       return callback(null,user);
    });
}

module.exports = {
    connect: connect,
    createUser: createUser,
    readUser: readUser
};