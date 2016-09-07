/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    //assert = require('chai').assert,
    grpc = require('grpc');


function init() {

    var proto = grpc.load('./proto/versionControl.proto').versionControl;
    var url = 'localhost:50071';
    client = new proto.VersionControl(url,
        grpc.credentials.createInsecure());
    auth = {
        type: 'OAUTH2',
        token: 'Lxpdm6cAu1B2NQfSuQmk-jLkkLiUZUQRCZMnJ6iLbCC4UsMkk5yJ6oqezjk34_KSRLUx6eRj5boFRz_pYP4='
    };
}


var auth = {};
var client = {};

describe('Bitbucket', function () {
    before(function () {
        init();
    });
    describe('getRepositories', function () {
        it('retireves all repositories as json array string', function (done) {
            console.log(auth);
            client.getRepositories({
                auth: auth
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.repos.length).to.be.above(2);
                done();
            });
        });
    });
    /*
     describe('getRepositoryContent', function () {
     it('lists the repository content specified by path', function (done) {
     client.getRepositoryContent({
     auth: auth,
     path: 'tests',
     repositoryName: 'libgdx'
     }, function (err, response) {
     expect(err).to.be.a('null');
     expect(response.dirs.length).to.be.above(2);
     done();
     });
     });
     });
     describe('addUserToRepo', function () {
     it('adds a user to a repository', function (done) {
     client.addUserToRepository({
     auth: auth,
     usernameToAdd: 'germanyforwm',
     repositoryName: 'testApi'
     }, function (err, response) {
     expect(err).to.be.a('null');
     assert.equal(response.err,'');
     assert.equal(response.status,'ok');
     done();
     });
     });
     });*/
});