/**
 * Created by PhilippMac on 02.10.16.
 */
'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    grpc = require('grpc'),
    auth = require('basic-auth'),
    winston = require('winston'),
    nconf = require('nconf');

var client;

function AuthRoute() {
    this.paramChecker = new ParamChecker();
    var url = nconf.get('authServiceIp') + ':' + nconf.get('authServicePort');
    winston.log('info', 'authService grpc url: %s', url);
    var proto = grpc.load('./proto/authService.proto').authService;
    client = new proto.AuthService(url,
        grpc.credentials.createInsecure());
}


AuthRoute.prototype.route = function (router) {
    var self = this;

    var serviceArray = [
        'DROPBOX', 'OWNCLOUD', 'GITHUB', 'BITBUCKET', 'GOOGLE', 'SLACK'
    ];

    //setup auth url routes
    for (var i = 0; i < serviceArray.length; i++) {
        _authUrlRoute(serviceArray[i], router);
    }

    return router;
};

function _authUrlRoute(serviceName, router) {
    //REGISTER ROUTE
    router.get('/auth/' + serviceName.toLowerCase() + '/authUrl', function (req, res) {
        var userName = req.username;
        client.getAuthorizationUrl({
            username: userName,
            service: serviceName
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt get auth url: ', response.err);
                    return res.json(response.err);
                } else {
                    winston.log('info', 'successfully got auth url: ', response.url);
                    return res.json({
                        url: response.url
                    });
                }
            }
        });
    });
}


module.exports = AuthRoute;


function _offlineError(res) {
    winston.log('error', 'auth service offline');
    return res.status(504).send('auth service offline');
}