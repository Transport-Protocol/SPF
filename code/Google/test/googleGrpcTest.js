/**
 * Created by PhilippMac on 13.09.16.
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
'use strict';

var expect = require('chai').expect,
    //assert = require('chai').assert,
    grpc = require('grpc');


function init() {

    var proto = grpc.load('../proto/fileStorage.proto').fileStorage;
    var url = 'localhost:50049';
    console.log(url);
    client = new proto.FileStorage(url,
        grpc.credentials.createInsecure());
    auth = {type: 'OAUTH2', token: 'ya29.CjBdA7Jt-PymM9SMY5OpHZci6NlLfPI2a5a4KR76iYewAHp5-JfuNg33K5LU8eKSQBg'};
}

var client = {},
    auth = {};

describe('Google Grpc', function () {
    before(function () {
        init();
    });
    describe('getFile', function () {
        it('returns filecontent specified by path', function (done) {
            this.timeout(10000);
            client.getFile({
                auth: auth,
                path: 'test1/test5.pdf'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.url).not.to.be.a('null');
                done();
            });
        });/*
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
        */
    });
});