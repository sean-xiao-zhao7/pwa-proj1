importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/umd.js");
importScripts("/src/js/indexedDB_utils.js");

let staticFilesVersion = "staticFiles-v40";
let dynamicRequestsVersion = "dynamicRequests-v20";
const dynamicCacheMaxItems = 5;
const cacheOnlyReqs = [
    "/",
    "/index.html",
    "/manifest.json",
    "/favicon.ico",
    "/404.html",
    "/src/js/app.js",
    "/src/js/indexedDB_utils.js",
    "/src/js/feed.js",
    "/src/js/fetch_polyfill.js",
    "/src/js/promise_polyfill.js",
    "/src/js/material.min.js",
    "/src/css/app.css",
    "/src/css/feed.css",
    "/src/css/help.css",
    "/src/images/main-image.jpg",
    "https://fonts.googleapis.com/css?family=Roboto:400,700",
    "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
    "https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
    "https://cdn.jsdelivr.net/npm/idb@7/build/umd.js",
];

const trimCache = (cacheName = dynamicRequestsVersion) => {
    caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > dynamicCacheMaxItems) {
                cache
                    .delete(keys[0])
                    .then(() => trimCache(cacheName, dynamicCacheMaxItems));
            }
        });
    });
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticFilesVersion).then((cache) => {
            cache.addAll(cacheOnlyReqs);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (
                        key != staticFilesVersion &&
                        key !== dynamicRequestsVersion
                    ) {
                        caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const cardUrl = "https://pwa2-e7438-default-rtdb.firebaseio.com/posts.json";
    if (event.request.url.indexOf(cardUrl) > -1) {
        // cache then network with dynamic caching
        event.respondWith(
            fetch(event.request).then((res) => {
                return putResponseToIDB(res);
            })
        );
    } else if (
        cacheOnlyReqs.some((reqStr) => event.request.url.includes(reqStr))
    ) {
        // cache only
        event.respondWith(caches.match(event.request));
    } else {
        // cache with network fallback
        event.respondWith(
            caches.match(event.request).then((cachedRes) => {
                if (cachedRes) {
                    return cachedRes;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return putResponseToIDB(res);
                        })
                        .catch((err) => {
                            console.log(err);
                            if (
                                event.request.headers
                                    .get("accept")
                                    .includes("text/html")
                            ) {
                                return caches.match("/404.html");
                            } else if (
                                event.request.headers
                                    .get("accept")
                                    .includes("image")
                            ) {
                                return caches.match("/favicon.ico");
                            }
                        });
                }
            })
        );
    }
});
