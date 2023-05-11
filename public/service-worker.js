self.addEventListener("install", (event) => {
    // console.log("Service worker installing - ", event);
});

self.addEventListener("activate", (event) => {
    // console.log("Service worker activating - ", event);
    return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
});

// template
// self.addEventListener("fetch", (event) => {

// });
