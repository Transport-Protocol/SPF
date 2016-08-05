/**
 * Created by PhilippMac on 19.07.16.
 */
'use strict';
var ParamChecker = require('./../utility/paramChecker'),
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
        res.json({message: 'GoogleDrive file TODO'});
    });

    router.get('/filetree', function (req, res) {
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        res.json({message: 'GoogleDrive fileTree TODO'});
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
        console.log(req.files);
        res.send('GoogleDrive File uploaded! TODO');
    });
    return router;
})();
