importScripts('/node_modules/mocha/mocha.js');

mocha.setup({
  ui: 'bdd',
  reporter: null,
});

self.addEventListener('fetch', () => {
  console.log('FETCH EVENT');
});

self.addEventListener('notificationclick', () => {
  console.log('NOTIFICATION CLICK EVENT');
});

self.addEventListener('notificationclose', () => {
  console.log('NOTIFICATION CLOSE EVENT');
});

describe('SW Events Test Suite', function() {
  it('should be able to make a fetch event', function() {
    const event = new FetchEvent('fetch', {
      request: new Request('/index.html'),
    });
    self.dispatchEvent(event);
  });

  it('should be able to make a notificationclick event', function() {
    return registration.showNotification('Title')
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      const event = new NotificationEvent('notificationclick', {
        notification: notifications[0],
      });
      self.dispatchEvent(event);

      return notifications;
    })
    .then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
    });
  });

  it('should be able to make a notificationclose event', function() {
    return registration.showNotification('Title')
    .then(() => {
      return self.registration.getNotifications();
    })
    .then((notifications) => {
      const event = new NotificationEvent('notificationclose', {
        notification: notifications[0],
      });
      self.dispatchEvent(event);

      return notifications;
    })
    .then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      });
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
