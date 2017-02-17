/* eslint-env browser */
window.__testCleanup = () => {
  const unregisterSW = () => {
    return navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      const unregisterPromise = registrations.map((registration) => {
        return registration.unregister();
      });
      return Promise.all(unregisterPromise);
    });
  };

  const clearCaches = () => {
    return window.caches.keys()
    .then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        return window.caches.delete(cacheName);
      }));
    });
  };

  return Promise.all([
    unregisterSW(),
    clearCaches(),
  ]);
};
