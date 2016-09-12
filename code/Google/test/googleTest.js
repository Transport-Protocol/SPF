'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    google = require("../google");


var access_token = {};

function init(){
    access_token = 'ya29.CjBcA0h4dnTFrHY6pkBV9H_bInXT1Tlgm0zfvKk4KaDM0HaMrmPcWIHa7ng1y8N_2FM';
}


describe('Google', function () {
    before (function(){
        init();
    })/*
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            google.getFileTree(access_token, '', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                console.log(dirs);
                done();
            });
        });
    });*/
    describe('Path to file', function () {
        it('returns file contents as buffer and filename specified by path', function (done) {
            google.getFile(access_token, 'test1/unterordner1/Unbenanntes Dokument', function (err, fileName, buffer) {
                console.log(err);
                console.log(buffer);
                expect(err).to.be.a('null');
                assert.equal(fileName, 'awsCommands.txt');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });/*
    describe('Upload file to path', function () {
        it('uploads file to path and returns status', function (done) {
            var fs = require('fs');
            fs.readFile("./test/test.pdf", function (err, data) {
                expect(err).to.be.a('null');
                google.uploadFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', 'BA-Philipp', data, 'test5.pdf', function (err, msg) {
                    expect(err).to.be.a('null');
                    assert.equal(msg, 'upload succesful');
                    done();
                });
            });
        });
    });*/
});