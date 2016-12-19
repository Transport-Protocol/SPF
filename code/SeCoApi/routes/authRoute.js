/**
 * Created by PhilippMac on 02.10.16.
 */
'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    RpcJsonResponseBuilder = require('./../utility/rpcJsonResponseBuilder'),
    grpc = require('grpc'),
    auth = require('basic-auth'),
    winston = require('winston'),
    nconf = require('nconf');

var client;
var clientAuth;

function AuthRoute() {
    this.paramChecker = new ParamChecker();
    var url = nconf.get('authServiceIp') + ':' + nconf.get('authServicePort');
    winston.log('info', 'authService grpc url: %s', url);
    var proto = grpc.load('./proto/authService.proto').authService;
    client = new proto.AuthService(url,
        grpc.credentials.createInsecure());

    url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'AUTHROUTE **** userService grpc url: %s', url);
    proto = grpc.load('./proto/authentication.proto').authentication;
    clientAuth = new proto.Authentication(url,
        grpc.credentials.createInsecure());
}


AuthRoute.prototype.route = function (router) {
    var self = this;

    var serviceArray = [
        'DROPBOX', 'GITHUB', 'BITBUCKET', 'GOOGLE', 'SLACK'
    ];

    //setup auth url routes
    for (var i = 0; i < serviceArray.length; i++) {
        _authUrlRoute(serviceArray[i], router);
    }

    router.post('/basicauth', function (req, res) {
        var username = req.username;
        console.log(req.query.token);
        clientAuth.setAuthentication({
            service: req.query.service.toUpperCase(),
            username: username,
            access_token: req.query.token
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt set basicAuth: ', response.err);
                    var jsonResponse = RpcJsonResponseBuilder.buildError(response.err);
                    return res.json(jsonResponse);
                } else {
                    winston.log('info', 'successfully set basic auth: ', response.status);
                    var jsonResponse = RpcJsonResponseBuilder.buildParams(['status'], [response.status]);
                    return res.json(jsonResponse);
                }
            }
        });
    });


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
                    var jsonResponse = RpcJsonResponseBuilder.buildError(response.err);
                    return res.json(jsonResponse);
                } else {
                    winston.log('info', 'successfully got auth url: ', response.url);
                    var jsonResponse = RpcJsonResponseBuilder.buildParams(['url'], [response.url]);
                    return res.json(jsonResponse);
                }
            }
        });
    });
}


module.exports = AuthRoute;


function _offlineError(res) {
    var errMsg = 'auth service offline';
    winston.log('error', errMsg);
    var jsonResponse = RpcJsonResponseBuilder.buildError(errMsg);
    return res.json(jsonResponse);
}