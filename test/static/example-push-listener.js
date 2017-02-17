/* eslint-env serviceworker, browser */

self._handlePushEvent = (data) => {
  return self.registration.showNotification(data.title, {
    body: data.body,
  });
};

self.addEventListener('push', (event) => {
  const promiseChain = self._handlePushEvent(event.data.json());
  event.waitUntil(promiseChain);
});
