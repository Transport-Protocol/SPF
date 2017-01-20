/**
 * Created by PhilippMac on 25.07.16.
 */
'use strict';

var request = require('request'),
    parseString = require('xml2js').parseString,
    winston = require('winston');

const path = require('path');


var owncloud = {};

/**
 * Returns a directory specified by path
 * no sub-directories regarded
 * @param username
 * @param password
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
            sendImmediately: false
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback({msg: err.message, code: 500});
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback({msg: response.statusMessage, code: response.statusCode});
        }
        _getDirectoryFromXML(body, (err, dirs) => {
            if(err){
                return callback({msg: err.message, code: 500});
            }
            winston.log('info', 'succesfully got filetree from owncloud');
            return callback(null, JSON.stringify(dirs));
        });
    });
};


owncloud.uploadFile = function (username, password, path, fileName, cb) {
    var formattedPath = _formatPath(path);
    _createAllFolderFromPath(this, username, password, formattedPath.split('/'), function (err, status) {
        var url = 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + formattedPath + '/' + fileName;
        var options = {
            method: 'PUT',
            uri: url,
            auth: {
                user: username,
                password: password
            }
        };
        var myRequest = request(options);
        return cb(myRequest);
    });
};

function _createAllFolderFromPath(self, username, password, folderArray, callback) {
    var exitCondition = folderArray.length;
    var step = function (i) {
        if (i === exitCondition) {
            return callback(null, 'finished');
        }
        i++;
        var path = '';
        for (var j = 0; j < i; j++) {
            path += folderArray[j];
            //wenn nicht der letzte folder,dann immer / als delimiter
            if (j < i - 1) {
                path += '/';
            }
        }
        self.createFolder(username, password, path, function () {
            step(i);
        });
    };
    step(0);
}

owncloud.createFolder = function (username, password, path, callback) {
    var url = 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + _formatPath(path);
    var options = {
        method: 'MKCOL',
        uri: url,
        auth: {
            user: username,
            password: password,
            sendImmediately: false
        }
    };

    request(options, function (err, response) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback({msg: err.message, code: 500});
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            if (response.statusCode === 405 && response.statusMessage === 'Method Not Allowed') {
                winston.log('error', 'folder already present. cant create it');
            } else {
                winston.log('error', 'http error: code: %s msg: %s', response.statusCode, response.statusMessage);
            }
            return callback({msg: response.statusMessage, code: response.statusCode});
        }
        winston.log('info', 'succesfully created folder in owncloud');
        return callback(null, ' succesfully created folder');
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
owncloud.getFile = function (username, password, filePath) {
    var dir = path.dirname(filePath);
    var fileName = path.basename(filePath);
    var options = {
        method: 'GET',
        uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + dir + '/' + fileName,
        encoding: null,
        auth: {
            user: username,
            password: password,
            sendImmediately: false
        }
    };
    var myRequest = request(options);
    return myRequest;
};


function _getDirectoryFromXML(xml, cb) {
    var dirEntries = [];
    var myPath = path;
    parseString(xml, function (err, result) {
        if (err) {
            return cb(err);
        }
        var dirs = result['d:multistatus']['d:response'];
        dirs.shift(); //remove first unrelated object
        dirs.forEach(function (dir) {
            var dirName = myPath.basename(dir['d:href'][0]);
            var contentLength = 0;
            try {
                contentLength = dir['d:propstat'][0]['d:prop'][0]['d:getcontentlength'][0];
            } catch (err) {

            }
            var tag = 'file';
            if (dir['d:href'][0][dir['d:href'][0].length - 1] === '/') {
                tag = 'folder';
            }
            dirEntries.push({
                tag: tag,
                name: dirName,
                contentLength: contentLength
            });
        });
        return cb(null, _sortArrayAlphabetically(dirEntries));
    });
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


function _formatPath(path) {
    if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }
    return path;
}

module.exports = owncloud;