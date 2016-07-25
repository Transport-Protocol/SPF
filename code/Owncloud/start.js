/**
 * Created by PhilippMac on 25.07.16.
 */
var request = require('request');
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
    /*
    idee, regex nach webdav,dort den pfad nehmen um verzeichnisnamen auszulesenwenn dateityp dahinter dann is es eine file
     */
    console.log(body);
});