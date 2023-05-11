var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
    "#close-create-post-modal-btn"
);

function openCreatePostModal() {
    createPostArea.style.display = "block";
    if (addHomePromptEvent) {
        addHomePromptEvent.prompt();
        addHomePromptEvent.userChoice.then((result) => {
            if (result.outcome === "dismissed") {
            } else {
            }
        });
        addHomePromptEvent = null;
    }
}

function closeCreatePostModal() {
    createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);
