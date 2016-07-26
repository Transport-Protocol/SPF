/**
 * Created by PhilippMac on 25.07.16.
 */
var request = require('request');




var connector = {};

connector.getFileTree = function(path,callback){
    var options = {
        method: 'PROPFIND',
        uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/' + path,
        auth: {
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        }
    };
    request(options, function(err, response, body) {
        if(err){
            return callback(err);
        }
        var dirs = getDirectoryFromXML(body,cleanupPath(path));
        return callback(null,dirs);
    });
}

connector.getFile = function(pathToFile,callback){
    var options = {
        method: 'GET',
        uri: 'https://owncloud.informatik.haw-hamburg.de/index.php/apps/files/ajax/download.php?dir=%2FBA-Philipp%2FUmfrage&files=Infoblatt.pdf',
        encoding: null,
        auth: {
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        }
    };
    request(options, function(err, response, body) {
        if(err){
            return callback(err);
        }
        var fs = require('fs');
        fs.writeFile('test.pdf', new Buffer(body), function(err) {
            if(err) {
                return callback(err);
            }
            console.log("The file was saved!");
            return callback(null,body);
        });
    });
}

function cleanupPath(path){
    if(path[path.length-1] === '/'){
        path = path.substring(0,path.length-1);
    }
    return path;
}

function getDirectoryFromXML(xml,path){
    var directoryNames = [];
    var splitted = xml.split('webdav');
    //remove first unrelated splits
    splitted.shift();
    splitted.shift();
    //remove leading slash
    var deleteCharsCount = path.length+2; //remove leading and following slash
    if(path === ''){
        deleteCharsCount = deleteCharsCount - 1; //empty path,only remove leading slash
    }
    for(var i = 0;i<splitted.length;i++){
        for(var j = 0;j<deleteCharsCount;j++){
            splitted[i] = splitted[i].substring(1);
        }
        var firstBackSlash = splitted[i].indexOf('\/');
        var directory = splitted[i].substring(0,firstBackSlash);
        directoryNames.push(directory);
    }
    return sortAlphabetically(directoryNames);
}

function sortAlphabetically(array){
    return array.sort(function(a, b){
        var nameA=a.toLowerCase(), nameB=b.toLowerCase();
        if (nameA < nameB) //sort string ascending
            return -1;
        if (nameA > nameB)
            return 1;
        return 0; //default return value (no sorting)
    });
}


module.exports = connector;