/**
 * Created by PhilippMac on 29.12.16.
 */
import {browser, element, by, ElementFinder} from 'protractor';
import * as helper from '../helper';
import * as config from '../globalConfig';

export class RegisterPage {

  private registerUrl = config.baseUrl + 'register';
  private username = element.all(by.css('.md-input-element')).get(0);
  private password1 = element.all(by.css('.md-input-element')).get(1);
  private password2 = element.all(by.css('.md-input-element')).get(2);
  private registerButton = element(by.buttonText('submit'));

  register(username: string, password1: string, password2: string) {
    helper.sendKeysToElement(this.username, username);
    helper.sendKeysToElement(this.password1, password1);
    helper.sendKeysToElement(this.password2, password2);
    this.registerButton.click();
  }


  navigateToRegisterPage() {
    return browser.get(this.registerUrl);
  }
}
