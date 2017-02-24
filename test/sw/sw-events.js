importScripts('/node_modules/mocha/mocha.js');

/* globals NotificationEvent */

mocha.setup({
  ui: 'bdd',
  reporter: null,
});

self.addEventListener('fetch', (event) => {
  const expectedUrl = new URL('/index.html', location).toString();
  if (event.request.url === expectedUrl) {
    event.respondWith(new Response('hello.'));
  } else {
    event.respondWith(null);
  }
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const promiseChain = self.registration.showNotification(data.title, data);
  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', (event) => {
  const promiseChain = event.notification.close();
  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclose', (event) => {
  // Not sure what a developer would want to test
  // so add a global flag and check it's set so
  // we know the fake event was received and did
  // something.
  self._notification_close_result = true;
  event.waitUntil(Promise.resolve());
});

describe('SW Events Test Suite', function() {
  const clearNotifications = () => {
    return self.registration.getNotifications()
    .then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
  };

  beforeEach(function() {
    return clearNotifications();
  });

  after(function() {
    return clearNotifications();
  });

  it('should be able to test a push event', function() {
    const pushData = {
      title: 'Example Title.',
      body: 'Example Body.',
    };

    return new Promise((resolve, reject) => {
      const fakePushEvent = new PushEvent('push', {
        data: JSON.stringify(pushData),
      });

      // Override waitUntil so we can detect when the notification
      // has been show by the push event.
      fakePushEvent.waitUntil = (promise) => {
        promise.then(resolve, reject);
      };

      self.dispatchEvent(fakePushEvent);
    })
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      if (notifications.length !== 1) {
        throw new Error('Unexpected number of notifications shown.');
      }

      if (notifications[0].title !== pushData.title) {
        throw new Error('Unexpected notification title.');
      }

      if (notifications[0].body !== pushData.body) {
        throw new Error('Unexpected notification body.');
      }
    });
  });

  it('should be able to make a fetch event', function() {
    return new Promise((resolve, reject) => {
      const event = new FetchEvent('fetch', {
        request: new Request('/index.html'),
      });
      event.respondWith = (promiseChain) => {
        if (promiseChain) {
          // Check if promise was returned - otherise
          // it could be a response
          if (promiseChain instanceof Promise) {
            promiseChain.then(resolve, reject);
          } else {
            resolve(promiseChain);
          }
          return;
        }

        resolve();
      };
      self.dispatchEvent(event);
    })
    .then((response) => {
      return response.text();
    })
    .then((response) => {
      if (response !== 'hello.') {
        throw new Error('Unexpected response.');
      }
    });
  });

  it('should be able to make a notificationclick event', function() {
    return registration.showNotification('Title')
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      return new Promise((resolve, reject) => {
        const event = new NotificationEvent('notificationclick', {
          notification: notifications[0],
        });
        event.waitUntil = (promiseChain) => {
          if (promiseChain) {
            promiseChain.then(resolve, reject);
            return;
          }

          resolve();
        };
        self.dispatchEvent(event);
      });
    })
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      if (notifications.length !== 0) {
        throw new Error('Notifications left open after click.');
      }
    });
  });

  it('should be able to make a notificationclose event', function() {
    return registration.showNotification('Title')
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      return new Promise((resolve, reject) => {
        const event = new NotificationEvent('notificationclose', {
          notification: notifications[0],
        });
        event.waitUntil = (promiseChain) => {
          if (promiseChain) {
            promiseChain.then(resolve, reject);
            return;
          }

          resolve();
        };
        self.dispatchEvent(event);
      });
    })
    .then(() => {
      if (self._notification_close_result !== true) {
        throw new Error('Notification close result not set.');
      }
    });
  });
});

self.addEventListener('message', (event) => {
  if (event.data !== 'run-tests') {
    return;
  }

  const runResults = mocha.run();
  runResults.on('end', () => {
    event.ports[0].postMessage({
      failures: runResults.failures,
      total: runResults.total,
    });
  });
});
