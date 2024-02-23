// @ts-check

/**
 * The video element.
 * @type {HTMLVideoElement | null}
 */
let videoElem;
/**
 * The div#video element, which contains `videoElem`.
 * @type {HTMLDivElement | null}
 */
let videoDiv;
/**
 * The captions options, which are usually "Off" and "English".
 * @type {HTMLLIElement[]}
 */
let captionsOptions = [];

/**
 * Whether `findElements()` has been run successfully.
 * @type {boolean}
 */
let foundElements = false;

/**
 * Finds the html elements.
 * @returns {Promise} Resolves when the elements are found.
 */
async function findElements() {
    if (foundElements) return true;

    let attemptsRemaining = 10;
    while (!foundElements && attemptsRemaining > 0) {
        attemptsRemaining--;

        if (!videoElem) videoElem = document.querySelector("video");
        if (!videoDiv) videoDiv = document.querySelector("div#video");
    
        if (!captionsOptions.length) {
            let captionsButton = document.querySelector(".vjs-captions-button");
            if (captionsButton) {
                captionsOptions = Array.from(captionsButton.querySelectorAll("li.vjs-menu-item"))
                    // Filter out the "captions settings" option
                    .filter(e => !e.classList.contains("vjs-texttrack-settings"))
                    // Convert to an array of HTMLLIElement
                    .map(e => /** @type {HTMLLIElement} */ (e));
            }
            if (captionsOptions.length < 2 && attemptsRemaining > 0) {
                console.log("findElements: captionsOptions.length < 2:", { captionsOptions });
                captionsOptions = [];
            }
        }

        foundElements = !!videoElem && !!videoDiv && !!captionsOptions.length;

        if (!foundElements) {
            console.log("findElements: Some elements not found:", { videoElem, videoDiv, captionsOptions });
            await new Promise(r => setTimeout(r, 50));
        }
    }

    if (foundElements) onFoundElements();
}

/**
 * Called when `findElements()` finds the elements.
 * Inserts a button into the control bar to open the video in a new tab.
 * @returns {void}
 */
function onFoundElements() {
    if (!foundElements) {
        console.error("onFoundElements: called before elements were found.");
        return;
    }
    console.log("onFoundElements: found elements:", { videoElem, videoDiv, captionsOptions });

    // since the other elements have been found, it's safe to assume that all the other elements exist

    addNewTabButton();
    addCaptionsEventListeners();
    restoreCaptions();
}

/**
 * Adds a button in the control bar to open the video in a new tab. 
 */
function addNewTabButton() {
    if (!foundElements) return;

    /** @type {HTMLDivElement | null} */
    const captionsButton = document.querySelector(".vjs-captions-button");
    if (!captionsButton) return;
    const controlBar = captionsButton.parentElement;
    if (!controlBar) return;

    const newTabButton = document.createElement("button");
    newTabButton.className = "vjs-new-tab-control vjs-control vjs-button";
    newTabButton.type = "button";
    newTabButton.title = "Open in new tab";
    newTabButton.onclick = () => {
        // open this iframe's url in a new tab
        window.open(window.location.href, "_blank");
    };

    const newTabButtonSpan = document.createElement("span");
    newTabButtonSpan.className = "vjs-control-text";
    newTabButtonSpan.innerText = "Open in new tab";
    newTabButton.appendChild(newTabButtonSpan);

    // insert the button before the captions button
    controlBar.insertBefore(newTabButton, captionsButton);
}

/**
 * Adds the relevant event listeners to the captions buttons
 * to call `onCaptionsChange` when the captions change.
 * @returns {void}
 */
function addCaptionsEventListeners() {
    if (!foundElements) return;

    captionsOptions.forEach(option => {
        option.addEventListener("click", onCaptionsChange);
    });
}

/**
 * Called when the captions change to remember whether captions are on or off.
 */
function onCaptionsChange() {
    if (!foundElements) return;

    let selectedOption = captionsOptions.find(e => e.classList.contains("vjs-selected"));
    if (!selectedOption) {
        console.error("onCaptionsChange: No selected captions option found:", { captionsOptions });
        return;
    }

    let captionsOn = selectedOption.innerText.indexOf('captions off') === -1;
    console.log("onCaptionsChange: captionsOn:", { captionsOn });

    if (captionsOn) {
        localStorage.setItem("captionsOn", "1");
    } else {
        localStorage.removeItem("captionsOn");
    }
}

/**
 * Restores the captions to the previous state.
 * Called when the page loads after the elements are found.
 */
function restoreCaptions() {
    if (!foundElements) return;

    let captionsOn = !!localStorage.getItem("captionsOn");
    console.log("restoreCaptions: restoring captionsOn:", { captionsOn });

    if (captionsOn) {
        let captionsOnBtn = captionsOptions.find(e => e.innerText.indexOf('captions off') === -1);
        if (captionsOnBtn) {
            captionsOnBtn.click();
        } else {
            console.error("restoreCaptions: No captions on button found:", { captionsOptions });
        }
    }
}

/**
 * @param {KeyboardEvent} e 
 */
function handleKeydown(e) {
    console.log("handleKeydown", e.key, { e });

    if (!foundElements) {
        console.log("handleKeydown: Some elements not found:", { videoElem, videoDiv, captionsOptions });
        return;
    }
    if (!videoElem || !videoDiv) { // This should never happen
        console.log("Unexpected error: videoElem or videoDiv is null.")
        return;
    }

    switch (e.key) {
        case "ArrowLeft":
            videoElem.currentTime -= 10;
            break;
        case "ArrowRight":
            videoElem.currentTime += 10;
            break;
        case "ArrowUp":
            videoElem.volume = Math.min(1, videoElem.volume + 0.1);
            break;
        case "ArrowDown":
            videoElem.volume = Math.max(0, videoElem.volume - 0.1);
            break;
        case " ":
            if (videoElem.paused) {
                videoElem.play();
            } else {
                videoElem.pause();
            }
            break;
        case "f":
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoDiv.requestFullscreen();
            }
            break;
        case "c":
            if (captionsOptions.length) {
                let unselectedOption = captionsOptions.find(e => !e.classList.contains("vjs-selected"));
                if (unselectedOption) {
                    unselectedOption.click();
                } else {
                    console.error("handleKeydown: No unselected captions option found:", { captionsOptions });
                    captionsOptions[0].click();
                }
                onCaptionsChange();
            }
            break;
        default:
            // unknown key, return early
            return;
    }

    e.preventDefault();
    e.stopPropagation();
}

(function () {
    'use strict';

    console.log("UoM Blackboard: Video keyboard shortcuts");
    findElements();
    document.addEventListener("keydown", handleKeydown);
})();
