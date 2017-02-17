describe('Run SW Unit Tests', function() {
  before(function() {
    return window.__testCleanup();
  });

  afterEach(function() {
    return window.__testCleanup();
  });

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
    .then((results) => {
      if (results.failures > 0) {
        throw new Error(`${results.failures} failures out of ` +
          `${results.total} tests`);
      }
    });
  });

  it('should run sw-events.js unit tests', function() {
    return navigator.serviceWorker.register('/test/sw/sw-events.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'activated');
    })
    .then((serviceWorker) => {
      return sendMessage(serviceWorker, 'run-tests');
    })
    .then((results) => {
      if (results.failures > 0) {
        throw new Error(`${results.failures} failures out of ` +
          `${results.total} tests`);
      }
    });
  });

  it('should run sw-structure-test.js unit tests', function() {
    return navigator.serviceWorker.register('/test/sw/sw-structure-test.js')
    .then((reg) => {
      return window.__waitForSWState(reg, 'activated');
    })
    .then((serviceWorker) => {
      return sendMessage(serviceWorker, 'run-tests');
    })
    .then((results) => {
      if (results.failures > 0) {
        throw new Error(`${results.failures} failures out of ` +
          `${results.total} tests`);
      }
    });
  });
});
