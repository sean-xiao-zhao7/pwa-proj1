self.addEventListener("install", (event) => {
    // console.log("Service worker installing - ", event);
    event.waitUntil(
        caches.open("staticFiles").then((cache) => {
            cache.add("/");
            cache.add("/index.html");
            cache.add("/src/js/app.js");
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
