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

/* eslint-env node */
/* eslint-disable no-console */

/**
 * This script should be run using node to start up the test server.
 * This is useful for manually running and developing the in-page tests.
 */

const testServer = require('../utils/test-server.js');
testServer.start(3000)
.then((address) => {
  console.log();
  console.log();
  console.log('Server running on ' + address);
  console.log();
  console.log();
});
