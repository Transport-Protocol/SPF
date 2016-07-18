/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();

    router.get('/file', function (req, res) {
        var paramChecker = new ParamChecker(['oauth2Token','path']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        res.json({message: 'Dropbox file TODO'});
    });

    router.get('/fileTree', function (req, res) {
        var paramChecker = new ParamChecker(['oauth2Token']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        res.json({message: 'Dropbox fileTree TODO'});
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        var paramChecker = new ParamChecker(['oauth2Token','path']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        console.log(req.files);
        res.send('File uploaded!');
    });
    return router;
})();
