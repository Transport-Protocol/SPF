/**
 * Created by PhilippMac on 19.07.16.
 */
var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');
var HeaderChecker = require('./../utility/headerChecker');
var msgBrokerType = require('./msgBroker/msgBrokerType');
var MsgBroker = require('./msgBroker/msgBroker');

module.exports = (function () {
    'use strict';
    var router = require('express').Router();
    var paramChecker = new ParamChecker();
    var headerChecker = new HeaderChecker();
    var broker = new MsgBroker(msgBrokerType.RABBITMQ,'amqp://localhost',5672);

    router.get('/file', function (req, res) {
        if(!paramChecker.containsParameter(['path'],req,res)){
            return;
        }
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        broker.getFile({queueName:'owncloudQueue'},req.query.path,{username:req.headers.username,password:req.headers.password},function(err,data){
           res.json(data);
        });
    });

    router.get('/filetree', function (req, res) {
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        res.json({message: 'Owncloud fileTree TODO'});
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        if(!paramChecker.containsParameter(['path'],req,res)){
            return;
        }
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        console.log(req.files);
        res.send('Owncloud File uploaded! TODO');
    });
    return router;
})();
