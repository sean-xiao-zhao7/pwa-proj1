self.addEventListener("install", (event) => {
    console.log("Service worker installing - ", event);
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activating - ", event);
    return self.clients.claim();
});
