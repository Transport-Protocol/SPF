/**
 * Created by PhilippMac on 10.01.17.
 */
'use strict';
process.chdir(__dirname); //set working directory to path of file that is being executed
var expect = require('chai').expect,
    fs = require('fs'),
    assert = require('chai').assert,
    nconf = require('nconf'),
    grpc = require('grpc'),
    transfer = require("../transfer");

describe('Transfer', function () {
    nconf.file({file: 'config/config.json'});
    transfer.init();
    xit("transfers file to google drive", function (done) {
        this.timeout(10000);
        fs.readFile('Projektplan.pdf',function(err,data){
            if(err){
                throw err;
            }
            transfer.toFileStorage('GOOGLE','philipp','Projektplan.pdf',data,'transfer/test',function(err,status){
                expect(err).to.be.a('null');
                expect(status).to.be.not.a('null');
                done();
            });
        });
    });
    it("transfers file to google drive over grpc", function (done) {
        this.timeout(10000);

        var url = nconf.get('grpcServerIp') + ':' + nconf.get('grpcServerPort');
        console.log('transferservice grpc url: %s', url);
        var proto = grpc.load('./proto/fileTransfer.proto').fileTransfer;
        var fileTransfer = new proto.FileTransfer(url,
            grpc.credentials.createInsecure());

        fs.readFile('Projektplan.pdf',function(err,data){
            if(err){
                throw err;
            }

            fileTransfer.transferTo({
                service : 'GOOGLE',
                username : 'philipp',
                fileName : 'Projektplan.pdf',
                fileBuffer : data,
                path : 'transfer/test'
            },function(err,response){
                expect(err).to.be.a('null');
                expect(response).to.be.not.a('null');
                done();
            });
        });
    });
});
