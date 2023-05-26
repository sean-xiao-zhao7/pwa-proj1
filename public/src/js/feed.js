var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
    "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var postBtn = document.querySelector("#post-btn");

function openCreatePostModal() {
    createPostArea.style.display = "block";
    setTimeout(() => {
        createPostArea.style.transform = "translateY(0)";
    }, 1);
}

function closeCreatePostModal() {
    createPostArea.style.transform = "translateY(100vh)";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

postBtn.addEventListener("click", (event) => {
    event.preventDefault();
    // get title/location of new post
    const titleValue = document.querySelector("#title").value;
    const locationValue = document.querySelector("#location").value;

    // setup background sync using SW
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready().then((sw) => {
            sw.sync.register("create-post");
        });
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
