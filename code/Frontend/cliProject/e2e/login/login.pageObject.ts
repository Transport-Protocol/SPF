/**
 * Created by PhilippMac on 29.12.16.
 */
import {browser, element, by, ElementFinder} from 'protractor';
import * as helper from '../helper';
import * as config from '../globalConfig';

export class LoginPage {

  private loginUrl: string = config.baseUrl + 'login';

  private loginButton = element(by.buttonText('login'));


  login(name: string, password: string) {
    helper.sendKeysToElement(element(by.className('loginUsernameInput')),name);
    helper.sendKeysToElement(element(by.className('loginPasswordInput')),password);
    this.loginButton.click();
  }

  navigateToLoginPage() {
    return browser.get(this.loginUrl);
  }

}
