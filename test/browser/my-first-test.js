describe('Service Worker Suite', function() {
  beforeEach(function() {
    return navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      const unregisterPromise = registrations.map((registration) => {
        return registration.unregister();
      });
      return Promise.all(unregisterPromise);
    });
  });

  it('should register a service worker and cache file on install', function() {
    return navigator.serviceWorker.register('/test/static/my-first-sw.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'installed');
    })
    .then(() => {
      /** const iframeEl = document.createElement('iframe');
      iframeEl.src = '/test/static/index.html';
      document.body.appendChild(iframeEl);**/
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
