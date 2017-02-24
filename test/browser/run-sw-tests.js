describe('Run Service Worker Tests', function() {
  before(function() {
    return window.__testCleanup();
  });

  afterEach(function() {
    return window.__testCleanup();
  });

  const handleTestResults = (results) => {
    if (results.failures > 0) {
      const pluralFailures = results.failures > 1 ? 's' : '';
      throw new Error(`${results.failures} failing test${pluralFailures}.`);
    }
  };

  const sendMessage = (serviceWorker, message) => {
    return new Promise(function(resolve, reject) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      serviceWorker.postMessage(message, [messageChannel.port2]);
    });
  };

  it('should run sw-unit-tests.js unit tests', function() {
    return navigator.serviceWorker.register('/test/sw/sw-unit-tests.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'activated');
    })
    .then((serviceWorker) => {
      return sendMessage(serviceWorker, 'run-tests');
    })
    .then(handleTestResults);
  });

  it('should run sw-events.js unit tests', function() {
    return navigator.serviceWorker.register('/test/sw/sw-events.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'activated');
    })
    .then((serviceWorker) => {
      return sendMessage(serviceWorker, 'run-tests');
    })
    .then(handleTestResults);
  });
});
