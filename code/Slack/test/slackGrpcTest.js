/**
 * Created by PhilippMac on 13.09.16.
 */
/**
 * Created by PhilippMac on 25.08.16.
 */
'use strict';

var expect = require('chai').expect,
    //assert = require('chai').assert,
    grpc = require('grpc');


function init() {

    var proto = grpc.load('./proto/slackMessaging.proto').slackMessaging;
    var url = 'localhost:50048';
    console.log(url);
    client = new proto.SlackMessaging(url,
        grpc.credentials.createInsecure());
    auth = {type: 'OAUTH2', token: 'xoxp-11952872597-11961057271-79718090480-c8f859272a'};
}

var client = {},
    auth = {};

describe('Slack Grpc', function () {
    before(function () {
        init();
    });
    describe('getChannelList', function () {
        it('returns filecontent specified by path', function (done) {
            this.timeout(10000);
            client.getChannelList({
                auth: auth,
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.channels).not.to.be.a('null');
                done();
            });
        });
        it('builds the auth url for dropbox to authenticate', function (done) {
            this.timeout(20000);
            client.getChannelMessages({
                auth: auth,
                channelId: 'C0BU2EU4Q',
                oldest: 0
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.messages).not.to.be.a('null');
                console.log(response.messages);
                done();
            });
        });/*
        it('builds the auth url for bitbucket to authenticate', function (done) {
            this.timeout(20000);
            client.sendMessage({
                auth: auth,
                channelId: 'C0BU2EU4Q',
                message: 'test',
                as_user: true
            }, function (err, response) {
                expect(err).to.be.a('null');
                expect(response.status).not.to.be.a('null');
                done();
            });
        });*/
    });
});