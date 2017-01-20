/**
 * Created by PhilippMac on 29.12.16.
 */
import {browser, element, by, ElementFinder} from 'protractor';

export function sendKeysToElement(element: ElementFinder, keys: string) {
  browser.actions().click(element.getWebElement()).sendKeys(keys).perform();
}

