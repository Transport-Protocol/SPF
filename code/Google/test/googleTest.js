'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    google = require("../google");


var access_token = {};

function init(){
    access_token = 'ya29.Ci9ZA1ak1_U5YKDos-PngVd0_DHfcvOEW1CFQXhg27ANiDbD0AI9plWV5pPv5UYcoQ';
}


describe('Google', function () {
    before (function(){
        init();
    });
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            google.getFileTree(access_token, '', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                console.log(dirs);
                done();
            });
        });
    });/*
    describe('Path to file', function () {
        it('returns file contents as buffer and filename specified by path', function (done) {
            google.getFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', 'BA/Gliederung.pdf', function (err, fileName, buffer) {
                expect(err).to.be.a('null');
                assert.equal(fileName, 'Gliederung.pdf');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });
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