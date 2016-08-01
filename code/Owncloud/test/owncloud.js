var expect    = require('chai').expect;
var assert    = require('chai').assert;
var owncloud = require("../owncloud");

describe('Owncloud', function() {
    describe('Path to directory content', function() {
        it("returns all directories in specified path", function(done) {
            owncloud.getFileTree('abi515','Injection2','BA-Philipp',function(err,dirs){
                expect(err).to.be.a('null');
                expect(dirs).to.have.length.above(5);
                console.log(dirs);
                done();
            });
        });
    });
    describe('Path to file', function() {
        it('returns file contents as buffer and filename specified by path', function(done) {
            owncloud.getFile('abi515','Injection2','BA-Philipp/Umfrage/Umfrage.pdf',function(err,fileName,buffer){
                expect(err).to.be.a('null');
                assert.equal(fileName,'Umfrage.pdf');
                expect(buffer).to.be.not.a('null');
                done();
            });
        });
    });
    describe('Upload file to path', function() {
        it('uploads file to path and returns status', function(done) {
            var fs = require('fs');
            fs.readFile("./test/test.pdf", function (err, data) {
                expect(err).to.be.a('null');
                owncloud.uploadFile('BA-Philipp',data,'test5.pdf', function(err,msg){
                    expect(err).to.be.a('null');
                    assert.equal(msg,'upload succesful');
                    done();
                });
            });
        });
    });
});