/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    db = require('../db/db'),
    grpc = require('grpc');


function init(){

    var proto = grpc.load('./proto/usermanagement.proto').userManagement;
    var url='localhost:50054';
    console.log(url);
    client = new proto.UserManagement(url,
        grpc.credentials.createInsecure());
    db.connect(10,'mongodb://127.0.0.1/secoUser');
}

var client = {};

describe('UserManagement', function () {
    before(function() {
        init();
    });
    after(function() {
        db.deleteUser('test1',function(err,isRemoved){
            if(err){
                throw err;
            }
        });
    });
    describe('registration', function () {
        it('regitsers a new user', function (done) {
            client.register({
                name: 'test1',
                password: '123456'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.status, 'created');
                done();
            });
        });
    });
    describe('login', function () {
        it('checks user and password and tries to log him in', function (done) {
            client.login({
                name: 'test1',
                password: '123456'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.status, 'login successful');
                done();
            });
        });
    });
});