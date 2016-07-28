'use strict'
/**
 * Created by PhilippMac on 25.07.16.
 */
var request = require('request');


var connector = {};

/**
 * Returns a directory specified by path
 * no sub-directories regarded
 * @param path
 * @param callback
 */
connector.getFileTree = function (path, callback) {
    var options = {
        method: 'PROPFIND',
        uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + path,
        auth: {
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            return callback(err);
        }
        var dirs = _getDirectoryFromXML(body, _formatPath(path));
        return callback(null, dirs);
    });
}


connector.uploadFile = function (path, fileBuffer, fileName, callback) {
    var url = 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + _formatPath(path) + '/' + fileName;
    var options = {
        method: 'PUT',
        uri: url,
        auth: {
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        },
         multipart: [{
         fileName: fileName,
         body: fileBuffer
         }]
    };

    request(options, function (err, response, body) {
        if (err) {
            return callback(err);
        }
        return callback(null, 'upload succesful');
    });
}

/**
 * Gets a file from owncloud
 * encoding = null has to be set for binary data,otherwise file gets corrupted by utf encoding
 * @param filePath
 * @param callback
 */
connector.getFile = function (filePath, callback) {
    var baseURL = 'https://owncloud.informatik.haw-hamburg.de/index.php/apps/files/ajax/download.php?';
    var fileUrl = baseURL;
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
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        }
    };
    request(options, function (err, response, body) {
        if (err) {
            return callback(err);
        }
        if(response.statusCode >= 400 && response.statusCode <= 499){
            return callback(new Error(response.statusCode+ ': ' + response.statusMessage));
        }
        console.log(fileName);
        return callback(null, fileName, body);
    });
}


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
        console.log("The file was saved!");
        return callback(null, {'status': 'ok'});
    });
}

function _formatPath(path) {
    if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1);
    }
    return path;
}


module.exports = connector;