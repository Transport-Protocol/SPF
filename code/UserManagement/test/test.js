/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    assert = require('chai').assert,
    db = require('../db/db'),
    grpc = require('grpc');


function init() {

    var proto = grpc.load('../proto/authentication.proto').authentication;
    var url = 'localhost:50054';
    console.log(url);
    client = new proto.Authentication(url,
        grpc.credentials.createInsecure());
    db.connect(10, 'mongodb://127.0.0.1/secoUser');
}

var client = {};

describe('UserManagement', function () {
    before(function () {
        init();
    });
    after(function () {
        /*db.deleteUser('philipp',function(err,isRemoved){
         if(err){
         throw err;
         }
         });*/
    });
    /*
     describe('registration', function () {
     it('regitsers a new user', function (done) {
     client.register({
     name: 'philipp',
     password: '123456'
     }, function (err, response) {
     expect(err).to.be.a('null');
     assert.equal(response.status, 'created');
     done();
     });
     });
     it('regitser with to short username', function (done) {
     client.register({
     name: 'tes',
     password: '123456'
     }, function (err, response) {
     expect(err).to.be.a('null');
     assert.equal(response.err, 'name has to be at least 4 characters');
     done();
     });
     });
     });
     describe('login', function () {
     it('perform a login with username and password', function (done) {
     client.login({
     name: 'philipp',
     password: '123456'
     }, function (err, response) {
     expect(err).to.be.a('null');
     assert.equal(response.status, 'login successful');
     done();
     });
     });
     it('perform a login with missing parameter', function (done) {
     client.login({
     password: '123456'
     }, function (err, response) {
     expect(err).to.be.a('null');
     assert.equal(response.err, 'missing parameter');
     done();
     });
     });
     });*/
    describe('access token set', function () {
        it('set access token', function (done) {
            this.timeout(10000);
            client.setAuthentication({service:'GOOGLE', username:'philipp', access_token:'ya29.GlzYAy7SlYYMiD-5v5UvJpWo25N0jmxCnVSIXvglssEmgQq8DsuTH4DgjZhNsjCkij50U62ZebcdzIDu55LiEB1Jtf6yAvb_ME1lAmtEK3DPJfZ1e-nj4RhN3oHAUA'}, function (err) {
                expect(err).to.be.a('null');
                done();
            });
        });
    });
 });