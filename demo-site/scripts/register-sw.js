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

const SW_PATH = '/demo-site/sw.js';
const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    return Promise.reject(new Error('Service worker not supported.'));
  }

  return navigator.serviceWorker.register(SW_PATH);
};

if (typeof module !== 'undefined') {
  /* eslint-env node */
  module.exports = {
    serviceWorkerPath: SW_PATH,
  };
} else {
  self.__demoSite = self.__demoSite || {};
  self.__demoSite.constants = self.__demoSite.constants || {};

  self.__demoSite.registerServiceWorker = registerServiceWorker;
  self.__demoSite.constants.serviceWorkerPath = SW_PATH;
}
