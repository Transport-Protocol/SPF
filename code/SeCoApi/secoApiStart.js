/**
 * Created by phili on 18.07.2016.
 * Service Composition API with http interface
 */
var express = require('express'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    winston = require('winston'),
    fs = require('fs'),
    expressListRoutes   = require('express-list-routes'),
    nconf = require('nconf');

nconf.argv()
    .env()
    .file({file: './config/config.json'});

var router = express.Router();

var CustomRoute = require('./routes/customRoute');
var UserRoute = require('./routes/userRoute');
var TeamRoute = require('./routes/teamRoute');




function registerRoutes() {
    app.use('/api', new CustomRoute('./json/dropboxRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/owncloudRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/githubRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/googleDriveRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/bitBucketRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/slackRoutes.json', 'slackMessaging.proto').route(router));
    app.use('/api', new UserRoute().route(router));
    app.use('/api', new TeamRoute().route(router));
}

//global vars
var app;

function init() {
    process.env.LOG_LEVEL = 'info';
    winston.level = process.env.LOG_LEVEL;
    app = express();
    app.use(bodyParser.json());
    app.use(cookieParser());
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

function login(req, res, next) {

}

function start() {
    // START THE SERVER
    // =============================================================================
    app.listen(nconf.get('httpPort'));
    winston.log('info', 'Api created at port: ', nconf.get('httpPort'));
    printRoutes();
}

function main() {
    init();
    app.use(notFound); //register as last middleware
    start();
}

function printRoutes(){
    expressListRoutes({ prefix: '/api' }, 'API:', router );
}


main();