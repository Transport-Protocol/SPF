/**
 * Created by PhilippMac on 13.09.16.
 */
/**
 * Created by PhilippMac on 25.08.16.
 */
process.chdir(__dirname); //set working directory to path of file that is being executed
'use strict';

var expect = require('chai').expect,
    fs = require('fs'),
    chunk = require('chunk'),
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
        xit('returns filecontent specified by path', function (done) {
            this.timeout(100000);
            var call = client.getFile({
                auth: auth,
                path: 'gdx-setup.jar'
            });
            let fileBuffer = [];
            call.on('data', function(getFileReply){
                console.log('got data');
                if (getFileReply.chunk.length > 0) {
                    for(let i = 0;i<getFileReply.chunk.length;i++){
                        fileBuffer.push(getFileReply.chunk[i]);
                    }
                }
            });
            call.on('end',function() {
                console.log('end');
                var uint8 = new Uint8Array(fileBuffer);
                done();
            });
        });
        it('uploads a file', function (done) {
            this.timeout(30000);
            fs.readFile('../test.pdf', function (err, fileBuffer) {
                var call = client.uploadFile(function (err,response){
                   if(err){
                       console.log('ERROR' + err);
                   } else {
                       console.log(response);
                   }
                });
                var chunkedArray = chunk(fileBuffer, 1000);
                let counter = 0;
                chunkedArray.forEach(function (curChunk) {
                    if(counter === 0){
                        call.write({
                            chunk: curChunk,
                            fileName: 'test.pdf',
                            path: '/',
                            auth: auth
                        });
                    } else {
                        call.write({
                            chunk: curChunk
                        });
                    }
                    counter++;
                });
                call.end();

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