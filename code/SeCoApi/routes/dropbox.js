/**
 * Created by phili on 18.07.2016.
 */
'use strict';

var grpc = require('grpc'),
    winston = require('winston'),
    nconf = require('nconf'),
    fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;

var error = require('../errorCodes'),
    ParamChecker = require('./../utility/paramChecker'),
    HeaderChecker = require('./../utility/headerChecker');

module.exports = (function () {
    var router = require('express').Router(),
        paramChecker = new ParamChecker(),
        headerChecker = new HeaderChecker(),
        url = nconf.get('dropboxGrpcServerIp') + ':' + nconf.get('dropboxGrpcServerPort'),
        client = new fileStorageProto.FileStorage(url,
            grpc.credentials.createInsecure());

    router.get('/file', function (req, res) {
        if (!paramChecker.containsParameter(['path'], req, res)) {
            return;
        }
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        //grpc method performed on server
        client.getFile({
            path: req.query.path,
            token: req.headers.oauth2token
        }, function (err, response) {
            if (err) {
                offlineError(res);
            } else {
                if (response.err) {
                    return res.json(response.err);
                }
                winston.log('info', 'RPC Method getFile succesful.Got file: ', response.fileName);
                res.json({fileName: response.fileName, data: response.fileBuffer});
            }
        });
    });

    router.get('/filetree', function (req, res) {
        if (!paramChecker.containsParameter(['path'], req, res)) {
            return;
        }
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        //grpc method performed on server
        client.getFileTree({
            path: req.query.path,
            token: req.headers.oauth2token
        }, function (err, response) {
            if (err) {
                offlineError(res);
            } else {
                if (response.err) {
                    return res.json(response.err);
                }
                winston.log('info', 'RPC Method getFileTree succesful.Got dirs: ', response.dirs);
                return res.json(response.dirs);
            }
        });
    });

    router.post('/upload', function (req, res) {
        if (!req.files) {
            res.send({route: req.baseUrl, error: error.missingFile, errorMessage: 'missing file'});
            return;
        }
        if (!paramChecker.containsParameter(['path', 'fileName'], req, res)) {
            return;
        }
        if (!headerChecker.containsParameter(['oauth2token'], req, res)) {
            return;
        }
        //grpc method performed on server
        client.uploadFile({
            path: req.query.path,
            token: req.headers.oauth2token,
            fileBuffer: req.files.file.data,
            fileName: req.query.fileName
        }, function (err, response) {
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
    return router;
})();

function offlineError(res) {
    res.status(504).send("Owncloud connector offline");
}