/**
 * Created by PhilippMac on 11.01.17.
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
'use strict';

var expect = require('chai').expect,
    //assert = require('chai').assert,
    grpc = require('grpc');


function init() {

    var proto = grpc.load('../proto/fileStorage.proto').fileStorage;
    var url = 'localhost:50051';
    console.log(url);
    client = new proto.FileStorage(url,
        grpc.credentials.createInsecure());
    auth = {type: 'BASIC', token: 'Basic YWJpNTE1OkluamVjdGlvbjE='};
}

var client = {},
    auth = {};

describe('Owncloud Grpc', function () {
    before(function () {
        init();
    });
    describe('getFile', function () {
        it('returns filecontent specified by path', function (done) {
            this.timeout(10000);



            var call = client.getFile();

            call.write({

            });

            call.on('data', function (getFileReply) {
                console.log('got data',getFileReply.chunks);
            });
            call.on('end', function () {
                console.log('end');
            });
        });
        /*
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