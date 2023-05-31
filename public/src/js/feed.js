var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
    "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var postBtn = document.querySelector("#post-btn");
const videoEl = document.querySelector("#player");
const canvasEl = document.querySelector("#canvas");
const captureButton = document.querySelector("#capture-button");
const imagePicker = document.querySelector("#image-picker");
const imagePickerInput = document.querySelector("#image-picker-input");
const getLocationButton = document.querySelector("#get-location-button");
const locationLoader = document.querySelector("#location-loader");
const locationContainer = document.querySelector("#location-container");

// image/video
const prepareMedia = () => {
    if (!("mediaDevices" in navigator)) {
        navigator.mediaDevices = {};
    }

    if (!("getUserMedia" in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = (constraints) => {
            const getUserMedia =
                navigator.webkitGerUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error("getUserMedia not available."));
            } else {
                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        };
    }
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            videoEl.srcObject = stream;
            videoEl.style.display = "block";
        })
        .catch((err) => {
            console.log(err.message);
            imagePicker.style.display = "block";
        });
};

captureButton.addEventListener("click", (event) => {
    canvasEl.style.display = "block";
    videoEl.style.display = "none";
    captureButton.style.display = "none";
    const context = canvasEl.getContext("2d");
    context.drawImage(
        videoEl,
        0,
        0,
        canvasEl.width,
        videoEl.videoHeight / (videoEl.videoWidth / canvasEl.width)
    );
    videoEl.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
    });
});

imagePickerInput.addEventListener("change", (_) => {
    imagePicker.style.display = "none";
    canvasEl.style.display = "block";

    const imageFile = imagePickerInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.addEventListener("load", () => {
            const context = canvasEl.getContext("2d");
            context.drawImage(img, 0, 0, 20, 20);
        });
        img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
});

// location
getLocationButton.addEventListener("click", (event) => {
    getLocationButton.style.display = "none";
    locationLoader.style.display = "inline-block";
    if ("geolocation" in navigator) {
        const geolocation = navigator.geolocation;
        geolocation.getCurrentPosition((position) => {
            console.log(position.coords);
            locationLoader.style.display = "none";
            locationContainer.textContent = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
        });
    }
});

function openCreatePostModal() {
    createPostArea.style.display = "block";
    setTimeout(() => {
        createPostArea.style.transform = "translateY(0)";
    }, 1);
    prepareMedia();
}

function closeCreatePostModal() {
    createPostArea.style.transform = "translateY(100vh)";
    videoEl.style.display = "none";
    imagePicker.style.display = "none";
    canvasEl.style.display = "none";
    getLocationButton.style.display = "inline";
    locationContainer.textContent = "";
    if (videoEl.srcObject) {
        videoEl.srcObject.getVideoTracks().forEach((track) => {
            track.stop();
        });
    }
}

shareImageButton.addEventListener("click", openCreatePostModal);
closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

postBtn.addEventListener("click", (event) => {
    event.preventDefault();
    // get title/location of new post
    const titleValue = document.querySelector("#title").value;
    const locationValue = document.querySelector("#location").value;
    const id = new Date().toISOString();

    // setup background sync using SW
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((sw) => {
            writePostToIDB({
                title: titleValue,
                location: locationValue,
                id: id,
            })
                .then(() => {
                    return sw.sync.register("create-post");
                })
                .then(() => {
                    alert("Create post sync registered.");
                })
                .catch((err) => {
                    alert(err.message);
                });
        });
    } else {
        alert("SyncManager is not available.");
    }

    closeCreatePostModal();
});

function createCard(data) {
    for (const post of data) {
        var cardWrapper = document.createElement("div");
        cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
        var cardTitle = document.createElement("div");
        cardTitle.className = "mdl-card__title";
        cardTitle.style.height = "180px";
        cardTitle.style.backgroundImage = `url(${post.imageUrl})`;
        cardTitle.style.backgroundSize = "auto";
        cardTitle.style.backgroundRepeat = "no-repeat";
        cardTitle.style.backgroundPosition = "center";
        cardWrapper.appendChild(cardTitle);
        var cardTitleTextElement = document.createElement("h2");
        cardTitleTextElement.className = "mdl-card__title-text";
        cardTitleTextElement.textContent = post.location;
        cardTitle.appendChild(cardTitleTextElement);
        var cardSupportingText = document.createElement("div");
        cardSupportingText.className = "mdl-card__supporting-text";
        cardSupportingText.textContent = post.name;
        cardSupportingText.style.textAlign = "center";
        cardWrapper.appendChild(cardSupportingText);
        componentHandler.upgradeElement(cardWrapper);
        sharedMomentsArea.appendChild(cardWrapper);
    }
}

const cardUrl = "https://pwa2-e7438-default-rtdb.firebaseio.com/posts.json";
let finished = false;

fetch(cardUrl)
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        if (!finished) {
            finished = true;
            createCard(Object.values(data));
        }
    });

if ("indexedDB" in window) {
    readAllFromIDB().then((results) => {
        createCard(Object.values(results));
    });
}

// if ("caches" in window) {
//     caches
//         .match(cardUrl)
//         .then((res) => {
//             if (res) {
//                 return res.json();
//             }
//         })
//         .then((data) => {
//             if (!finished) {
//                 finished = true;
//                 createCard(Object.values(data));
//             }
//         });
// }
