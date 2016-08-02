/**
 * Created by phili on 18.07.2016.
 */
'use strict';

var error = require('../errorCodes'),
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker');

module.exports = (function () {
    var router = require('express').Router(),
        paramChecker = new ParamChecker(),
        headerChecker = new HeaderChecker();

    router.get('/file', function (req, res) {
        if (!paramChecker.containsParameter(['path'], req, res)) {
            return;
        }
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        res.json({message: 'Dropbox file TODO'});
    });

    router.get('/filetree', function (req, res) {
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        res.json({message: 'Dropbox fileTree TODO'});
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        if (!paramChecker.containsParameter(['path'], req, res)) {
            return;
        }
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        res.send('Dropbox File uploaded! TODO');
    });
    return router;
})();
