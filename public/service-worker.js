importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/umd.js");
importScripts("/src/js/indexedDB_utils.js");

let staticFilesVersion = "staticFiles-v55";
let dynamicRequestsVersion = "dynamicRequests-v24";
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
const iconUrl = "/src/images/icons/app-icon-96x96.png";

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
        // save posts response to indexedDB
        event.respondWith(
            fetch(event.request).then((res) => {
                return putResponseToIDB(res);
            })
        );
    } else if (
        cacheOnlyReqs.some((cachedReqStr) => cachedReqStr === event.request.url)
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
                                    dynamicCache.add(
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

self.addEventListener("sync", (event) => {
    if (event.tag === "create-post") {
        event.waitUntil();
    }
});

self.addEventListener("notificationclick", (event) => {
    if (event.action === "closeExample") {
        event.notification.close();
    } else {
        event.waitUntil(
            clients.matchAll().then((clis) => {
                const cli = clis.find((c) => c.visibilityState === "visible");
                cli.navigate(event.notification.data.openUrl);
                cli.focus();
            })
        );
    }
    event.notification.close();
});

self.addEventListener("notificationclose", (event) => {});

self.addEventListener("push", (event) => {
    const serverData = JSON.parse(event.data.text());
    const options = {
        body: serverData.content,
        icon: iconUrl,
        badge: iconUrl,
        dir: "ltr",
        lang: "en-US",
        tag: "example-push-notify",
        data: {
            openUrl: serverData.url,
        },
    };
    event.waitUntil(
        self.regsitration.showNotification(serverData.title, options)
    );
});
