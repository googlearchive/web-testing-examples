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

describe('Test Demo Site SW Registration', function() {
  const sinonStubs = [];

  afterEach(function() {
    sinonStubs.forEach((stub) => {
      stub.restore();
    });
  });

  it('should register service worker', function() {
    // Create a method that will be our fakes serviceWorker.register()
    // function.
    const fakeRegHandler = (path, options) => {
      path.should.equal(self.__demoSite.constants.serviceWorkerPath);
      (options === undefined).should.equal(true);

      return Promise.resolve();
    };

    // Use sinon to stub out our fake register call.
    const registerStub = sinon.stub(navigator.serviceWorker, 'register',
      fakeRegHandler);
    sinonStubs.push(registerStub);

    return self.__demoSite.registerServiceWorker();
  });

  it('should handle failing service worker registration', function() {
    const INJECTED_ERROR_MSG = 'Inject Error Message.';

    // Create a method that will be our fakes serviceWorker.register()
    // function.
    const fakeRegHandler = (path, options) => {
      path.should.equal(self.__demoSite.constants.serviceWorkerPath);
      (options === undefined).should.equal(true);

      return Promise.reject(new Error(INJECTED_ERROR_MSG));
    };

    // Use sinon to stub out our fake register call.
    const registerStub = sinon.stub(navigator.serviceWorker, 'register',
      fakeRegHandler);
    sinonStubs.push(registerStub);

    return self.__demoSite.registerServiceWorker()
    .then(() => {
      throw new Error('This method should have rejected.');
    }, (err) => {
      err.message.should.equal(INJECTED_ERROR_MSG);
    });
  });
});
