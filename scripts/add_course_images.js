// ==UserScript==
// @name         UoM Blackboard: Add course images
// @namespace    http://tampermonkey.net/
// @version      20240119.00.00
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme, which adds course images to the Blackboard homepage.
// @author       adil192
// @match        https://online.manchester.ac.uk/webapps/portal/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// @license      Unlicense
// @downloadURL  https://github.com/adil192/BlackboardTheme/raw/main/scripts/add_course_images.js
// ==/UserScript==

// @ts-check

/**
 * Returns a module image URL, assuming it's in standard format.
 * @param {string} moduleCode
 * @param {string} extension The file extension of the image, defaults to "jpg".
 * @returns {string}
 */
function imageFromModuleCode(moduleCode, extension="jpg") {
    return `https://raw.githubusercontent.com/adil192/BlackboardTheme/main/assets/subjects/${moduleCode}/${moduleCode}.${extension}`;
}

/**
 * The known modules and their images.
 * In the future, I want to replace this with the Pixabay API
 * so that we can get images for any module.
 * @type {[string, string][]}
 */
const moduleImages = [
    ["ARDSE001",  imageFromModuleCode("ARDSE001")],
    ["COMP",      imageFromModuleCode("COMP")],
    ["COMP30040", imageFromModuleCode("COMP30040")],
    ["COMP33511", imageFromModuleCode("COMP33511")],
    ["COMP38311", imageFromModuleCode("COMP38311")],
    ["MATH",      imageFromModuleCode("MATH")],
    ["MATH31051", imageFromModuleCode("MATH31051", "png")],
    ["MATH32031", imageFromModuleCode("MATH32031")],
    ["MATH32091", imageFromModuleCode("MATH32091", "png")],
];

/**
 * Returns the module image for the given module name, or null if it doesn't exist.
 * @param {string} moduleName
 * @returns {string | null}
 */
function findModuleImage(moduleName) {
    let bestImage = null;
    for (const [moduleCode, moduleImage] of moduleImages) {
        if (!moduleName.startsWith(moduleCode)) continue;
        bestImage = moduleImage;
    }
    return bestImage;
}

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

            // Set `--bg-url` to the module image if it exists.
            let moduleImage = findModuleImage(moduleName);
            if (moduleImage) {
                course.style.setProperty("--bg-url", `url("${moduleImage}")`);
            }
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
