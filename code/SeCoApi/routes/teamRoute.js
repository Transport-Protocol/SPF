'use strict';

var ParamChecker = require('./../utility/paramChecker'),
    grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf');



function TeamRoute(){
    this.paramChecker = new ParamChecker();
    var url = nconf.get('teamServiceIp') + ':' + nconf.get('teamServicePort');
    winston.log('info', 'teamservice grpc url: %s', url);
    var proto = grpc.load('./proto/teamManagement.proto').teamManagement;
    this.client = new proto.TeamManagement(url,
        grpc.credentials.createInsecure());
}

TeamRoute.prototype.route = function (router){
    var self = this;
    router.post('/team/create', function (req, res) {
        if (!self.paramChecker.containsParameter(['teamName', 'password','teamCreator'], req, res)) {
            return;
        }
        self.client.create({
            teamName: req.query.teamName,
            password: req.query.password,
            teamCreator: req.query.teamCreator
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt create team: ', req.query.teamName);
                    return res.json(response.err);
                } else {
                    winston.log('info', 'successfully created team: ', req.query.teamName);
                    return res.json(response.status);
                }
            }
        });
    });

    router.post('/team/join', function (req, res) {
        if (!self.paramChecker.containsParameter(['teamName', 'password','userName'], req, res)) {
            return;
        }
        self.client.create({
            teamName: req.query.teamName,
            password: req.query.password,
            userName: req.query.userName
        }, function (err, response) {
            if (err) {
                _offlineError(res);
            } else {
                if (response.err) {
                    winston.log('error', 'couldnt join team: ', req.query.teamName);
                    return res.json(response.err);
                } else {
                    winston.log('info', 'successfully joined team: ', req.query.teamName);
                    return res.json(response.status);
                }
            }
        });
    });

    return router;
}



module.exports = TeamRoute;


function _offlineError(res) {
    winston.log('error', 'Team Management service offline');
    return res.status(504).send('Team Management service offline');
}