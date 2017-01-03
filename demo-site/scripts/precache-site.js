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

const CACHE_NAME = 'demo-site-cache';
const FILES_TO_CACHE = [
  '/demo-site/index.html',
];

const precacheSite = () => {
  return caches.open(CACHE_NAME)
  .then((openCache) => {
    return openCache.addAll(FILES_TO_CACHE);
  });
};

if (typeof module !== 'undefined') {
  /* eslint-env node */
  module.exports = {
    cacheName: CACHE_NAME,
    FILES_TO_CACHE: FILES_TO_CACHE,
  };
} else {
  self.__demoSite = self.__demoSite || {};
  self.__demoSite.constants = self.__demoSite.constants || {};

  self.__demoSite.precacheSite = precacheSite;
  self.__demoSite.constants.cacheName = CACHE_NAME;
  self.__demoSite.constants.filesToCache = FILES_TO_CACHE;
}
