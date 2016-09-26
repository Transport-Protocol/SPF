'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    express = require('express'),
    router = express.Router(),
    paramChecker = new ParamChecker(),
    url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
winston.log('info', 'userservice grpc url: %s', url);

var proto = grpc.load('./proto/userManagement.proto').userManagement;
var client = new proto.UserManagement(url,
    grpc.credentials.createInsecure());


router.get('/user/register', function (req, res) {
    if (!paramChecker.containsParameter(['username', 'password'], req, res)) {
        return;
    }
    client.register({
        name: req.query.username,
        password: req.query.password
    }, function (err, response) {
        if (err) {
            _offlineError(res);
        } else {
            if (response.err) {
                winston.log('error', 'couldnt register user: ', req.query.username);
                return res.json(response.err);
            } else {
                winston.log('info', 'successfully registered user: ', req.query.username);
                return res.json(response.status);
            }
        }
    });
});

router.get('/user/login', function (req, res) {
    if (!paramChecker.containsParameter(['username', 'password'], req, res)) {
        return;
    }
    client.login({
        name: req.query.username,
        password: req.query.password
    }, function (err, response) {
        if (err) {
            _offlineError(res);
        } else {
            if (response.err) {
                winston.log('error', 'couldnt login user: ', req.query.username);
                return res.json(response.err);
            } else {
                if(!response.loginSuccessful){
                    winston.log('info', 'wrong login from user: ', req.query.username);
                    return res.json(response.status);
                } else {
                    winston.log('info', 'successful login for user: ', req.query.username);
                    res.cookie('sessionId',response.sessionId);
                    return res.json(response.status);
                }
            }
        }
    });
});

module.exports = router;


function _offlineError(res) {
    winston.log('error', 'usermanagement service offline');
    return res.status(504).send('User Management service offline');
}