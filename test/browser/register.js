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

/**
 * You can't unregister and re-register a service worker in a browser.
 * Instead you need to unregister a service, navigate to a different page
 * then navigate back. This navigation properly removes the service worker.
 * Without this navigation the old service worker stays alive and Registering
 * the same service worker will bring back the old service worker, but it will
 * not perform install or activate steps and it's state is normally incorrect.
 */

describe('Test Registering Service Worker', function() {
  const sinonStubs = [];

  let fakeRegHandler;
  const registerStubCallback = (path, options) => {
    // Allow the individual tests to define fakeRegHandler
    return fakeRegHandler(path, options);
  };

  const stubSWRegister = () => {
    const registerStub = sinon.stub(navigator.serviceWorker, 'register',
      registerStubCallback);
    sinonStubs.push(registerStub);
  };

  before(function() {
    // We stub the register function of service worker to ensure we test both
    // good and bad paths and to avoid actually registering a service worker
    // which we can't unregister between tests.
    return stubSWRegister();
  });

  after(function() {
    sinonStubs.forEach((stub) => {
      stub.restore();
    });
  });

  it('should register service worker', function() {
    fakeRegHandler = (path, options) => {
      path.should.equal(self.__demoSite.constants.serviceWorkerPath);
      (options === undefined).should.equal(true);

      return Promise.resolve();
    };

    return self.__demoSite.registerServiceWorker();
  });

  it('should handle failing service worker registration', function() {
    const INJECTED_ERROR_MSG = 'Inject Error Message.';
    fakeRegHandler = (path, options) => {
      path.should.equal(self.__demoSite.constants.serviceWorkerPath);
      (options === undefined).should.equal(true);

      return Promise.reject(new Error(INJECTED_ERROR_MSG));
    };

    return self.__demoSite.registerServiceWorker()
    .then(() => {
      throw new Error('This method should have rejected.');
    }, (err) => {
      err.message.should.equal(INJECTED_ERROR_MSG);
    });
  });
});
