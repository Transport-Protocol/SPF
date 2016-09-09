'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    google = require("../google");

describe('Google', function () {
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            google.getFileTree('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', '', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                console.log(dirs);
                done();
            });
        });
    });
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
    });
});