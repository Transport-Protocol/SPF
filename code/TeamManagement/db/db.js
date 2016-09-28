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
        logger.log('info', "connect to db: ", connection.name, " successful!");
    });
}


/**
 * Creates a team
 * @param teamCreator
 * @param teamName
 * @param password
 * @param callback
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
        logger.log('info', 'successfully created Team with name: ' + teamName);
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
            logger.log('info', 'successfully read Team with name: ' + name);
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
            logger.log('info', 'successfully deleted Team with name: ' + name);
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
        } else {
            team.comparePassword(password, function (err, isMatch) {
                if (err) {
                    logger.log('error', 'isTeamLoginCorrect - ', err.message);
                    callback(err);
                }
                logger.log('info', 'successfully checked isTeamLoginCorrect for name: ' + name + '  result: ' + isMatch);
                if (!isMatch) {
                    callback(new Error('wrong password'));
                } else {
                    callback(null);
                }
            });
        }
    });
}

/**
 * Returns all teams the user is member of
 * @param username
 * @param callback
 */
function listTeams(username, callback) {
    Team.find({members: username}).lean().exec(function (err, teams) {
        if (err) {
            return callback(err);
        }
        if (teams.length === 0) {
            return callback(new Error('no teams found'));
        }
        var teamsInfoArray = [];
        //remove password, not needed here
        for (var i = 0; i < teams.length; i++) {
            teamsInfoArray[i] = {
                teamName: teams[i].teamName,
                teamCreator: teams[i].teamCreator,
                members: teams[i].members,
                services: teams[i].services
            }
        }
        logger.log('info', 'successfully got infos of teams');
        return callback(null, teamsInfoArray);
    });
}

function addServices(teamName, services, callback) {
    Team.findOne({teamName: teamName}, function (err, team) {
            if (err) {
                return callback(err);
            }
            if (!team) {
                return callback(new Error('team not found'));
            } else {
                for (var i = 0; i < services.length; i++) {
                    if (team.services.indexOf(services[i]) === -1) {
                        team.services.push(services[i]);
                    }
                }
                team.save(function (err) {
                    if (err) {
                        logger.log('error', 'adding services ', err.message);
                        return callback(err);
                    }
                    logger.log('info', 'successfully added Services %s to team ', team.services, teamName);
                    return callback(null);
                });
            }
        }
    )
    ;
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
    isTeamLoginCorrect: isTeamLoginCorrect,
    listTeams: listTeams,
    addServices: addServices
};