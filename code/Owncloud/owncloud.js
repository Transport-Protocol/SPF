/**
 * Created by PhilippMac on 25.07.16.
 */
var request = require('request');




var connector = {};

connector.getFileTree = function(path,callback){
    var options = {
        method: 'PROPFIND',
        uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/',
        auth: {
            user: 'abi515',
            password: 'Injection2',
            sendImmediately: true
        }
    };
    request(options, function(error, response, body) {
        if(error){
            return callback(error);
        }
        var dirs = getDirectoryFromXML(body);
        return callback(null,dirs);
    });
}


function getDirectoryFromXML(xml){
    var directoryNames = [];
    var splitted = xml.split('webdav');
    //remove first unrelated splits
    splitted.shift();
    splitted.shift();
    //remove leading slash
    for(var i = 0;i<splitted.length;i++){
        splitted[i] = splitted[i].substring(1);
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