/**
 * Created by Philipp on 10.08.2016.
 */
'use strict';


var grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage,
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker'),
    fs = require('fs');


module.exports = (function () {
    var config = JSON.parse(fs.readFileSync('./json/owncloudRoutes.json'));
    var url = config['grpc_ip'] + ':' + config['grpc_port'];
    var router = require('express').Router(),
        paramChecker = new ParamChecker(),
        headerChecker = new HeaderChecker(),
        client = new fileStorageProto.FileStorage(url,
            grpc.credentials.createInsecure());
    var requestArray = config['requests'];
    for(var i in requestArray){
        var request = requestArray[i];
        router[request['http-method']](request['route'],function(req,res){
            if (!paramChecker.containsParameter(request['query_parameter'], req, res)) {
                return;
            }
            if (!headerChecker.containsParameter(request['header_parameter'], req, res)) {
                return;
            }
            var json = createGrpcJsonArgs(req,request['grpc_function_paramater']);
            console.log(json);
            client[request['grpc_function']](json, function (err, response) {
                if (err) {
                    offlineError(res);
                } else {
                    if (response.err) {
                        return res.json(response.err);
                    }
                    winston.log('info', 'RPC Method uploadFile succesful.Status: ', response.status);
                    return res.json(response.status);
                }
            });
        });
    }
    return router;
})
();


function createGrpcJsonArgs(req,params){
    var resultAsObj = {};
    for(var i in params){
        var param = params[i];
        if (req.headers.hasOwnProperty(param)) {
            resultAsObj[param] = req.headers[param];
        } else if(req.query.hasOwnProperty(param)){
            resultAsObj[param] = req.query[param];
        }
        if(param === 'fileName'){
            resultAsObj[param] = req.files.file.name;
        }
        if(param === 'fileBuffer'){
            resultAsObj[param] = req.files.file.data;
        }
    }
    return resultAsObj;
}

function offlineError(res) {
    res.status(504).send("Owncloud connector offline");
}
