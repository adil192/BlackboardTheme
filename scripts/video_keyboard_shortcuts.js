// ==UserScript==
// @name         UoM Blackboard: Video keyboard shortcuts
// @namespace    http://tampermonkey.net/
// @version      20231103.00.00
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme, which adds keyboard shortcuts for video playback on Blackboard.
// @author       adil192
// @match        https://video.manchester.ac.uk/embedded/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// @license      Unlicense
// ==/UserScript==

/** @type {HTMLVideoElement | null} */
let videoElem;

/**
 * @param {KeyboardEvent} e 
 */
function handleKeydown(e) {
    console.log("handleKeydown", { e });

    if (!videoElem) {
        videoElem = document.querySelector("video");
        if (!videoElem) {
            console.log("handleKeydown: No video element found.");
            return;
        }
        console.log("handleKeydown: Found video element:", videoElem);
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
    }
}

(function () {
    'use strict';

    console.log("UoM Blackboard: Video keyboard shortcuts");
    document.addEventListener("keydown", handleKeydown);
})();
