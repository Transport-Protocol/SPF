/**
 * Created by Philipp on 10.08.2016.
 */
'use strict';


var grpc = require('grpc'),
    winston = require('winston'),
    fs = require('fs'),
    express = require('express'),
    nconf = require('nconf'),
    HashMap = require('hashmap'),
    fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage,
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker');



function CustomRoute(jsonConfigFilePath) {
    self = this;
    this.config = JSON.parse(fs.readFileSync(jsonConfigFilePath));
    this.paramChecker = new ParamChecker();
    this.headerChecker = new HeaderChecker();
    this.client = {};

    _initGRPC(this);
}

var self = {};

function _initGRPC(self){
    var url = self.config['grpc_ip'] + ':' + self.config['grpc_port'];
    self.client = new fileStorageProto.FileStorage(url,
        grpc.credentials.createInsecure());
}


CustomRoute.prototype.route = function (){
    var router = express.Router();
    var self = this;
    var requestArray = this.config['requests'];
    var requestMap = new HashMap();
    for(var j in requestArray){
        requestMap.set(requestArray[j]['route'],j);
    }
    for (var i in requestArray) {
        router[requestArray[i]['http-method']](requestArray[i]['route'], function (req, res) {
            var requestID = requestMap.get(req.route.path);
            if (!self.paramChecker.containsParameter(requestArray[requestID]['query_parameter'], req, res)) {
                return;
            }
            if (!self.headerChecker.containsParameter(requestArray[requestID]['header_parameter'], req, res)) {
                return;
            }
            var json = createGrpcJsonArgs(req, requestArray[requestID]['grpc_function_paramater'],res);
            console.log(json);
            self.client[requestArray[requestID]['grpc_function']](json, function (err, response) {
                if (err) {
                    offlineError(res);
                } else {
                    if (response.err) {
                        return res.json(response.err);
                    }
                    var result = createHttpJsonResult(requestArray[requestID]['response_parameter'],response);
                    winston.log('info', 'RPC Method %s succesful.', requestArray[requestID]['grpc_function']);
                    return res.json(result);
                }
            });
        });
    }
    return router;
}

function createHttpJsonResult(params,grpcResponse){
    var result = {};
    var noJson = false;
    for(var i in params){
        try{
            result[params[i]] = JSON.parse(grpcResponse[params[i]]);
        } catch(e) {
            result[params[i]] = grpcResponse[params[i]];
            noJson = true;
        }
    }
    if(noJson){
        winston.log('error', 'connector %s responded without json', self.config['service_name']);
    }
    return result;
}

function createGrpcJsonArgs(req, params,res) {
    var resultAsObj = {};
    for (var i in params) {
        var param = params[i];
        if (req.headers.hasOwnProperty(param)) {
            resultAsObj[param] = req.headers[param];
        } else if (req.query.hasOwnProperty(param)) {
            resultAsObj[param] = req.query[param];
        }
        if (param === 'fileName') {
            resultAsObj[param] = req.files.file.name;
        }
        if (param === 'fileBuffer') {
            resultAsObj[param] = req.files.file.data;
        }
    }
    return resultAsObj;
}

function noFileUploadedError(res){
    res.status(400).send("no uploaded file found under 'file'");
}

function offlineError(res) {
    res.status(504).send(self.config['service_name'] + 'connector offline');
}


module.exports = CustomRoute;