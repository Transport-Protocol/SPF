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
    winston = require('winston'),
    request = require('request');


function OAuth2(expressApp, filePath, callback) {
    this.config = {};
    this.authUrl = {};
    var self = this;
    fs.readFile(filePath, function (err, file) {
        if (err) {
            return callback(err);
        }
        self.config = JSON.parse(file);
        self.authUrl = _setAuthUrl(self);
        winston.log('info', self.getAuthorizationURL('philipp'));
        _registerHttpCallback(self, expressApp);

        return callback(null);
    });
}

function _registerHttpCallback(self, expressApp) {
    expressApp.get(self.getRedirectRoute(), function (req, res) {
        winston.log('info', 'redirect received');
        res.send('ty');
        self.getAccessToken(res.req.query.state, res.req.query.code, function (err, token) {
            if (err) {
                winston.log('error', err);
            } else {
                //TODO send message to usermanagement service that a new accesstoken got generated
                winston.log('info', token);
            }
        });
    });
}

function _setAuthUrl(self) {
    var baseUrl = self.config.auth_url;
    var clientId = '?client_id=' + self.config.client_id;
    var redirect_uri = '&redirect_uri=' + self.config.redirect_uri;
    var fullUrl = baseUrl + clientId + redirect_uri;
    if (self.config.service === 'DROPBOX') {
        fullUrl += '&response_type=code';
    }
    return fullUrl;
}

OAuth2.prototype.getAuthorizationURL = function (userName) {
    var url = this.authUrl + '&state=' + userName;
    return this.authUrl;
};

OAuth2.prototype.getRedirectURI = function () {
    return this.config.redirect_uri;
}

OAuth2.prototype.getRedirectRoute = function () {
    return this.config.redirect_route;
}

OAuth2.prototype.getServiceName = function () {
    return this.config.service;
}

OAuth2.prototype.getAccessToken = function (user, code, callback) {
    var options = {
        method: 'POST',
        uri: this.config.access_token_url,
        encoding: null,
        qs: {
            client_id: this.config.client_id,
            redirect_uri: this.config.redirect_uri,
            client_secret: this.config.client_secret,
            code: code
        },
        json: true
    };
    if (this.config.service === 'DROPBOX') {
        options.qs.grant_type = 'authorization_code';
    }
    request(options, function (err, response, body) {
        if (err) {
            winston.log('error', 'application error: ', err);
            return callback(err);
        }
        if (response.statusCode >= 400 && response.statusCode <= 499) {
            winston.log('error', 'http error: ', err);
            return callback(new Error(response.statusCode + ': ' + response.statusMessage));
        }
        winston.log('info', 'succesfully got request token: %s for user %s', body.access_token, user);
        return callback(null, body.access_token);
    });
}


module.exports = OAuth2;