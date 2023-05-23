let addHomePromptEvent;

if (!window.Promise) {
    window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => {
            console.log("Service worker registered.");
        })
        .catch((err) => {
            alert("Error registering servier worker. Check console log.");
            console.log(err);
        });
}

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    addHomePromptEvent = event;
    return false;
});
