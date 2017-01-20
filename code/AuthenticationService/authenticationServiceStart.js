/**
 * Created by PhilippMac on 02.09.16.
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
var express = require('express'),
    app = express(),
    fs = require('fs'),
    https = require('https'),
    cors = require('cors'),
    winston = require('winston'),
    nconf = require('nconf'),
    expressListRoutes = require('express-list-routes'),
    OAuth2 = require('./oauth2/basicOauth2'),
    server = require('./grpc/server');


var services;
var servicesPath;
var router = express.Router();

function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});

    servicesPath = './oauth2/services';
    services = fs.readdirSync(servicesPath);
    app.use(cors());

    winston.log('info', 'Authentication service init succesful');
}

function main() {
    init();

    app.get('/', function (req, res) {
        res.send('i am running');
    });

/*
    app.listen(nconf.get('httpPort'), function () {
        winston.log('info', 'authentication service http server listening on port %d!', nconf.get('httpPort'));
    });*/

    https.createServer({
        key: fs.readFileSync('privkey.pem'),
        cert: fs.readFileSync('fullchain.pem'),
        ca: fs.readFileSync('chain.pem')
    }, app).listen(nconf.get('httpPort'));
    winston.log('info', 'authentication service http server listening on port %d!', nconf.get('httpPort'));

    var oauth2Services = [];

    for (var i = 0; i < services.length; i++) {
        var oauth2 = new OAuth2(app,router, servicesPath + '/' + services[i], function (err) {
            if (err) {
                winston.log('error', err);
            }
        });
        oauth2Services.push(oauth2);
    }

    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'), oauth2Services);
    server.start();

    setTimeout(printRoutes,3000);
}


function printRoutes() {
    console.log('print routes');
    expressListRoutes({prefix: ''}, '/:', router);
}


main();




