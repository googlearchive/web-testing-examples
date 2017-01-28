window.__waitForSWState = (registration, desiredState) => {
  return new Promise((resolve, reject) => {
    let serviceWorker = registration.installing;

    if (!serviceWorker) {
      return reject(new Error('The service worker is not installing. ' +
        'Is the test environment clean?'));
    }

    const stateListener = (evt) => {
      if (evt.target.state === desiredState) {
        serviceWorker.removeEventListener('statechange', stateListener);
        return resolve();
      }

      if (evt.target.state === 'redundant') {
        serviceWorker.removeEventListener('statechange', stateListener);

        return reject(new Error('Installing service worker became redundant'));
      }
    };

    serviceWorker.addEventListener('statechange', stateListener);
  });
};
