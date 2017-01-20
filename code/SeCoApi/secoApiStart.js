/**
 * Created by phili on 18.07.2016.
 * Service Composition API with http interface
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
var express = require('express'),
    https = require('https'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    cors = require('cors'),
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
var OwncloudRoute = require('./routes/owncloudRoute');
var DropboxRoute = require('./routes/dropboxRoute');
var GoogleRoute = require('./routes/googleRoute');
var AbstractFsRoute = require('./routes/abstractFsRoute');


function registerRoutes() {
    //app.use('/api', new CustomRoute('./json/dropboxRoutes.json', 'fileStorage.proto').route(router));
    //app.use('/api', new CustomRoute('./json/owncloudRoutes.json', 'fileStorage.proto').route(router));
    // app.use('/api', new CustomRoute('./json/googleDriveRoutes.json', 'fileStorage.proto').route(router));
    //app.use('/api', new CustomRoute('./json/seCoFileStorage.json', 'seCoFileStorage.proto').route(router));
    app.use('/api', new CustomRoute('./json/githubRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/bitBucketRoutes.json', 'versionControl.proto').route(router));
    app.use('/api', new CustomRoute('./json/slackRoutes.json', 'slackMessaging.proto').route(router));
    app.use('/api', new UserRoute().route(router));
    app.use('/api', new TeamRoute().route(router));
    app.use('/api', new AuthRoute().route(router));
    app.use('/api', new OwncloudRoute('./json/owncloudRoutes.json').route(router));
    app.use('/api', new DropboxRoute('./json/dropboxRoutes.json').route(router));
    app.use('/api', new GoogleRoute('./json/googleDriveRoutes.json').route(router));
    app.use('/api', new AbstractFsRoute('./json/seCoFileStorage.json').route(router));
}

//global vars
var app;

function init() {
    process.env.LOG_LEVEL = 'info';
    winston.level = process.env.LOG_LEVEL;
    app = express();
    //app.use(bodyParser.json());
    app.use(cookieParser());
    //reading multipart fileupload
    //app.use(fileUpload());
    app.use(cors());
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
    //skip for user routes,except auth list
    if (req.url.indexOf('api/user') !== -1 && req.url.indexOf('/user/auth/list') === -1) {
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
    //app.listen(nconf.get('httpPort'));

    https.createServer({
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem'),
        ca: fs.readFileSync('chain.pem'),
        requestCert: true
    }, app).listen(nconf.get('httpPort'));
    // handles your app
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
