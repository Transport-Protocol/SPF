'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    google = require("../google");


var access_token = {};

function init(){
    access_token = 'ya29.Gl2tA7SAgH9fr8OljQHZCSXWkQwhZlzUOif7hKraQQH1c8txCbHiMhLhvLs6pEkrgTeGkZ4jQnoh8VIv_k2w6sRXi6Mw5-mbdj_nO1ImAuK6po1dOKFG3v7VI9Hj8Xs';
}


describe('Google', function () {
    before (function(){
        init();
    });
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            this.timeout(10000);
            google.getFileTree(access_token, 'test1', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                done();
            });
        });
    });
    /*
    describe('Path to file', function () {
        it('returns file contents as buffer and filename specified by path', function (done) {
            this.timeout(10000);
            google.getFile(access_token, 'test1/unterordner1/awsCommands.txt', function (err, fileName, buffer) {
                expect(err).to.be.a('null');
                assert.equal(fileName, 'awsCommands.txt');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });
    describe('Upload file to path', function () {
        it('uploads file to path and returns status', function (done) {
            this.timeout(10000);
            fs.readFile("./test.pdf", function (err, data) {
                expect(err).to.be.a('null');
                google.uploadFile(access_token, 'test1', data, 'test5.pdf', function (err, msg) {
                    expect(err).to.be.a('null');
                    assert.equal(msg, 'upload succesful');
                    done();
                });
            });
        });
    });*/
});