/**
 * Created by PhilippMac on 30.08.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');



/**
 * Returns a directory specified by path
 * no sub-directories regarded
 * @param path
 * @param callback
 */
function getRepositories (callback) {
    var url = 'https://api.github.com/user/repos';
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            user:'philippHAW',
            pass:'Injection1'
        },
        headers:{
            'User-Agent':'philippHAW'
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
        winston.log('info','succesfully got repos from github',JSON.stringify(parsed));
        return callback(null, JSON.stringify(parsed));
    });
};

function _parseRepoListBody(body){
    var parsed = JSON.parse(body);
    var result = [];
    for(var i = 0;i<parsed.length;i++){
        result[i] = parsed[i].name;
    }
    return result;
}


module.exports = {
    getRepositories : getRepositories
};