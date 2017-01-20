/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    Notification = require('./models/Notification'),
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


function createNotification(username, teamName, message,service, callback) {
    var notification = new Notification({
        username: username,
        teamName: teamName,
        message: message,
        service: service
    });
    notification.save(function (err) {
        if (err) {
            logger.log('error', 'creating new Notification', err);
            return callback(err);
        }
        logger.log('info', 'successfully created Notification: ',JSON.stringify(notification));
        return callback(null, notification);
    });
}

/**
 * Returns all teams the user is member of
 * @param username
 * @param callback
 */
function listNotifications(username,teamName,timeStamp, callback) {
    Notification.find({teamName: teamName,timeStamp: {$gt:timeStamp}}).lean().exec(function (err, notifications) {
        if (err) {
            return callback(err);
        }
        if (notifications.length === 0) {
            return callback(new Error('no notification found'));
        }
        logger.log('info', 'successfully got list of notifications',JSON.stringify(notifications));
        return callback(null, notifications);
    });
}


module.exports = {
    connect: connect,
    createNotification: createNotification,
    listNotifications: listNotifications
};