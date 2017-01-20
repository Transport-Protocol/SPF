/**
 * Created by PhilippMac on 15.01.17.
 */
var request = require('request');


var options = {
    method: 'Get',
    uri: 'https://owncloud.informatik.haw-hamburg.de/remote.php/webdav/REAME.pdf',
    auth: {
        user: 'abi515',
        password: 'Injection1',
        sendImmediately: false
    }
};
var call = request(options);


call.on('response', function (response) {
    var body = '';
    response.on('data', function (chunk) {
        body += chunk;
    });
    response.on('end', function () {
        console.log('BODY: ' + body);
    });
});

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