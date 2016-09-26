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
    });
    describe('join', function () {
        it('user joins team', function (done) {
            client.join({
                teamName: 'test1',
                password: '123456',
                userName: 'sadasdad'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.status, 'joined');
                done();
            });
        });
        it('fails joining team because of wrong password', function (done) {
            client.join({
                teamName: 'test1',
                password: '1234567',
                userName: 'sadasdad'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.err, 'wrong password');
                done();
            });
        });
    });
});