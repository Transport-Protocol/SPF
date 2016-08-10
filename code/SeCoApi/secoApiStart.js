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

//my modules
var dropbox = require('./routes/dropbox'),
    owncloud = require('./routes/owncloudParsed'),
    github = require('./routes/github'),
    googleDrive = require('./routes/googleDrive'),
    bitbucket = require('./routes/bitbucket'),
    slack = require('./routes/slack');

function registerRoutes() {
    app.use('/api', router);
    app.use('/api/dropbox', dropbox);
    app.use('/api', owncloud);
    app.use('/api/googledrive', googleDrive);
    app.use('/api/github', github);
    app.use('/api/bitbucket', bitbucket);
    app.use('/api/slack', slack);
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
}

function newRequest(req, res, next) {
    winston.log('info', '***new request***');
    next(); // make sure we go to the next routes and don't stop here
}

function notFound(req, res, next) {
    winston.log('info', 'route not found');
    res.status(404).send('not found');
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