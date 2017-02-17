importScripts('/node_modules/mocha/mocha.js');
importScripts('/test/static/example-push-listener.js');

mocha.setup({
  ui: 'bdd',
  reporter: null,
});

describe('SW Structure Test Suite', function() {
  it('should show a notification', function() {
    const exampleData = {
      title: 'Hello',
      body: 'Testing notification.',
    };

    return new Promise((resolve, reject) => {
      const pushEvent = new PushEvent('push', {
        data: JSON.stringify(exampleData),
      });
      // Override waitUntil so we can detect when the notification
      // has been show by the push event.
      pushEvent.waitUntil = (promise) => {
        promise.then(resolve, reject);
      };
      self.dispatchEvent(pushEvent);
    })
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      if (notifications.length !== 1) {
        throw new Error('Unexpected number of notifications.');
      }

      const notification = notifications[0];
      notification.close();
      if (notification.title !== exampleData.title) {
        throw new Error('Unexpected notification title.');
      }
      if (notification.body !== exampleData.body) {
        throw new Error('Unexpected notification body.');
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
