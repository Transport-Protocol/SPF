/**
 * Created by PhilippMac on 19.07.16.
 */
/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');
var HeaderChecker = require('./../utility/headerChecker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();
    var paramChecker = new ParamChecker();
    var headerChecker = new HeaderChecker();

    router.get('/channels', function (req, res) {
        if(!headerChecker.containsParameter(['oauth2token'],req,res)){
            return;
        }
        res.json({message: 'slack list channels TODO'});
    });

    router.get('/:channel/message', function (req, res) {
        if(!headerChecker.containsParameter(['oauth2token'],req,res)){
            return;
        }
        if(!paramChecker.containsParameter(['msg'],req,res)){
            return;
        }
        res.json({message: 'slack send chat msg TODO'});
    });
    return router;
})();
