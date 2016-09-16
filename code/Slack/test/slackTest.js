'use strict';

var expect = require('chai').expect,
    assert = require('chai').assert,
    fs = require('fs'),
    slack = require("../slack");


var access_token = {};

function init() {
    access_token = 'xoxp-11952872597-11961057271-79718090480-c8f859272a';
}


describe('Slack', function () {
    before(function () {
        init();
    });
    describe('getChannelList', function () {
        it('returns all channels in slack team corresponding to access_token', function (done) {
            this.timeout(10000);
            slack.getChannelList(access_token, function (err, dirs) {
                expect(err).to.be.a('null');
                expect(dirs).to.be.not.a('null');
                done();
            });
        });
    });
    describe('getChannelMessages', function () {
        it('returns messages in channel with their text and sender', function (done) {
            this.timeout(10000);
            slack.getChannelMessages(access_token, 'C0BU2EU4Q', function (err, messages) {
                expect(err).to.be.a('null');
                expect(messages).to.be.not.a('null');
                done();
            });
        });
    });
    describe('sendMessage', function () {
        it('sends a message to a channel', function (done) {
            this.timeout(10000);
            slack.sendMessage(access_token, 'C0BU2EU4Q', 'testMessage', true, function (err, msg) {
                expect(err).to.be.a('null');
                assert.equal(msg, 'ok');
                done();
            });
        });
    });
});