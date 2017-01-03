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

const serveIndex = require('serve-index');
const serveStatic = require('serve-static');
const path = require('path');
const http = require('http');

/* eslint-disable require-jsdoc */

class TestServer {
  getAddress() {
    if (!this._server) {
      throw new Error('No server');
    }

    const addressInfo = this._server.address();
    return `http://${addressInfo.address}:${addressInfo.port}`;
  }

  start(portNumber) {
    if (this._server) {
      return Promise.resolve(this.getAddress());
    }

    if (!portNumber) {
      portNumber = 0;
    }

    const servePath = path.join(__dirname, '..', '..');
    const index = serveIndex(servePath, {'icons': true});
    const serve = serveStatic(servePath);

    this._server = http.createServer((req, res) => {
      const done = () => {
        res.writeHead(404);
        res.end();
      };

      serve(req, res, function onNext(err) {
        if (err) {
          return done(err);
        }

        index(req, res, done);
      });
    });
    this._server.setTimeout(1000);

    return new Promise((resolve, reject) => {
      // Listen
      this._server.listen(portNumber, 'localhost', () => {
        resolve(this.getAddress());
      });
    });
  }

  stop() {
    if (!this._server) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._server.close(resolve);
    });
  }
}
module.exports = new TestServer();
