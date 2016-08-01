/**
 * Created by PhilippMac on 19.07.16.
 */
var grpc = require('grpc');
var fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;

var error = require('../errorCodes');
var ParamChecker = require('./../utility/paramChecker');
var HeaderChecker = require('./../utility/headerChecker');


module.exports = (function () {
    'use strict';
    var router = require('express').Router();
    var paramChecker = new ParamChecker();
    var headerChecker = new HeaderChecker();
    var client = new fileStorageProto.FileStorage('localhost:50051',
        grpc.credentials.createInsecure());

    router.get('/file', function (req, res) {
        if(!paramChecker.containsParameter(['path'],req,res)){
            return;
        }
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        client.getFile({path: req.query.path,username:req.headers.username,password:req.headers.password}, function(err, response) {
            console.log('Greeting:', response.fileName);
            res.json({fileName : response.fileName,data : response.fileBuffer});
        });
    });

    router.get('/filetree', function (req, res) {
        if(!paramChecker.containsParameter(['path'],req,res)){
            return;
        }
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        client.getFileTree({path: req.query.path,username:req.headers.username,password:req.headers.password}, function(err,response) {
            if(response.err){
                return res.json(response.err);
            }
            return res.json(response.dirs);
        });
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        if(!paramChecker.containsParameter(['path','fileName'],req,res)){
            return;
        }
        if(!headerChecker.containsParameter(['username','password'],req,res)){
            return;
        }
        client.uploadFile({path: req.query.path,username:req.headers.username,password:req.headers.password,fileBuffer: req.files.file.data,fileName: req.query.fileName}, function(err,response) {
            if(response.err){
                return res.json(response.err);
            }
            return res.json(response.status);
        });
    });
    return router;
})();
