/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');
var HeaderChecker = require('./../utility/headerChecker')

module.exports = (function () {
    'use strict';
    var router = require('express').Router();

    router.get('/file', function (req, res) {
        var paramChecker = new ParamChecker(['path']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        var headerChecker = new HeaderChecker(['oauth2token']);
        if(!headerChecker.checkParams(req,res)){
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
        res.send('Dropbox File uploaded! TODO');
    });
    return router;
})();
