'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "icons/Icon-512.png": "464fe2db2797702c0ca13bd862ab8273",
"icons/Icon-maskable-192.png": "a1a0033ce821a57f1243bc84ca6ca1b7",
"icons/Icon-192.png": "a1a0033ce821a57f1243bc84ca6ca1b7",
"icons/Icon-maskable-512.png": "464fe2db2797702c0ca13bd862ab8273",
"flutter.js": "195f32f4217e034162a6697208586f44",
"manifest.json": "b4ea8f2fa608cd19470628090f25378f",
"main.dart.js": "d518ed0395ac81034a9f7460ca5e8c02",
"favicon.png": "713ee66bacfaa1cced392fa0aff0f587",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/AssetManifest.json": "fb52c3e7577834bd81118c85049065ee",
"assets/assets/img/gestion.png": "6ce3df1ce31194db1d8952eb00534f88",
"assets/assets/img/Ternero1.jpg": "ad0052f119af9d84facdc52b047e3ef1",
"assets/assets/img/Vaca3.jpeg": "9e936041835965b956db05d53ce80dd6",
"assets/assets/img/Vaca.jpeg": "0d29d991abd1eb3e26450cebb2b2b102",
"assets/assets/img/Vaca1.jpeg": "6315e3890f48a1763f1659ac09e83ab7",
"assets/assets/img/Vaca5.jpeg": "f9e759eff54aa686dce16c09ee4b0082",
"assets/assets/img/drawer_header.png": "b40b9934ee6778449469f6da71a53548",
"assets/assets/img/Aggad.png": "958fa12715f2817be973ad16e3a0585a",
"assets/assets/img/Ternero2.jpg": "6bdffa8f1eaadce0e3181cb33638b28f",
"assets/assets/img/Vaca4.jpeg": "b7b0b1c9d62ec75a279127944186b6d1",
"assets/assets/img/Vaca2.jpeg": "f9e759eff54aa686dce16c09ee4b0082",
"assets/assets/img/Ternero.jpeg": "d720dd2bedadf7c3f9013760a0a85adb",
"assets/assets/img/Finca.jpg": "1aa2c3ebe0a501ed1482c61e94ef4f8d",
"assets/assets/img/IconoGestion.png": "c5e831602440bcf0b06c1c3dab4ae329",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "26f5af2d93473531f82ef5060f9c6d45",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "1f7cb220b3f5309130bd6d9ad87e0fc0",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "4e20cb87b0d43808c49449ffd69b1a74",
"assets/NOTICES": "136627811318a471e8c4bb974fd42d13",
"assets/shaders/ink_sparkle.frag": "a04e492a05f9fd1a8cc6f12163b184dd",
"assets/FontManifest.json": "3ddd9b2ab1c2ae162d46e3cc7b78ba88",
"version.json": "840f62503521aedd3761c6c1b0e9ec8a",
"index.html": "2617e6c29ffc7b2ba66ce0f22d0480b0",
"/": "2617e6c29ffc7b2ba66ce0f22d0480b0",
"canvaskit/canvaskit.wasm": "d4972dbefe733345d4eabb87d17fcb5f",
"canvaskit/canvaskit.js": "687636ce014616f8b829c44074231939",
"canvaskit/profiling/canvaskit.wasm": "05ad694fda6cfca3f9bbac4b18358f93",
"canvaskit/profiling/canvaskit.js": "ba8aac0ba37d0bfa3c9a5f77c761b88b"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
