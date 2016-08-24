/**
 * Created by PhilippMac on 24.08.16.
 */
'use strict';

var winston = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    db = require('./db/db');
//server = require('./grpc/server');


function init() {
    nconf.argv()
        .env()
        .file({file: './config/config.json'});
    winston.log('info', 'Usermanagement service init succesful');
}


function main() {
    init();
    //server.init(nconf.get('grpcServerIp'), nconf.get('grpcServerPort'));
    //server.start();
    db.connect();

    var create = false;

    if (create) {
        db.createUser('hallo1235', 'password123', function (err, user) {
            if (err) {
                console.log(err);
            }
            console.log(user);
            // test a matching password
            user.comparePassword('password123', function (err, isMatch) {
                if (err) throw err;
                console.log('password123:', isMatch); // -&gt; Password123: true
            });
        });
    }
    db.readUser('hallo123', function (err, user) {
        if (err) {
            console.log(err);
        } else {
            console.log(user);
        }
    });

}


main();