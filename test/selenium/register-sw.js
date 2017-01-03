/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * See the License for the specific language governing permissions and
 * * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * limitations under the License.
 */

'use strict';

const webdriver = require('selenium-webdriver');
const testServer = require('../utils/test-server.js');
const registerServiceWorker = require('../../demo-site/scripts/register-sw.js');

// chromedriver module will add the chrome binary onto the current path
// which is required by selenium-webdriver.
require('chromedriver');

describe('Register SW', function() {
  // Selenium-webdriver tests are flakey and take some time.
  // Account for this with retries and timeouts.
  this.timeout(5 * 60 * 1000);
  this.retries(3);

  let testServerAddress;
  let seleniumDriver;

  const initDriver = () => {
    return new webdriver.Builder()
    .forBrowser('chrome')
    .build()
    .then((driver) => {
      seleniumDriver = driver;
      // This is required to allow use of executeAsyncScript
      driver.manage().timeouts().setScriptTimeout(5 * 1000);
    });
  };
  before(function() {
    return testServer.start()
    .then((address) => {
      testServerAddress = address;
    });
  });

  after(function() {
    return testServer.stop();
  });

  afterEach(function() {
    return seleniumDriver.quit();
  });

  it('should be able to register SW.', function() {
    // Initialising the driver in the tests means that if it fails to build
    // it will be caught and the test will be retried.
    // You *could* initialise the driver in the before step, but this
    // won't allow retries, resulting in flakier tests.
    return initDriver()
    .then(() => {
      // Load the demo site in the browser
      return seleniumDriver.get(`${testServerAddress}/demo-site/`);
    })
    .then(() => {
      // Wait until the service worker is ready
      return seleniumDriver.wait(() => {
        return seleniumDriver.executeAsyncScript((swPath, cb) => {
          /* eslint-env browser */
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (!registration) {
              return cb(false);
            }

            const serviceWorker = registration.active ||
              registration.installing ||
              registration.waiting;
            // Check that the registration has a service worker.
            if (!serviceWorker) {
              return cb(false);
            }

            // Wait for the service worker to be activated.
            serviceWorker.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                cb(true);
              }
            });

            // Check if service worker is already activated.
            if (serviceWorker.state === 'activated') {
              cb(true);
            }
          });
        }, registerServiceWorker.serviceWorkerPath);
      });
    })
    .then(() => {
      return testServer.stop();
    })
    .then(() => {
      return seleniumDriver.navigate().refresh();
    })
    .then(() => {
      return seleniumDriver.executeScript(() => {
        return window.location.href;
      });
    })
    .then((browserUrl) => {
      browserUrl.should.equal(testServerAddress);
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 15000);
      });
    });
  });
});
