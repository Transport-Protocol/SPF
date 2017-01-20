'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    owncloud = require("../owncloud");

describe('Owncloud', function () {
    /*
    describe('create folder', function () {
        it("creates a folder", function (done) {
            owncloud.createFolder('abi515', 'Injection1', 'tmp2', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.have.length.above(5);
                console.log(dirs);
                done();
            });
        });
    });*/
    describe('Path to directory content', function () {
        it("returns all directories in specified path", function (done) {
            owncloud.getFileTree('abi515', 'Injection1', '/', function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.have.length.above(5);
                console.log(dirs);
                done();
            });
        });
    });/*
    describe('Path to file', function () {
        it('returns file contents as buffer and filename specified by path', function (done) {
            this.timeout(100000);
            owncloud.getFile('abi515', 'Injection1', 'gdx-setup.jar', function (err, fileName, buffer) {
                expect(err).to.be.a('null');
                assert.equal(fileName, 'gdx-setup.jar');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });/*
    describe('Upload file to path', function () {
        it('uploads file to path and returns status', function (done) {
            this.timeout(10000);
            var fs = require('fs');
            fs.readFile('../slack.png', function (err, data) {
                expect(err).to.be.a('null');
                owncloud.uploadFile('abi515', 'Injection1', 'tmp4/BA-Philipp', data, 'slack.png', function (err, msg) {
                    expect(err).to.be.a('null');
                    assert.equal(msg, 'upload succesful');
                    done();
                });
            });
        });
    });*/
});