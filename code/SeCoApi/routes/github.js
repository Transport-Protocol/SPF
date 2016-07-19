/**
 * Created by PhilippMac on 19.07.16.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();

    router.get('/:user/repos', function (req, res) {
        res.json({message: 'Github list repos for user '+ req.params.user + ' TODO'});
    });

    router.get('/:user/repos/:repo', function (req, res) {
        var user = req.params.user;
        var repoName = req.params.repo;
        res.json({message: 'Github fileTree for user: ' + user + ' and repo: ' + repoName});
    });

    return router;
})();
