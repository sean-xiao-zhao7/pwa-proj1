const serviceWorkerName = "service-worker";

var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
    "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
    createPostArea.style.display = "block";
}

function closeCreatePostModal() {
    createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

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

if ("caches" in window) {
    caches
        .match(cardUrl)
        .then((res) => {
            if (res) {
                return res.json();
            }
        })
        .then((data) => {
            if (!finished) {
                finished = true;
                console.log(cardUrl);
                createCard(Object.values(data));
            }
        });
}
