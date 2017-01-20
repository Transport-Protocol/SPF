/**
 * Created by PhilippMac on 29.12.16.
 */
import {HomePage} from './home.pageObject';
import {browser, element, by} from 'protractor';
import * as config from '../globalConfig';

describe('Home page', function () {
  let page: HomePage = new HomePage();
  let filePath = '../testFiles/test.html';

  describe('Team Component', function () {

    beforeAll(function () {
      page.navigateToHomePage();
    });

    it('should create Team', () => {
      page.createTeam('team' + Math.random(), '123456');
      expect(page.create.isPresent()).toBeFalsy();
    });
    it('should join Team', () => {
      page.joinTeam('teamX', '123456');
      expect(page.joinButton.isPresent()).toBeFalsy();
    });
    it('should change Team', () => {
      page.changeTeam('teamX');
      expect(element(by.className('activeTeam')).getInnerHtml()).toEqual('teamX');
    });
  });
  describe('Google Component', function () {

    beforeAll(function () {
      page.openGoogleTab();
    });

    it('should list contents of googleDrive', () => {
      expect(page.getNumberOfFiletreeEntries()).toBeGreaterThan(5);
    });
    it('should uplaod file to google', () => {
      page.uploadFile(filePath);
      expect(page.uploadSuccessful(filePath)).toBeTruthy();
    });
    it('should download file from google', () => {
      page.getFile('test.html');
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Dropbox Component', function () {

    beforeAll(function () {
      page.openDropboxTab();
    });

    it('should list contents of dropbox', () => {
      expect(page.getNumberOfFiletreeEntries()).toBeGreaterThan(5);
    });
    it('should upload file to dropbox', () => {
      page.uploadFile(filePath);
      expect(page.uploadSuccessful(filePath)).toBeTruthy();
    });
    it('should download file from dropbox', () => {
      page.getFile('test.html');
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Owncloud Component', function () {

    beforeAll(function () {
      page.openOwncloudTab();
    });

    it('should list contents of owncloud', () => {
      expect(page.getNumberOfFiletreeEntries()).toBeGreaterThan(5);
    });
    it('should upload file to owncloud', () => {
      page.uploadFile(filePath);
      expect(page.uploadSuccessful(filePath)).toBeTruthy();
    });
    it('should download file from owncloud', () => {
      page.getFile('test.html');
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Abstract FileStorage Component', function () {

    beforeAll(function () {
      page.openAbstractFsTab();
    });

    it('should list contents of abstractFs', () => {
      expect(page.getNumberOfFiletreeEntries()).toBeGreaterThan(0);
    });
    it('should upload file to abstractFs', () => {
      page.uploadFile(filePath);
      expect(page.uploadSuccessful(filePath)).toBeTruthy();
    });
    it('should download file from abstractFs', () => {
      page.getFile('test.html');
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Github Component', function () {

    beforeAll(function () {
      page.openGithubTab();
    });

    it('should list repositories', () => {
      expect(element.all(by.className('md-radio-label-content')).count()).toBeGreaterThan(0);
    });
    it('should list content of repository', () => {
      page.clickFirstRepoRadioButton();
      expect(element.all(by.className('md-text-cell')).count()).toBeGreaterThan(2);
    });
    it('should grant team access to repository', () => {
      page.clickIndexOfRepoRadioButton(6); //adjust to a repo that user has admin access to
      page.clickShareRepo();
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Bitbucket Component', function () {

    beforeAll(function () {
      page.openBitbucketTab();
    });

    it('should list repositories', () => {
      expect(element.all(by.className('md-radio-label-content')).count()).toBeGreaterThan(0);
    });
    it('should list content of repository', () => {
      page.clickFirstRepoRadioButton();
      expect(element.all(by.className('md-text-cell')).count()).toBeGreaterThan(2);
    });
    it('should grant team access to repository', () => {
      page.clickIndexOfRepoRadioButton(6); //adjust to a repo that user has admin access to
      page.clickShareRepo();
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
  describe('Slack Component', function () {

    beforeAll(function () {
      page.openSlackTab();
    });

    it('should list channels', () => {
      expect(element.all(by.className('md-radio-label-content')).count()).toBeGreaterThan(0);
    });
    it('should show chat history of channel', () => {
      page.clickFirstChannelRadioButton();
      expect(element.all(by.className('slackChatMessageEntry')).count()).toBeGreaterThan(0);
    });
    it('should send chat message to channel', () => {
      page.sendChatMessage('test');
      expect(element(by.className('simple-notification success')).isPresent()).toBeTruthy();
    });
  });
});
