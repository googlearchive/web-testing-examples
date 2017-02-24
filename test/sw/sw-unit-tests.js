importScripts('/node_modules/mocha/mocha.js');

mocha.setup({
  ui: 'bdd',
  reporter: null,
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
  });
  event.waitUntil(promiseChain);
});

describe('First SW Test Suite', function() {
  it('should test something', function() {
    if (!self.registration) {
      throw new Error('There is no registration - is this a service worker?');
    }
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
