/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    grpc = require('grpc');


function init(){

    var proto = grpc.load('./proto/authService.proto').authService;
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
        it('builds the auth url for users to authenticate', function (done) {
            client.getAuthorizationUrl({
                service: 'GITHUB',
                username: 'philipp'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.url).not.to.be.a('null');
                done();
            });
        });
    });
});