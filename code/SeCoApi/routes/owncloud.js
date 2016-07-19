/**
 * Created by PhilippMac on 19.07.16.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();

    router.get('/file', function (req, res) {
        var paramChecker = new ParamChecker(['username','password','path']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        res.json({message: 'Owncloud file TODO'});
    });

    router.get('/fileTree', function (req, res) {
        var paramChecker = new ParamChecker(['username','password']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        res.json({message: 'Owncloud fileTree TODO'});
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        var paramChecker = new ParamChecker(['username','password','path']);
        if(!paramChecker.checkParams(req,res)){
            return;
        }
        console.log(req.files);
        res.send('Owncloud File uploaded! TODO');
    });
    return router;
})();
