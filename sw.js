console.log("todo")
/*
this.addEventListener('install', function(event) {  // self
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
*/
/*
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
*/
/*
this.addEventListener('fetch', function(event) {
  var response;
  event.respondWith(caches.match(event.request).catch(function() {
    return fetch(event.request);
  }).then(function(r) {
    response = r;
    caches.open('v1').then(function(cache) {
      cache.put(event.request, response);
    });
    return response.clone();
  }).catch(function() {
    return caches.match('index.htm');  // '/'
  }));
});
*/
/*
self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
*/

'use strict';

const version = 'v1.01';
const staticCachePrefix = 'gps-pd1-static-';
const staticCacheName = staticCachePrefix + version;

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            // cache all the static assets required for offline use.
            return cache.addAll([
                './',
                'index.htm'
            ]);
        }).then(() => {
            // activate the new service worker immediately, without waiting for next load.
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            // remove any old caches once the new service worker is activated.
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith(staticCachePrefix) && cacheName !== staticCacheName;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            // tell service worker to take control of any open pages.
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {

    let request = event.request;
    let url = new URL(request.url);

    // only deal with requests on the same domain.
    if (url.origin !== location.origin) {
        return;
    }

    // for non-GET requests, go to the network.
    if (request.method !== 'GET') {
        event.respondWith(fetch(request));
        return;
    }

    // for everything else look to the cahce first,
    // then fall back to the network.
    event.respondWith(
        caches.match(request).then(response => {
            return response || fetch(request);
        })
    );
});
