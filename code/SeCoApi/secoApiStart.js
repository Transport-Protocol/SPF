/**
 * Created by phili on 18.07.2016.
 * Service Composition API with http interface
 */
var express = require('express'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf');

nconf.argv()
    .env()
    .file({file: './config/config.json'});


var CustomRoute = require('./routes/customRoute');


function registerRoutes() {
    app.use('/api', router);
    app.use('/api', new CustomRoute('./json/dropboxRoutes.json', 'fileStorage.proto').route());
    app.use('/api', new CustomRoute('./json/owncloudRoutes.json', 'fileStorage.proto').route());
    app.use('/api', new CustomRoute('./json/githubRoutes.json', 'versionControl.proto').route());
    app.use('/api', new CustomRoute('./json/googleDriveRoutes.json', 'fileStorage.proto').route());
    app.use('/api', new CustomRoute('./json/bitBucketRoutes.json', 'versionControl.proto').route());
}

//global vars
var app;
var router;

function init() {
    process.env.LOG_LEVEL = 'info';
    winston.level = process.env.LOG_LEVEL;
    app = express();
    app.use(bodyParser.json());
    //reading multipart fileupload
    app.use(fileUpload());
    router = express.Router();
    app.use(newRequest);
    registerRoutes();
    app.use(notFound);
}

function newRequest(req, res, next) {
    winston.log('info', '***new request***');
    next(); // make sure we go to the next routes and don't stop here
}

function notFound(req, res, next) {
    winston.log('info', 'route not found');
    res.status(404).send('not found');
}

function login(req,res,next) {

}

function start() {
    // START THE SERVER
    // =============================================================================
    app.listen(nconf.get('httpPort'));
    winston.log('info', 'Api created at port: ', nconf.get('httpPort'));
}

function main() {
    init();
    app.use(notFound); //register as last middleware
    start();
}


main();