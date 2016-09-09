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
 * no sub-directories regarded
 * @param path
 * @param callback
 */
function getFileTree(access_token, path, callback) {
    //split up path
    var splitted = path.split('/');
    var parent = 'root'; //root folder it is just root
    if (path === '' || path === '/') { //if root folder selected,directly get content
        _getFolderContent(access_token, parent, function (err, content) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, content);
            }
        });
    } else { //if subfolder selected,recursively iterate over folder to get the folderid
        var step = function (i) {
            _getFolderId(access_token, parent, splitted[i], function (err, id) {
                if (err) {
                    return callback(err);
                } else {
                    parent = id;
                    if (i === splitted.length - 1) { //real folder found,get contents
                        console.log('now get folder content');
                        _getFolderContent(access_token, id, function (err, content) {
                            if (err) {
                                return callback(err);
                            } else {
                                return callback(null, content);
                            }
                        });
                    } else {
                        step(i + 1);
                    }
                }
            });
        };
        step(0);
    }
};


function uploadFile(oauth2Token, path, fileBuffer, fileName, callback) {
    console.log(oauth2Token);
    var url = 'https://content.dropboxapi.com/1/files_put/auto/' + path + '/' + fileName;
    var options = {
        method: 'PUT',
        uri: url,
        auth: {
            bearer: _formatOauth2Token(oauth2Token)
        },
        multipart: [{
            body: fileBuffer
        }]
    };

    request(options, function (err, response) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        winston.log('info', 'succesfully uploaded file to dropbox');
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
function getFile(oauth2Token, filePath, callback) {
    var splitted = filePath.split('/');
    var fileUrl = 'https://content.dropboxapi.com/1/files/auto/' + filePath;
    var pathSplit = filePath.split('/');
    //Get fileName from path for return value
    var fileName = pathSplit[pathSplit.length - 1];
    var options = {
        method: 'GET',
        uri: fileUrl,
        encoding: null,
        auth: {
            bearer: _formatOauth2Token(oauth2Token)
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
        winston.log('info', 'succesfully got file from dropbox');
        return callback(null, fileName, body);
    });
}


function _getFolderId(access_token, parentId, folderName, callback) {
    var url = 'https://www.googleapis.com/drive/v2/files?q=mimeType=\'application/vnd.google-apps.folder\'andtitle=\'' + folderName + '\'and\'' + parentId + '\'+in+parents';
    console.log(url);
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            bearer: access_token
        },
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
        var items = JSON.parse(body).items;
        if (items.length === 0) {
            return callback(new Error('not found'));
        }
        var id = items[0].id;
        winston.log('info', 'succesfully got folderid from google for folder: %s', folderName);
        return callback(null, id);
    });
}

function _getFolderContent(access_token, folderId, callback) {
    var url = 'https://www.googleapis.com/drive/v2/files/?q=trashed=falseand\'' + folderId + '\'+in+parents';
    console.log(url);
    var options = {
        method: 'GET',
        uri: url,
        auth: {
            bearer: access_token
        },
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
        winston.log('info', 'succesfully got filetree from google');
        return callback(null, _googleDirFormatToSimpleJSON(body));
    });
}


function _googleDirFormatToSimpleJSON(body) {
    var parsed = JSON.parse(body);
    var simpleJSONFormatArray = [];
    for (var i = 0; i < parsed.items.length; i++) {
        var simpleFormat = {};
        simpleFormat.name = parsed.items[i].title;
        if (parsed.items[i].mimeType === 'application/vnd.google-apps.folder') {
            simpleFormat.type = 'dir';
        } else {
            simpleFormat.type = 'file';
        }
        simpleJSONFormatArray.push(simpleFormat);
    }
    console.log(simpleJSONFormatArray.length);
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


module.exports = {
    getFileTree: getFileTree,
    getFile: getFile,
    uploadFile: uploadFile,
    getFolderId: _getFolderId
};