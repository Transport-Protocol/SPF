/**
 * Created by PhilippMac on 29.12.16.
 */
import {browser, element, by, ElementFinder, protractor} from 'protractor';
import * as helper from '../helper';
import * as config from '../globalConfig';
var path = require('path');

export class HomePage {

  private homeUrl: string = config.baseUrl;
  public create = element(by.buttonText('create'));
  private createTeamButton = element(by.buttonText('create Team'));
  private teamName = element(by.className('createTeamInputName'));
  private password = element(by.className('createTeamInputPassword'));

  private joinTeamButton = element(by.buttonText('join Team'));
  public joinButton = element(by.buttonText('join'));
  private joinTeamName = element(by.className('joinTeamName'));
  private joinTeamPassword = element(by.className('joinTeamPassword'));
  private changeTeamButton = element(by.buttonText('change Team'));

  private googleTab = element.all(by.className('md-tab-label')).get(0);
  private dropboxTab = element.all(by.className('md-tab-label')).get(1);
  private owncloudTab = element.all(by.className('md-tab-label')).get(2);
  private abstractFsTab = element.all(by.className('md-tab-label')).get(3);
  private githubTab = element.all(by.className('md-tab-label')).get(4);
  private bitbucketTab = element.all(by.className('md-tab-label')).get(5);
  private slackTab = element.all(by.className('md-tab-label')).get(6);

  private uploadInput = element(by.className('fsUploadInput'));
  private uploadButton = element(by.className('fsUploadButton'));

  private shareRepoWithTeamButton = element(by.buttonText('share repository with Team'));


  createTeam(teamName: string, password: string) {
    this.createTeamButton.click();
    helper.sendKeysToElement(this.teamName, teamName);
    helper.sendKeysToElement(this.password, password);
    this.create.click();
  }

  joinTeam(teamName: string, password: string) {
    this.joinTeamButton.click();
    helper.sendKeysToElement(this.joinTeamName, teamName);
    helper.sendKeysToElement(this.joinTeamPassword, password);
    this.joinButton.click();
  }

  changeTeam(teamName: string) {
    this.changeTeamButton.click().then(function(){
      element.all(by.className('changeTeamListItem')).filter(function(elem) {
        return elem.getInnerHtml().then(function(inner) {
          return inner === teamName;
        });
      }).first().click();
    });
  }

  openGoogleTab() {
    this.googleTab.click();
  }

  openDropboxTab() {
    this.dropboxTab.click();
  }

  openOwncloudTab() {
    this.owncloudTab.click();
  }

  openAbstractFsTab() {
    this.abstractFsTab.click();
  }

  openGithubTab() {
    this.githubTab.click();
  }

  openBitbucketTab() {
    this.bitbucketTab.click();
  }

  openSlackTab() {
    this.slackTab.click();
  }

  clickFirstRepoRadioButton(){
    element.all(by.className('md-radio-container')).first().click();
  }

  clickIndexOfRepoRadioButton(index : number){
    element.all(by.className('md-radio-container')).get(index).click();
  }

  clickFirstChannelRadioButton(){
    element.all(by.className('md-radio-container')).first().click();
  }

  clickShareRepo(){
    this.shareRepoWithTeamButton.click();
  }

  uploadFile(filePath: string) {
    var absolutePath = path.resolve(__dirname, filePath);
    this.uploadInput.sendKeys(absolutePath);
    this.uploadButton.click();
  }

  sendChatMessage(message : string){
    var chatInput = element(by.className('inputChatMessage'));
    helper.sendKeysToElement(chatInput,message);
    element(by.buttonText('Send!')).click();
  }

  getFile(fileName: string) {
    var grid = element.all(by.css('.md-data-table tr'));
    var skipFirst = true;
    grid.each(function (row) {
      if (!skipFirst) {
        row.element(by.className('fsEntryName')).getInnerHtml().then(function (inner) {
          if (inner === fileName) {
            row.element(by.className('fsEntryDownload')).click();
          }
        });
      }
      skipFirst = false;
    });
  }

  uploadSuccessful(filePath: string) {
    // Create a promise to be fulfilled or rejected later.
    var deferred = protractor.promise.defer();
    var fileName = path.parse(filePath).base;
    element.all(by.className('fsEntryName')).last().getInnerHtml().then(function (text) {
      var success = false;
      if (text === fileName) {
        success = true;
      }
      deferred.fulfill(success);
    });
    return deferred.promise;
  }

  getNumberOfFiletreeEntries() {
    return element.all(by.className('md-text-cell')).count();
  }

  navigateToHomePage() {
    return browser.get(this.homeUrl);
  }
}
