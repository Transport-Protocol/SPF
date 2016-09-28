'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    grpc = require('grpc'),
    auth = require('basic-auth'),
    winston = require('winston'),
    nconf = require('nconf');

var client;

function UserRoute(){
    this.paramChecker = new ParamChecker();
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url: %s', url);
    var proto = grpc.load('./proto/userManagement.proto').userManagement;
    client = new proto.UserManagement(url,
        grpc.credentials.createInsecure());
}

UserRoute.prototype.checkSession = function (req,res,next){
    winston.log('info','check if session exists');
    if(req.cookies.sessionId){
        winston.log('info','cookie with sessionId received');
        client.getUsernameBySessionId({
            sessionId: req.cookies.sessionId
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt get username from sessionId', response.err);
                    next();
                } else {
                    winston.log('info', 'successfully got username from sessionId.name: ', response.username);
                    req.session.username = response.username;
                    next();
                }
            }
        });
    } else {
        winston.log('info','no cookie for sessionId received');
        next();
    }
};

UserRoute.prototype.route = function (router) {
    var self = this;

    //REGISTER ROUTE
    router.post('/user/register', function (req, res) {
        var user = auth(req);
        if(typeof user === 'undefined'){
            return res.status(401).send('invalid or missing basic authentication');
        }
        client.register({
            name: user.name,
            password: user.pass
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt register user: ', user.name);
                    return res.json(response.err);
                } else {
                    winston.log('info', 'successfully registered user: ', user.name);
                    return res.json(response.status);
                }
            }
        });
    });

    //LOGIN ROUTE
    router.post('/user/login', function (req, res) {
        var user = auth(req);
        if(typeof user === 'undefined'){
            return res.status(401).send('invalid or missing basic authentication');
        }
        client.login({
            name: user.name,
            password: user.pass
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt login user: ', user.name);
                    return res.json(response.err);
                } else {
                    if (!response.loginSuccessful) {
                        winston.log('info', 'wrong login from user: ', user.name);
                        return res.json(response.status);
                    } else {
                        winston.log('info', 'successful login for user: ', user.name);
                        //res.cookie('sessionId', response.sessionId);
                        return res.json({
                            "status": "ok",
                            "username": req.query.username
                        });
                    }
                }
            }
        });
    });
    return router;
};


module.exports = UserRoute;


function _offlineError(res) {
    winston.log('error', 'usermanagement service offline');
    return res.status(504).send('User Management service offline');
}