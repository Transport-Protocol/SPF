/**
 * Created by phili on 18.07.2016.
 * Service Composition API with http interface
 */
var express = require('express'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    winston = require('winston'),
    fs = require('fs'),
    expressListRoutes = require('express-list-routes'),
    nconf = require('nconf'),
    secoBasicAuth = require('./utility/secoBasicAuth');

nconf.argv()
    .env()
    .file({file: './config/config.json'});

var router = express.Router();

var CustomRoute = require('./routes/customRoute');
var UserRoute = require('./routes/userRoute');
var TeamRoute = require('./routes/teamRoute');
var AuthRoute = require('./routes/authRoute');


function registerRoutes() {
    app.use('/api', new CustomRoute('./json/dropboxRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/owncloudRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/githubRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/googleDriveRoutes.json', 'fileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/bitBucketRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/slackRoutes.json', 'slackMessaging.proto').route(router));
    app.use('/api', new CustomRoute('./json/seCoFileStorage.json', 'fileStorage.proto').route(router));
    app.use('/api', new UserRoute().route(router));
    app.use('/api', new TeamRoute().route(router));
    app.use('/api', new AuthRoute().route(router));
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
    //app.use(session({secret: 'mySpecialSecret'}));
    router = express.Router();
    app.use(newRequest);
    app.use(basicAuth);
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

function basicAuth(req, res, next) {
    //skip for user routes
    if (req.url.indexOf('api/user') !== -1) {
        next();
    } else {
        secoBasicAuth.verifyBasicAuth(req, function (err, authenticated, username) {
            if (err) {
                winston.log('error', 'couldnt authenticate at SeCo Api', err);
                res.status(401).send(err.message);
            } else {
                if (!authenticated) {
                    winston.log('info', 'username or password wrong');
                    res.status(401).send('not authenticated at SeCo Api');
                } else {
                    winston.log('info', 'authenticated user %s at SeCo Api', username);
                    req.username = username;
                    next();
                }
            }
        });
    }
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

function printRoutes() {
    expressListRoutes({prefix: '/api'}, 'API:', router);
}


main();