let addHomePromptEvent;
const iconUrl = "/src/images/icons/app-icon-96x96.png";

if (!window.Promise) {
    window.Promise = Promise;
}

// service worker

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        // .register("/service-worker.js")
        .register("/workbox_sw.js")
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

const preparePushSub = () => {
    navigator.serviceWorker.ready.then((sw) => {
        sw.pushManager
            .getSubscription()
            .then((subs) => {
                if (!subs) {
                    const enc = new TextEncoder();
                    const vpkBuf = enc.encode(
                        "BKHNSp-L3vWlTDXFPVNlbRr4SMSTcyWdy7yndSrpqTwBh_npketBjdu_yXrKVf0DugqpVGx-Hbha1dzxtPypBaE"
                    );
                    return sw.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: vpkBuf,
                    });
                }
            })
            .then((sub) => {
                if (sub) {
                    // send to backend
                }
            });
    });
};

const promptNotfiyPermission = () => {
    if ("serviceWorker" in navigator) {
        Notification.requestPermission((result) => {
            if (result !== "granted") {
                alert("Notification denied.");
            } else {
                // displayExampleNotify();
                preparePushSub();
            }
        });
    }
};

const displayExampleNotify = () => {
    navigator.serviceWorker.ready.then((sw) => {
        const options = {
            body: "Service worker used.",
            icon: iconUrl,
            image: "/src/images/sf-boat.jpg",
            dir: "ltr",
            lang: "en-US",
            tag: "example-notify",
            actions: [
                {
                    action: "closeExample",
                    title: "Close example",
                    icon: iconUrl,
                },
            ],
        };
        // new Notification("Notification enabled.", options);
        sw.showNotification("Notification enabled.", options);
    });
};

if ("Notification" in window && "serviceWorker" in navigator) {
    for (const button of enableNotificationsButtons) {
        button.style.display = "inline-block";
        button.addEventListener("click", promptNotfiyPermission);
    }
}
