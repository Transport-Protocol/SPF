/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    //assert = require('chai').assert,
    grpc = require('grpc');


function init(){

    var proto = grpc.load('../proto/authService.proto').authService;
    var url='localhost:50061';
    console.log(url);
    client = new proto.AuthService(url,
        grpc.credentials.createInsecure());
}

var client = {};

describe('Auth Service', function () {
    before(function() {
        init();
    });
    describe('getAuthUrl', function () {
        it('builds the auth url for github to authenticate', function (done) {
            client.getAuthorizationUrl({
                service: 'GITHUB',
                username: 'philipp'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.url).not.to.be.a('null');
                console.log(response.url);
                done();
            });
        });
        it('builds the auth url for dropbox to authenticate', function (done) {
            client.getAuthorizationUrl({
                service: 'DROPBOX',
                username: 'philipp'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.url).not.to.be.a('null');
                console.log(response.url);
                done();
            });
        });
        it('builds the auth url for bitbucket to authenticate', function (done) {
            client.getAuthorizationUrl({
                service: 'BITBUCKET',
                username: 'philipp'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.url).not.to.be.a('null');
                console.log(response.url);
                done();
            });
        });
        it('refreshes the access_token', function (done) {
            client.refreshAccessToken({
                service: 'BITBUCKET',
                refresh_token: 'zRJyesfWwkS5Z5BkWc'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.access_token).not.to.be.a('null');
                console.log(response.access_token);
                done();
            });
        });
    });
});