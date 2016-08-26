/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    db = require('../db/db'),
    grpc = require('grpc');


function init(){

    var proto = grpc.load('./proto/teammanagement.proto').teamManagement;
    var url='localhost:50055';
    console.log(url);
    client = new proto.TeamManagement(url,
        grpc.credentials.createInsecure());
    db.connect(10,'mongodb://127.0.0.1/secoTeam');
}

var client = {};

describe('TeamManagement', function () {
    before(function() {
        init();
    });
    after(function() {
        db.deleteTeam('test1',function(err,isRemoved){
            if(err){
                throw err;
            }
        });
    });
    describe('create Team', function () {
        it('creates a new Team', function (done) {
            client.create({
                teamCreator: 'user1',
                teamName: 'test1',
                password: '123456'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.status, 'created');
                done();
            });
        });
        it('creates team with to short teamname', function (done) {
            client.create({
                teamCreator: 'user1',
                teamName: 'tes',
                password: '123456'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.err, 'teamname has to be at least 4 characters');
                done();
            });
        });
    });/*
    describe('login', function () {
        it('perform a login with username and password', function (done) {
            client.login({
                name: 'test1',
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
});