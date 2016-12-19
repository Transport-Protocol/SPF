/**
 * Created by PhilippMac on 02.09.16.
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
var express = require('express'),
    app = express(),
    fs = require('fs'),
    winston = require('winston'),
    nconf = require('nconf'),
    OAuth2 = require('./oauth2/basicOauth2'),
    server = require('./grpc/server');


var services;
var servicesPath;

function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});

    servicesPath = './oauth2/services';
    services = fs.readdirSync(servicesPath);

    winston.log('info', 'Authentication service init succesful');
}

function main() {
    init();

    app.get('/', function (req, res) {
        res.send('i am running');
    });

    app.listen(nconf.get('httpPort'), function () {
        winston.log('info', 'authentication service http server listening on port %d!', nconf.get('httpPort'));
    });

    var oauth2Services = [];

    for (var i = 0; i < services.length; i++) {
        var oauth2 = new OAuth2(app, servicesPath + '/' + services[i], function (err) {
            if (err) {
                winston.log('error', err);
            }
        });
        oauth2Services.push(oauth2);
    }

    server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'), oauth2Services);
    server.start();
}

main();




