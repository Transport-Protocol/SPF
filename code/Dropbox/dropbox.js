/**
 * Created by phili on 02.08.2016.
 */
/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');


/**
 * Returns a directory specified by path
 * @param oauth2Token
 * @param path
 * @param callback
 */
function getFileTree(oauth2Token, path, callback) {
    var formattedPath = _formatInputPath(path);
    var url = 'https://api.dropboxapi.com/2/files/list_folder';
    var options = {
        method: 'POST',
        uri: url,
        auth: {
            bearer: _formatOauth2Token(oauth2Token)
        },
        json: {
            "path": formattedPath,
            "recursive": false,
            "include_media_info": false,
            "include_deleted": false,
            "include_has_explicit_shared_members": false
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback({msg: err.message, code: 500});
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            console.log(response.body);
            return callback({msg: response.statusMessage, code: response.statusCode});
        }
        var dirs = body.entries;
        winston.log('info', 'successfully got filetree from dropbox');
        return callback(null, JSON.stringify(_dropboxDirFormatToSimpleJSON(_sortArrayAlphabetically(dirs))));
    });
}


function uploadFile(oauth2Token, path, fileName) {
    var formattedPath = _formatInputPath(path);
    var url = 'https://content.dropboxapi.com/1/files_put/auto/' + formattedPath + '/' + fileName;
    var options = {
        method: 'PUT',
        uri: url,
        auth: {
            bearer: _formatOauth2Token(oauth2Token)
        }
    };
    var myRequest = request(options);
    return myRequest;
}

/**
 * Gets a file from dropbox
 * encoding = null has to be set for binary data,otherwise file gets corrupted by utf encoding
 * @param oauth2token
 * @param filePath
 */
function getFile(oauth2Token, filePath) {
    var formattedPath = _formatInputPath(filePath);
    var fileUrl = 'https://content.dropboxapi.com/1/files/auto/' + formattedPath;
    var options = {
        method: 'GET',
        uri: fileUrl,
        encoding: null,
        auth: {
            bearer: _formatOauth2Token(oauth2Token)
        }
    };
    var myRequest = request(options);
    return myRequest;
}


function _dropboxDirFormatToSimpleJSON(dirs) {
    var simpleJSONFormatArray = [];
    for (var i = 0; i < dirs.length; i++) {
        var contentLength = 0;
        try {
            contentLength = dirs[i]['size'];
        } catch(err){
            //directory has no size
        }
        var simpleFormat = {
            tag: dirs[i]['.tag'],
            name: dirs[i]['name'],
            contentLength: contentLength
        };
        simpleJSONFormatArray.push(simpleFormat);
    }
    return simpleJSONFormatArray;
}


function _sortArrayAlphabetically(array) {
    return array.sort(function (a, b) {
        var nameA = a['name'].toLowerCase(), nameB = b['name'].toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });
}

function _formatOauth2Token(token) {
    var oauth2TokenWithoutSpace = token.replace(/\s+/g, '');
    return oauth2TokenWithoutSpace.replace('Bearer', ''); //Remove Bearer
}

function _formatInputPath(path) {
    var res = path;
    if (path !== '') {
        if (path.charAt(0) !== '/') {
            res = '/' + path;
        }
    }
    return res;
}


module.exports = {
    getFileTree: getFileTree,
    getFile: getFile,
    uploadFile: uploadFile
};