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

chai.should();

const clearAllCaches = () => {
  return caches.keys()
  .then((cacheNames) => {
    return Promise.all(cacheNames.map((cacheName) => {
      return caches.delete(cacheName);
    }));
  });
};

describe('Test Caching Code', function() {
  beforeEach(function() {
    return clearAllCaches();
  });

  after(function() {
    return clearAllCaches();
  });

  it('should have the cache name and files defined', function() {
    self.__demoSite.constants.cacheName.should.equal('demo-site-cache');
    self.__demoSite.constants.filesToCache.length.should.equal(1);
  });

  it('should cache all desired assets', function() {
    return self.__demoSite.precacheSite()
    .then(() => {
      // Get the cache where the files should be cached
      return caches.open(self.__demoSite.constants.cacheName);
    })
    .then((openedCache) => {
      // Iterate over each file and make sure it's in the specified cache.
      const fileList = self.__demoSite.constants.filesToCache;
      const checkCachePromises = fileList.map((fileToCache) => {
        return openedCache.match(fileToCache);
      });
      return Promise.all(checkCachePromises);
    });
  });
});
