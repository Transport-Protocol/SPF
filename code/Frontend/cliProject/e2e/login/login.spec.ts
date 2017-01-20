/**
 * Created by PhilippMac on 29.12.16.
 */
import {LoginPage} from './login.pageObject';
import {browser} from 'protractor';
import * as config from '../globalConfig';

describe('Login page', function () {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('should login user', () => {
    page.navigateToLoginPage();
    page.login('philipp', 'philipp');
    expect(browser.getCurrentUrl()).toEqual(config.baseUrl); //if redirect worked,test passed
  });

});


