self.addEventListener("install", (event) => {
    // console.log("Service worker installing - ", event);
    event.waitUntil(
        caches.open("staticFiles").then((cache) => {
            cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/favicon.ico",
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
    // console.log("Service worker activating - ", event);
    return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // event.respondWith(fetch(event.request));
    event.respondWith(
        caches.match(event.request).then((res) => {
            if (res) {
                return res;
            } else {
                return fetch(event.request);
            }
        })
    );
});

fetch("https://httpbin.org/get").then((res) => {});

// template
// self.addEventListener("fetch", (event) => {

// });
