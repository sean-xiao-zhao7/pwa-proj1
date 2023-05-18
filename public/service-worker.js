let staticFilesVersion = "staticFiles-v12";
let dynamicRequestsVersion = "dynamicRequests-v14";
const dynamicCacheMaxItems = 5;
const cacheOnlyReqs = [
    "/index.html",
    "/manifest.json",
    "/favicon.ico",
    "/404.html",
    "/src/js/feed.js",
    "/src/js/material.min.js",
    "/src/js/app.js",
    "/src/css/app.css",
    "/src/css/feed.css",
    "/src/css/help.css",
    "/src/images/main-image.jpg",
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
            cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/favicon.ico",
                "/404.html",
                "/src/js/feed.js",
                "/src/js/material.min.js",
                "/src/js/app.js",
                "/src/css/app.css",
                "/src/css/feed.css",
                "/src/css/help.css",
                "/src/images/main-image.jpg",
                "https://fonts.googleapis.com/css?family=Roboto:400,700",
                "https://fonts.googleapis.com/icon?family=Material+Icons",
                "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
            ]);
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
    const cardUrl = "https://httpbin.org/get";
    if (event.request.url.indexOf(cardUrl) > -1) {
        // cache then network with dynamic caching
        event.respondWith(
            caches.open(dynamicRequestsVersion).then((cache) => {
                return fetch(event.request).then((res2) => {
                    cache.put(event.request, res2.clone());
                    return res2;
                });
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
                            return caches
                                .open(dynamicRequestsVersion)
                                .then((dynamicCache) => {
                                    trimCache();
                                    dynamicCache.put(
                                        event.request,
                                        res.clone()
                                    );
                                    return res;
                                });
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
