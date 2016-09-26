/**
 * Created by PhilippMac on 19.07.16.
 */
/**
 * Created by phili on 18.07.2016.
 */
var ParamChecker = require('./../utility/paramChecker'),
    grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf');

module.exports = (function () {
    'use strict';
    var router = require('express').Router(),
        paramChecker = new ParamChecker();

    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'userservice grpc url: %s', url);
    var proto = grpc.load('./proto/userManagement.proto').userManagement;
    self.client = new proto.UserManagement(url,
        grpc.credentials.createInsecure());

    router.get('/user/register', function (req, res) {
        if (!paramChecker.containsParameter(['username', 'password'], req, res)) {
            return;
        }
        self.client.register({
            name: req.query.username,
            password: req.query.password
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error','couldnt register user: ',req.query.username);
                    return res.json(response.err);
                } else {
                    winston.log('info','successfully registered user: ',req.query.username);
                    return res.json(response.status);
                }
            }
        });
    });

    router.get('/user/login', function (req, res) {
        if (!paramChecker.containsParameter(['username', 'password'], req, res)) {
            return;
        }
        self.client.register({
            name: req.query.username,
            password: req.query.password
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error','couldnt login user: ',req.query.username);
                    return res.json(response.err);
                } else {
                    winston.log('info','successful login for user: ',req.query.username);
                    return res.json(response.status);
                }
            }
        });
    });
    return router;
})();

function _offlineError(res) {
    winston.log('error','usermanagement service offline');
    return res.status(504).send('User Management service offline');
}