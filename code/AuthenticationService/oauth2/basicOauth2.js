/**
 * Created by PhilippMac on 02.09.16.
 */
/**
 * Client: SecoApi
 * Resource Owner: User from SecoApi
 * Resource Server: The server hosting the protected resources, capable of accepting
 and responding to protected resource requests using access tokens
 * authorization server: The server issuing access tokens to the client after successfully
 authenticating the resource owner and obtaining authorization.
 * defined by https://tools.ietf.org/html/rfc6749#section-1.1
 */

var fs = require('fs'),
    request = require('request');


function OAuth2(filePath,callback) {
    fs.readFile(filePath,function(err,file){
        if(err){
            return callback(err);
        }
        this.config = JSON.parse(file);
        return callback(null);
    });
}

OAuth2.prototype.getAuthorizationURL = function (userName) {
    var baseUrl = 'https://github.com/login/oauth/authorize?';
    var clientId = 'client_id=' + config.client_id;
    var redirect_uri = '&redirect_uri=' + config.redirect_uri;
    var state = '&state=' + userName;
    return baseUrl + clientId + redirect_uri + state;
};

OAuth2.prototype.getRedirectURI = function () {
    return config.redirect_uri;
}

OAuth2.prototype.getRedirectRoute = function () {
    return config.redirect_route;
}



module.exports = OAuth2;