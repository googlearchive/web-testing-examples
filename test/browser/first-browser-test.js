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

describe('First Browser Test Suite', function() {
  beforeEach(function() {
    return window.__testCleanup();
  });

  after(function() {
    return window.__testCleanup();
  });

  it('should register my-first-sw.js and cache file on install', function() {
    return navigator.serviceWorker.register('/test/static/my-first-sw.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'installed');
    })
    .then(() => {
      return caches.match('/__test/example')
      .then((response) => {
        if (!response) {
          throw new Error('Eek, no response was found in the cache.');
        }

        return response.text();
      })
      .then((responseText) => {
        if (responseText !== 'Hello, World!') {
          throw new Error(`The response text was wrong!: '${responseText}'`);
        }
      });
    });
  });
});
