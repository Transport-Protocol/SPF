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
    this.config = JSON.parse(fs.readFileSync(jsonConfigFilePath));
    this.paramChecker = new ParamChecker();
    this.headerChecker = new HeaderChecker();
    this.client = {};

    _initGRPC(this);
}

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
            var json = createGrpcJsonArgs(req, requestArray[requestID]['grpc_function_paramater']);
            console.log(json);
            self.client[requestArray[requestID]['grpc_function']](json, function (err, response) {
                if (err) {
                    offlineError(res);
                } else {
                    if (response.err) {
                        return res.json(response.err);
                    }
                    var result = response[requestArray[requestID]['response_parameter']];
                    winston.log('info', 'RPC Method uploadFile succesful.Status: ', result);
                    return res.json(result);
                }
            });
        });
    }
    return router;
}



function createGrpcJsonArgs(req, params) {
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

function offlineError(res) {
    res.status(504).send(this.config['service_name'] + 'connector offline');
}


module.exports = CustomRoute;