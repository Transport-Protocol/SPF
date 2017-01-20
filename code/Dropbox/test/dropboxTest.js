'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    dropbox = require("../dropbox");

describe('Dropbox', function () {
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            this.timeout(10000);
            dropbox.getFileTree('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', '', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                console.log(dirs);
                done();
            });
        });
    });
    xdescribe('Path to file', function () {
        it('returns file contents as buffer and filename specified by path', function (done) {
            this.timeout(10000);
            dropbox.getFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', 'BA/Gliederung.pdf', function (err, fileName, buffer) {
                expect(err).to.be.a('null');
                assert.equal(fileName, 'Gliederung.pdf');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });
    xdescribe('Upload file to path', function () {
        it('uploads file to path and returns status', function (done) {
            this.timeout(10000);
            var fs = require('fs');
            fs.readFile("./test/test.pdf", function (err, data) {
                expect(err).to.be.a('null');
                dropbox.uploadFile('8pFZZrjCIREAAAAAAABz-8Num_Z274v4hmJzxtqNLmTAtXsSS_mac1FXszTyUqY7', 'BA-Philipp', data, 'test5.pdf', function (err, msg) {
                    expect(err).to.be.a('null');
                    assert.equal(msg, 'upload succesful');
                    done();
                });
            });
        });
    });
});