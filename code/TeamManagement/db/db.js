/**
 * Created by PhilippMac on 24.08.16.
 */
var mongoose = require('mongoose'),
    nconf = require('nconf'),
    Team = require('./models/Team'),
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
        logger.log('info', "connect to db: ", connection.name, " succesful!");
    });
}

/**
 * Creates a team in mongodb
 * @param name
 * @param password
 * @param callback err,user
 */
function createTeam(teamCreator, teamName, password, callback) {
    // create a user a new user
    var memberArray = [];
    memberArray.push(teamCreator);
    var newTeam = new Team({
        teamName: teamName,
        password: password,
        teamCreator: teamCreator,
        members: [teamCreator]
    });
// save team to database
    newTeam.save(function (err) {
        if (err) {
            logger.log('error', 'creating new Team', err);
            return callback(err);
        }
        logger.log('info', 'succesfully created Team with name: ' + teamName);
        return callback(null, newTeam);
    });
}


function readTeam(name, callback) {
    Team.findOne({teamName: name}, function (err, team) {
        if (err) {
            logger.log('error', 'read Team', err.message);
            return callback(err);
        }
        if (!team) {
            var error = new Error('no Team with ' + name + ' found');
            _notFoundError(name, 'readTeam', callback);
        } else {
            logger.log('info', 'succesfully read Team with name: ' + name);
            return callback(null, team);
        }
    });
}

/**
 * Removes a team from mongodb
 * @param name
 * @param callback err,isRemoved
 */
function deleteTeam(name, callback) {
    Team.remove({teamName: name}, function (err, removed) {
        if (err) {
            logger.log('error', 'delete Team - ', err.message);
            return callback(err);
        }
        if (removed.result.n === 0) {
            _notFoundError(name, 'deleteTeam', callback);
        } else {
            logger.log('info', 'succesfully deleted Team with name: ' + name);
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
function isTeamLoginCorrect(name, password, callback) {
    readTeam(name, function (err, team) {
        if (err) {
            logger.log('error', 'isTeamLoginCorrect - ', err.message);
            callback(err);
        }
        team.comparePassword(password, function (err, isMatch) {
            if (err) {
                logger.log('error', 'isTeamLoginCorrect - ', err.message);
                callback(err);
            }
            logger.log('info', 'succesfully checked isTeamLoginCorrect for name: ' + name + '  result: ' + isMatch);
            callback(null, isMatch);
        });
    });
}

/**
 * Whenever a team is not found this method is called and returns
 * not found error on previous callback
 * @param name
 * @param functionName
 * @param callback
 * @returns {*}
 * @private
 */
function _notFoundError(name, functionName, callback) {
    var error = new Error('no team with ' + name + ' found while performing: ' + functionName);
    logger.log('error', error.message);
    return callback(error);
}


module.exports = {
    connect: connect,
    createTeam: createTeam,
    readTeam: readTeam,
    deleteTeam: deleteTeam,
    isTeamLoginCorrect: isTeamLoginCorrect
};