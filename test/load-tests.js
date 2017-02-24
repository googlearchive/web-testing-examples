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

const fs = require('fs-extra');
const path = require('path');
const webdriver = require('selenium-webdriver');
const webdriverChrome = require('selenium-webdriver/chrome');
const mkdirp = require('mkdirp');

const testServer = require('./utils/test-server.js');

// chromedriver module will add the chrome binary onto the current path
// which is required by selenium-webdriver.
require('chromedriver');

describe('Selenium Tests', function() {
  const seleniumTestFiles = fs.readdirSync(path.join(__dirname, 'selenium'));
  seleniumTestFiles.forEach((testFile) => {
    // Require-ing the selenium files will run the contents of the files which
    // will define tests with describe() and it().
    require(`./selenium/${testFile}`);
  });
});

describe('Node Tests', function() {
  const nodeTestFiles = fs.readdirSync(path.join(__dirname, 'node'));
  nodeTestFiles.forEach((testFile) => {
    // Require-ing the selenium files will run the contents of the files which
    // will define tests with describe() and it().
    require(`./node/${testFile}`);
  });
});

describe('Browser Tests', function() {
  const tmpDir = path.join(__dirname, 'tmp');
  let testServerAddress;
  let seleniumDriver;

  before(function() {
    return testServer.start()
    .then((serverAddress) => {
      testServerAddress = serverAddress;
    });
  });

  after(function() {
    return Promise.all([
      testServer.stop(),
      seleniumDriver ? seleniumDriver.quit() : Promise.resolve(),
    ])
    .then(() => {
      // Chrome saves the profile before quiting.
      // so delete tmp directory after closing Chrome.
      fs.removeSync(tmpDir);
    });
  });

  const createChromeProfile = () => {
    const notificationPermission = {};
    notificationPermission[testServerAddress + ',*'] = {
      setting: 1,
    };
    const chromePreferences = {
      profile: {
        content_settings: {
          exceptions: {
            notifications: notificationPermission,
          },
        },
      },
    };

    // Write to a file
    const tempPreferenceDir = path.join(tmpDir, 'chrome-prefs');
    mkdirp.sync(path.join(tempPreferenceDir, 'Default'));
    const preferenceFilePath = path.join(tempPreferenceDir,
      'Default', 'Preferences');

    fs.writeFileSync(
      preferenceFilePath,
      JSON.stringify(chromePreferences));

    return tempPreferenceDir;
  };

  it('should pass all browser tests', function() {
    this.timeout(10 * 1000);

    const profilePath = createChromeProfile();

    const options = new webdriverChrome.Options();
    options.addArguments('user-data-dir=' + profilePath);

    return new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()
    .then((driver) => {
      seleniumDriver = driver;
    })
    .then(() => {
      return seleniumDriver.get(`${testServerAddress}/test/browser/`);
    })
    .then(() => {
      return seleniumDriver.executeScript(function() {
        /* eslint-env browser */
        return Notification.permission;
      });
    })
    .then(() => {
      return seleniumDriver.wait(function() {
        return seleniumDriver.executeScript(function() {
          /* eslint-env browser */
          return (typeof window.__testResults) !== 'undefined';
        });
      });
    })
    .then(() => {
      return seleniumDriver.executeScript(function() {
        /* eslint-env browser */
        return window.__testResults;
      });
    })
    .then((results) => {
      if (results.failures > 0) {
        const pluralFailures = results.failures > 1 ? 's' : '';
        throw new Error(`${results.failures} failing test${pluralFailures}.`);
      }
    });
  });
});
