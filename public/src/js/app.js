let addHomePromptEvent;

if (!window.Promise) {
    window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").then(() => {
        // console.log("Service worker registered.");
    });
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    addHomePromptEvent = event;
    return false;
});
