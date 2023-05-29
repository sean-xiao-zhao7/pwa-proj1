let addHomePromptEvent;

if (!window.Promise) {
    window.Promise = Promise;
}

// service worker

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => {
            // console.log("Service worker registered.");
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

// notifications

const enableNotificationsButtons = document.querySelectorAll(
    ".enable-notifications"
);

const promptNotfiyPermission = () => {
    Notification.requestPermission((result) => {
        if (result !== "granted") {
            alert("Notification denied.");
        } else {
            
        }
    });
};

if ("Notification" in window) {
    for (const button of enableNotificationsButtons) {
        button.style.display = "inline-block";
        button.addEventListener("click", promptNotfiyPermission);
    }
}
