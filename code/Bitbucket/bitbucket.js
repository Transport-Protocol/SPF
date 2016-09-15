/**
 * Created by PhilippMac on 30.08.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');


/**
 * Retrieves all Repos from user
 * @param auth containing username and password
 * @param callback err,dirs
 */
function getRepositories(auth, callback) {
    var url = 'https://api.bitbucket.org/2.0/repositories?role=contributor';
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            'bearer': auth
        },
        headers: {
            'User-Agent': 'Seco Api'
        }
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
        winston.log('info', 'successfully got repos from bitbucket');
        return callback(null, _parseRepoListBody(body));
    });
}

function addUserToRepo(auth, repo, userToAdd, callback) {
    _getUsername(auth,function(err,username){
       if(err){
           return callback(err);
       } else {
           var url = 'https://api.bitbucket.org/1.0/privileges/' + username + '/' + repo  + '/' + userToAdd;
           console.log(url);
           var privilege = 'write';
           var options = {
               method: 'PUT',
               uri: url,
               auth: {
                   'bearer': auth
               },
               headers: {
                   'User-Agent': 'Seco Api'
               },
               form:privilege
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
               winston.log('info', 'successfully added %s to repo %s', userToAdd, repo);
               return callback(null, 'ok');
           });
       }
    });
}

function getRepoContent(auth, repo, path, callback) {
    _getUsername(auth,function(err,username){
        if(err){
            return callback(err);
        } else {
            var url = 'https://api.bitbucket.org/1.0/repositories/' + username + '/' + repo + '/src' + '/master/' + path;
            console.log(url);
            var options = {
                method: 'GET',
                uri: url,
                auth: {
                    'bearer': auth
                },
                headers: {
                    'User-Agent': 'Seco Api'
                }
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
                winston.log('info', 'successfully got repos from bitbucket');
                return callback(null, _parseRepoContent(body));
            });
        }
    });
}

function _getUsername(auth, callback) {
    var url = 'https://api.bitbucket.org/2.0/user';
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            'bearer': auth
        },
        headers: {
            'User-Agent': 'Seco Api'
        }
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
        winston.log('info', 'successfully got username from bitbucket', JSON.parse(body).username);
        return callback(null, JSON.parse(body).username);
    });
}

function downloadRepository(auth,repo,callback){
    _getUsername(auth,function(err,username){
        if(err){
            return callback(err);
        } else {
            var url = 'https://bitbucket.org/' + username + '/' + repo + '/get/master.tar.gz';
            console.log(url);
            var options = {
                method: 'GET',
                uri: url,
                auth: {
                    'bearer': auth
                },
                headers: {
                    'User-Agent': 'Seco Api'
                }
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
                winston.log('info', 'successfully got repo archive from bitbucket');
                return callback(null, body);
            });
        }
    });
}


function _parseRepoListBody(body) {
    var parsed = JSON.parse(body);
    var result = [];
    for (var i = 0; i < parsed.values.length; i++) {
        result[i] = {repo: parsed.values[i].name};
    }
    return result;
}

function _parseRepoContent(body) {
    var parsed = JSON.parse(body);
    var result = [];
    var i = 0;
    for (; i < parsed.directories.length; i++) {
        result[i] = {name: parsed.directories[i], tag: 'dir'};
    }
    for (var j = 0; j < parsed.files.length; j++) {
        var splitted = parsed.files[j].path.split('/');
        result[i + j] = {name: splitted[splitted.length - 1], tag: 'file'};
    }
    return result;
}

module.exports = {
    getRepositories: getRepositories,
    addUserToRepo: addUserToRepo,
    getRepoFiles: getRepoContent,
    downloadRepository: downloadRepository
};