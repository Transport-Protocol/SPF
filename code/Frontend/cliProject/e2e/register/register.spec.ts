/**
 * Created by PhilippMac on 29.12.16.
 */
import {RegisterPage} from './register.pageObject';
import {browser} from 'protractor';
import * as config from '../globalConfig';

xdescribe('Register page', function () {
  let page: RegisterPage;

  beforeEach(() => {
    page = new RegisterPage();
  });

  it('should register user', () => {
    page.navigateToRegisterPage();
    page.register('username' + Math.random(), '123456', '123456');
    expect(browser.getCurrentUrl()).toEqual(config.baseUrl + 'login'); //if redirect to login worked,test passed
  });

});


