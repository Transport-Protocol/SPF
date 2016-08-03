/**
 * Created by phili on 02.08.2016.
 */
/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');


var dropbox = {};

/**
 * Returns a directory specified by path
 * no sub-directories regarded
 * @param path
 * @param callback
 */
dropbox.getFileTree = function (oauth2Token, path, callback) {
    var body = {
        "path": path,
        "recursive": false,
        "include_media_info": false,
        "include_deleted": false,
        "include_has_explicit_shared_members": false
    };
    var url = 'https://api.dropboxapi.com/2/files/list_folder';
    var options = {
        method: 'POST',
        uri: url,
        auth: {
            bearer: oauth2Token
        },
        json: {
            "path": path,
            "recursive": false,
            "include_media_info": false,
            "include_deleted": false,
            "include_has_explicit_shared_members": false
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
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        var dirs = body.entries;
        if (dirs.length === 0) {
            winston.log('error','empty dir');
            return callback(new Error('empty dir'));
        }
        winston.log('info','succesfully got filetree from dropbox');
        return callback(null, _dropboxDirFormatToSimpleJSON(dirs));
    });
};


dropbox.uploadFile = function (username, password, path, fileBuffer, fileName, callback) {
    var url = 'https://dropbox.informatik.haw-hamburg.de/remote.php/webdav/' + _formatPath(path) + '/' + fileName;
    var options = {
        method: 'PUT',
        uri: url,
        auth: {
            user: username,
            password: password,
            sendImmediately: true
        },
        multipart: [{
            fileName: fileName,
            body: fileBuffer
        }]
    };

    request(options, function (err, response) {
        if (err) {
            winston.log('error','application error: ',err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error','http error: ',err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        winston.log('info','succesfully uploaded file to dropbox');
        return callback(null, 'upload succesful');
    });
};

/**
 * Gets a file from dropbox
 * encoding = null has to be set for binary data,otherwise file gets corrupted by utf encoding
 * @param username
 * @param password
 * @param filePath
 * @param callback
 */
dropbox.getFile = function (username, password, filePath, callback) {
    var fileUrl = 'https://dropbox.informatik.haw-hamburg.de/index.php/apps/files/ajax/download.php?';
    var pathSplit = filePath.split('/');
    fileUrl += 'dir=';
    var fileName = {};
    if (pathSplit.length <= 1) {
        fileUrl += '%2F';
    }
    for (var i = 0; i < pathSplit.length; i++) {
        if (i === pathSplit.length - 1) {
            //fileName
            fileUrl += '&files=' + pathSplit[i];
            fileName = pathSplit[i];
        } else {
            //directory
            fileUrl += '%2F' + pathSplit[i];
        }
    }
    var options = {
        method: 'GET',
        uri: fileUrl,
        encoding: null,
        auth: {
            user: username,
            password: password,
            sendImmediately: true
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error','application error: ',err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error','http error: ',err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        winston.log('info','succesfully got file from dropbox');
        return callback(null, fileName, body);
    });
};


function _dropboxDirFormatToSimpleJSON(dirs){
    console.log(dirs);
    var simpleJSONFormatArray = [];
    for(var i = 0;i<dirs.length;i++){
        var simpleFormat = {
            tag : dirs[i]['.tag'],
            name : dirs[i]['name']
        }
        simpleJSONFormatArray.push(simpleFormat);
    }
    return simpleJSONFormatArray;
}



function _sortArrayAlphabetically(array) {
    return array.sort(function (a, b) {
        var nameA = a.toLowerCase(), nameB = b.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });
}

function _writeFile(buffer, fileName) {
    var fs = require('fs');
    fs.writeFile(fileName, buffer, function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null, {'status': 'ok'});
    });
}


module.exports = dropbox;