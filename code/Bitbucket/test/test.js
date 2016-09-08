/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    grpc = require('grpc');


function init() {

    var proto = grpc.load('./proto/versionControl.proto').versionControl;
    var url = 'localhost:50071';
    client = new proto.VersionControl(url,
        grpc.credentials.createInsecure());
    auth = {
        type: 'OAUTH2',
        token: 'iiul23GmAVVU0WO1zVC6ExAQobFk__mPlb9BxmWEMGXPZ7FQViT7C8noMT-XEtJI_mtUXJz4aJVhxdp9Zs8='
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
                console.log(response.repos);
                done();
            });
        });
    });

    describe('getRepositoryContent', function () {
        it('lists the repository content specified by path', function (done) {
            client.getRepositoryContent({
                auth: auth,
                path: '/',
                repositoryName: 'ba'
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.dirs.length).to.be.above(2);
                console.log(response.dirs);
                done();
            });
        });
    });
    describe('addUserToRepo', function () {
        it('adds a user to a repository', function (done) {
            client.addUserToRepository({
                auth: auth,
                usernameToAdd: 'philippGoogle',
                repositoryName: 'moba'
            }, function (err, response) {
                expect(err).to.be.a('null');
                assert.equal(response.err, '');
                assert.equal(response.status, 'ok');
                done();
            });
        });
    });
});