'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    google = require("../google");


var access_token = {};

function init(){
    access_token = 'ya29.GlzYAy7SlYYMiD-5v5UvJpWo25N0jmxCnVSIXvglssEmgQq8DsuTH4DgjZhNsjCkij50U62ZebcdzIDu55LiEB1Jtf6yAvb_ME1lAmtEK3DPJfZ1e-nj4RhN3oHAUA';
}


describe('Google', function () {
    before (function(){
        init();
    });
    /*
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            this.timeout(10000);
            google.createFolder(access_token,'testFolder', 'root', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                done();
            });
        });
    });*/
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            this.timeout(10000);
            google.getFileTree(access_token, '/', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                done();
            });
        });
    });/*

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
            fs.readFile("../test.pdf", function (err, data) {
                expect(err).to.be.a('null');
                google.uploadFile(access_token, 'testFolder5/folderTest/lel1', data, 'test5.pdf', function (err, msg) {
                    expect(err).to.be.a('null');
                    assert.equal(msg, 'upload successful');
                    done();
                });
            });
        });
    });*/
});