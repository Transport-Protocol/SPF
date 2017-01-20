'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    nconf = require('nconf'),
    fsConnector = require('../fsConnector');

function init() {
    nconf.file({file: './config/config.json'});
    fsConnector.init();
}


describe('FileStorage Service', function () {
    before(function () {
        init();
    });/*
    describe('uploadFile', function () {
        it('uploads pdf file to dropbox as generic filestorage service', function (done) {
            this.timeout(10000);
            fs.readFile('./Projektplan.pdf', function read(err, data) {
                if (err) {
                    throw err;
                }
                fsConnector.uploadFile('philipp2', 'team2', 'GOOGLE', '/', 'Projektplan2.pdf', data, function (err) {
                    expect(err).to.be.a('null');
                    done();
                });
            });
        });
    });*/
    describe('getFile', function () {
        it('returns file from fsStorage service that is uploaded at dropbox', function (done) {
            this.timeout(10000);
            fsConnector.getFile('team2', 'code/Projektplan2.pdf', function (err, fileName,fileBuffer) {
                expect(err).to.be.a('null');
                expect(fileBuffer).to.not.be.a('null');
                assert.equal(fileName, 'Projektplan2.pdf');
                console.log(err);
                done();
            });

        });
    });/*
    describe('getFileTree', function () {
        it('returns directory from fsStorage service specified by path', function (done) {
            this.timeout(10000);
            fsConnector.getFileTree('team2', 'code', function (err, dirs) {
                console.log(dirs);
                expect(err).to.be.a('null');
                assert.equal(dirs.length, 2);
                done();
            });

        });
    });*/
});