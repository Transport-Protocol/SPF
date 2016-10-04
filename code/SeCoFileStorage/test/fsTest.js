'use strict';

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
    });
    describe('uploadFile', function () {
        it('uploads pdf file to dropbox as generic filestorage service', function (done) {
            this.timeout(10000);
            fs.readFile('./Projektplan.pdf', function read(err, data) {
                if (err) {
                    throw err;
                }
                fsConnector.uploadFile('test1', 'team2', 'DROPBOX', 'code/pdf/plan', 'Projektplan2.pdf', data, function (err) {
                    expect(err).to.be.a('null');
                    done();
                });
            });
        });
    });
    describe('getFile', function () {
        it('returns file from fsStorage service that is uploaded at dropbox', function (done) {
            this.timeout(10000);
            fsConnector.getFile('team2', 'code/pdf/plan/Projektplan2.pdf', function (err, fileName) {
                expect(err).to.be.a('null');
                assert.equal(fileName, 'Projektplan2.pdf');
                done();
            });

        });
    });
    describe('getFileTree', function () {
        it('returns directory from fsStorage service specified by path', function (done) {
            this.timeout(10000);
            fsConnector.getFileTree('team2', 'code/pdf/plan', function (err, dirs) {
                console.log(dirs);
                expect(err).to.be.a('null');
                assert.equal(dirs.length, 1);
                done();
            });

        });
    });
});