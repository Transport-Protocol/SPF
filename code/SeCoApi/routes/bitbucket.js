/**
 * Created by PhilippMac on 19.07.16.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');
var HeaderChecker = require('./../utility/headerChecker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();
    var paramChecker = new ParamChecker();
    var headerChecker = new HeaderChecker();

    router.get('/:user/repos', function (req, res) {
        if(!headerChecker.containsParameter(['oauth2token'],req,res)){
            return;
        }
        res.json({message: 'Github list repos for user '+ req.params.user + ' TODO'});
    });

    router.get('/:user/repos/:repo/filetree', function (req, res) {
        var user = req.params.user;
        var repoName = req.params.repo;
        if(!headerChecker.containsParameter(['oauth2token'],req,res)){
            return;
        }
        res.json({message: 'Github fileTree for user: ' + user + ' and repo: ' + repoName});
    });
    return router;
})();
