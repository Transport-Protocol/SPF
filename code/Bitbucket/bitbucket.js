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
function getRepositories (auth,callback) {
    var url = 'https://api.bitbucket.org/2.0/repositories/';
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            'bearer' : auth
        },
        headers:{
            'User-Agent': 'Seco Api'
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error','application error: ',err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error','http error: ',err);
            console.log(response.body);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage  + ' ' + body));
        }
        var parsed = _parseRepoListBody(body);
        winston.log('info','succesfully got repos from github',parsed);
        return callback(null, parsed);
    });
};

function addUserToRepo (auth,repo,userToAdd,callback) {
    var url = 'https://api.github.com/repos/' + auth.username +  '/' + repo + '/collaborators/' + userToAdd;
    console.log(url);
    var options = {
        method: 'PUT',
        uri: url,
        auth: {
            user:auth.username,
            pass:auth.password
        },
        headers:{
            'User-Agent': auth.username
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error','application error: ',err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error','http error: ',err);
            console.log(response.body);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage  + ' ' + body));
        }
        winston.log('info','succesfully added %s to repo %s',userToAdd,repo);
        return callback(null, 'ok');
    });
};

function getRepoContent (auth, repo, path, callback) {
    var url = 'https://api.github.com/repos/' + auth.username +  '/' + repo + '/contents/' + path;
    console.log(url);
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            user:auth.username,
            pass:auth.password
        },
        headers:{
            'User-Agent': auth.username
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error','application error: ',err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error','http error: ',err);
            console.log(response.body);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage  + ' ' + body));
        }
        var parsed = _parseRepoContent(body);
        winston.log('info','content for repo %s: ',repo);
        return callback(null, parsed);
    });
};


function _parseRepoListBody(body){
    var parsed = JSON.parse(body);
    var result = [];
    for(var i = 0;i<parsed.length;i++){
        result[i] = {repo:parsed[i].name};
    }
    return result;
}

function _parseRepoContent(body){
    var parsed = JSON.parse(body);
    var result = [];
    for(var i = 0;i<parsed.length;i++){
        result[i] = {name:parsed[i].name,tag:parsed[i].type};
    }
    return result;
}

module.exports = {
    getRepositories : getRepositories,
    addUserToRepo : addUserToRepo,
    getRepoFiles : getRepoContent
};