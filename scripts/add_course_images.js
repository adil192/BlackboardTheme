// ==UserScript==
// @name         UoM Blackboard: Add course images
// @namespace    http://tampermonkey.net/
// @version      20231211.00.01
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme, which adds course images to the Blackboard homepage.
// @author       adil192
// @match        https://online.manchester.ac.uk/webapps/portal/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// @license      Unlicense
// @downloadURL  https://github.com/adil192/BlackboardTheme/raw/main/scripts/add_course_images.js
// ==/UserScript==

// @ts-check

/** @type {HTMLDivElement[]} */
let coursesDivs = [];

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function timeoutPromise(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Returns a promise that resolves when `coursesDivs` are found.
 * @returns {Promise<void>}
 */
async function findCoursesDivs() {
    /** @type {HTMLDivElement | null} */
    let currentCoursesDiv = null;
    /** @type {HTMLDivElement | null} */
    let formerCoursesDiv = null;
    while (!currentCoursesDiv || !formerCoursesDiv) {
        currentCoursesDiv = document.querySelector("#CurrentCourses");
        formerCoursesDiv = document.querySelector("#FormerCourses");
        if (!currentCoursesDiv || !formerCoursesDiv) {
            await timeoutPromise(500);
        }
    }
    coursesDivs = [currentCoursesDiv, formerCoursesDiv];
    console.log('found courses divs:', {currentCoursesDiv, formerCoursesDiv});
}

/**
 * Sets the `data-module-code` attribute of each course to the course code.
 */
function labelCourses() {
    coursesDivs.forEach((coursesDiv) => {
        /** @type {NodeListOf<HTMLLIElement>} */
        const courses = coursesDiv.querySelectorAll("ul.listElement > li");
        courses.forEach((course) => {
            const anchor = course.querySelector("a");
            if (!anchor) return;
            const moduleName = anchor.innerText;
            // We used to get the module code from the module name, but this is
            // unnecessary since the module name begins with the module code.
            course.dataset.moduleCode = moduleName;
        });
    });
}

(function () {
    'use strict';

    console.log("UoM Blackboard: Add course images");
    findCoursesDivs().then(() => {
        labelCourses();

        coursesDivs.forEach((coursesDiv) => {
            coursesDiv.addEventListener("DOMSubtreeModified", () => {
                labelCourses();
            }, { passive: true });
        });
    });
})();
