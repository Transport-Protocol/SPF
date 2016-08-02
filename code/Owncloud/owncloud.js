/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    winston = require('winston');


var owncloud = {};

/**
 * Returns a directory specified by path
 * no sub-directories regarded
 * @param path
 * @param callback
 */
owncloud.getFileTree = function (username, password, path, callback) {
    var options = {
        method: 'PROPFIND',
        uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + path,
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
        var dirs = _getDirectoryFromXML(body, _formatPath(path));
        if (dirs.length === 0) {
            winston.log('error','empty dir');
            return callback(new Error('empty dir'));
        }
        winston.log('info','succesfully got filetree from owncloud');
        return callback(null, dirs);
    });
};


owncloud.uploadFile = function (username, password, path, fileBuffer, fileName, callback) {
    var url = 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + _formatPath(path) + '/' + fileName;
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
        winston.log('info','succesfully uploaded file to owncloud');
        return callback(null, 'upload succesful');
    });
};

/**
 * Gets a file from owncloud
 * encoding = null has to be set for binary data,otherwise file gets corrupted by utf encoding
 * @param username
 * @param password
 * @param filePath
 * @param callback
 */
owncloud.getFile = function (username, password, filePath, callback) {
    var fileUrl = 'https://owncloud.informatik.haw-hamburg.de/index.php/apps/files/ajax/download.php?';
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
        winston.log('info','succesfully got file from owncloud');
        return callback(null, fileName, body);
    });
};


function _getDirectoryFromXML(xml, path) {
    var directoryNames = [];
    var splitted = xml.split('webdav');
    //remove first unrelated splits
    splitted.shift();
    splitted.shift();
    //remove leading slash
    var deleteCharsCount = path.length + 2; //remove leading and following slash
    if (path === '') {
        deleteCharsCount = deleteCharsCount - 1; //empty path,only remove leading slash
    }
    for (var i = 0; i < splitted.length; i++) {
        for (var j = 0; j < deleteCharsCount; j++) {
            splitted[i] = splitted[i].substring(1);
        }
        var firstBackSlash = splitted[i].indexOf('\/');
        var directory = splitted[i].substring(0, firstBackSlash);
        directoryNames.push(directory);
    }
    return _sortArrayAlphabetically(directoryNames);
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

function _formatPath(path) {
    if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }
    return path;
}

module.exports = owncloud;