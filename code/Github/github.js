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
    var url = 'https://api.github.com/user/repos';
    var options = {
        method: 'GET',
        uri: url,
        headers: {
            'User-Agent': 'Seco Api'
        }
    };
    if (auth.type == 'BASIC') {
        options.auth = {
            user: auth.username,
            pass: auth.password
        }
    } else {
        options.auth = {
            'bearer': auth.token
        }
    }
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            console.log(response.body);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage + ' ' + body));
        }
        var parsed = _parseRepoListBody(body);
        winston.log('info', 'successfully got repos from github', parsed);
        return callback(null, parsed);
    });
}

function addUserToRepo(auth, repo, userToAdd, callback) {
    _getUsername(auth,function(err,username){
       if(err){
           return callback(err);
       } else {
           var url = 'https://api.github.com/repos/' + username + '/' + repo + '/collaborators/' + userToAdd;
           console.log(url);
           var options = {
               method: 'PUT',
               uri: url,
               headers: {
                   'User-Agent': 'Seco Api'
               }
           };
           if (auth.type == 'BASIC') {
               options.auth = {
                   user: auth.username,
                   pass: auth.password
               }
           } else {
               options.auth = {
                   'bearer': auth.token
               }
           }
           request(options, function (err, response, body) {
               if (err) {
                   winston.log('error', 'application error: ', err);
                   return callback(err);
               }
               if (response.statusCode >= 400 && response.statusCode <= 499) {
                   winston.log('error', 'http error: ', err);
                   console.log(response.body);
                   return callback(new Error(response.statusCode + ': ' + response.statusMessage + ' ' + body));
               }
               winston.log('info', 'successfully added %s to repo %s', userToAdd, repo);
               return callback(null, 'ok');
           });
       }
    });
}

function getRepoContent(auth, repo, path, callback) {
    _getRepoOwner(auth,repo, function (err, owner) {
        if (err) {
            return callback(err);
        } else {
            var url = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path;
            console.log(url);
            var options = {
                method: 'GET',
                uri: url,
                headers: {
                    'User-Agent': 'Seco Api'
                }
            };
            if (auth.type == 'BASIC') {
                options.auth = {
                    user: auth.username,
                    pass: auth.password
                }
            } else {
                options.auth = {
                    'bearer': auth.token
                }
            }
            request(options, function (err, response, body) {
                if (err) {
                    winston.log('error', 'application error: ', err);
                    return callback(err);
                }
                if (response.statusCode >= 400 && response.statusCode <= 499) {
                    winston.log('error', 'http error: ', err);
                    console.log(response.body);
                    return callback(new Error(response.statusCode + ': ' + response.statusMessage + ' ' + body));
                }
                var parsed = _parseRepoContent(body);
                winston.log('info', 'content for repo %s: ', repo);
                return callback(null, parsed);
            });
        }
    });
}

/**
 * Gets the username from github api
 * @param auth
 * @param callback err,username
 * @private
 */
function _getUsername(auth, callback) {
    if (auth.type === 'BASIC') {
        return callback(null, auth.username);
    } else {
        var url = 'https://api.github.com/user';
        console.log(url);
        var options = {
            method: 'GET',
            uri: url,
            headers: {
                'User-Agent': 'Seco Api'
            },
            auth: {
                'bearer': auth.token
            }

        };
        request(options, function (err, response, body) {
            if (err) {
                winston.log('error', 'application error: ', err);
                return callback(err);
            }
            if (response.statusCode >= 400 && response.statusCode <= 499) {
                winston.log('error', 'http error: ', err);
                console.log(response.body);
                return callback(new Error(response.statusCode + ': ' + response.statusMessage + ' ' + body));
            }
            winston.log('info', 'content for user %s: ', body);
            return callback(null, JSON.parse(body).login);
        });
    }
}

function _getRepoOwner(auth,repo,callback){
    var url = 'https://api.github.com/user/repos';
    var options = {
        method: 'GET',
        uri: url,
        headers: {
            'User-Agent': 'Seco Api'
        }
    };
    if (auth.type == 'BASIC') {
        options.auth = {
            user: auth.username,
            pass: auth.password
        }
    } else {
        options.auth = {
            'bearer': auth.token
        }
    }
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            console.log(response.body);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage + ' ' + body));
        }
        var parsed = JSON.parse(body);
        var owner = "";
        for(var i = 0;i<parsed.length;i++){
            if(parsed[i].name === repo){
                owner = parsed[i].owner.login;
            }
        }
        winston.log('info', 'successfully got repo owner from github: ', owner);
        return callback(null, owner);
    });
}


function _parseRepoListBody(body) {
    var parsed = JSON.parse(body);
    var result = [];
    for (var i = 0; i < parsed.length; i++) {
        result[i] = parsed[i].name;
    }
    return result;
}


function _parseRepoContent(body) {
    var parsed = JSON.parse(body);
    var result = [];
    for (var i = 0; i < parsed.length; i++) {
        var type = parsed[i].type;
        if(type === 'dir'){
            type = 'folder';
        }
        result[i] = {name: parsed[i].name, tag: type};
    }
    return result;
}

module.exports = {
    getRepositories: getRepositories,
    addUserToRepo: addUserToRepo,
    getRepoFiles: getRepoContent
};