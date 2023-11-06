// ==UserScript==
// @name         UoM Blackboard: Video keyboard shortcuts
// @namespace    http://tampermonkey.net/
// @version      20231104.21.00
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme, which adds keyboard shortcuts for video playback on Blackboard.
// @author       adil192
// @match        https://video.manchester.ac.uk/embedded/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// @license      Unlicense
// ==/UserScript==

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
 * Finds the html elements.
 * @returns {boolean} Whether the elements were found.
 */
function findElements() {
    if (!videoElem) videoElem = document.querySelector("video");
    if (!videoDiv) videoDiv = document.querySelector("div#video");

    if (!captionsOptions.length) {
        let captionsButton = document.querySelector(".vjs-captions-button");
        if (captionsButton) {
            captionsOptions = Array.from(captionsButton.querySelectorAll(".vjs-menu-item"))
                // Filter out the "captions settings" option
                .filter(e => !e.classList.contains("vjs-texttrack-settings"));
        }
    }

    return videoElem && videoDiv && captionsOptions.length;
}

/**
 * @param {KeyboardEvent} e 
 */
function handleKeydown(e) {
    console.log("handleKeydown", { e });

    if (!findElements()) {
        console.log("handleKeydown: Some elements not found:", { videoElem, videoDiv, captionsOptions });
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
                    console.log("handleKeydown: No unselected captions option found:", { captionsOptions });
                    captionsOptions[0].click();
                }
            }
            break;
    }
}

(function () {
    'use strict';

    console.log("UoM Blackboard: Video keyboard shortcuts");
    document.addEventListener("keydown", handleKeydown, { once: true, passive: true });
})();
