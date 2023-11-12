// ==UserScript==
// @name         UoM Blackboard: Highlight current modules
// @namespace    http://tampermonkey.net/
// @version      20231103.00.00
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme, which highlights current modules on the Blackboard homepage by greying out old modules.
// @author       adil192
// @match        https://online.manchester.ac.uk/webapps/portal/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// @license      Unlicense
// @downloadURL  https://github.com/adil192/BlackboardTheme/raw/main/scripts/highlight_current_modules.js
// ==/UserScript==

// @ts-check

/** @type {HTMLDivElement | null} */
let currentCoursesDiv;
/** @type {HTMLDivElement | null} */
let formerCoursesDiv;

/**
 * Returns a promise that resolves when `currentCoursesDiv` and `formerCoursesDiv` are found.
 * @returns {Promise<void>}
 */
function findCoursesDivs() {
    currentCoursesDiv = document.querySelector("#CurrentCourses");
    formerCoursesDiv = document.querySelector("#FormerCourses");
    if (!currentCoursesDiv || !formerCoursesDiv) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(findCoursesDivs());
            }, 500);
        });
    }
    return Promise.resolve();
}

/**
 * Greys out courses that are in the first semester if we are in the second semester.
 * @param {HTMLDivElement | null} coursesDiv
 */
function greyOutOldCourses(coursesDiv) {
    console.log("greyOutOldCourses", { coursesDiv });
    const courses = coursesDiv?.querySelectorAll("ul.listElement > li");
    if (!courses || !courses.length) {
        console.log("greyOutOldCourses: No courses found.");
        return;
    }

    let firstSemesterCourses = [];
    let secondSemesterCourses = [];
    courses.forEach((course) => {
        const anchor = course.querySelector("a");
        if (!anchor) return;
        const courseName = anchor.innerText;
        if (courseName.includes("1st Semester")) {
            firstSemesterCourses.push(course);
        } else if (courseName.includes("2nd Semester")) {
            secondSemesterCourses.push(course);
        }
    });

    console.log(`greyOutOldCourses: Found ${firstSemesterCourses.length} first semester courses and ${secondSemesterCourses.length} second semester courses.`);

    if (firstSemesterCourses.length && secondSemesterCourses.length) {
        // If we have courses in both semesters, we must be in the second semester.
        // Grey out the first semester courses.
        firstSemesterCourses.forEach((course) => {
            course.classList.add("secondary");
        });
    }
}

(function () {
    'use strict';

    console.log("UoM Blackboard: Highlight current modules");
    window.addEventListener("load", () => {
        findCoursesDivs().then(() => {
            greyOutOldCourses(currentCoursesDiv);
            greyOutOldCourses(formerCoursesDiv);

            currentCoursesDiv?.addEventListener("DOMSubtreeModified", () => {
                greyOutOldCourses(currentCoursesDiv);
            }, { once: true, passive: true });
            formerCoursesDiv?.addEventListener("DOMSubtreeModified", () => {
                greyOutOldCourses(formerCoursesDiv);
            }, { once: true, passive: true });
        });
    }, { once: true, passive: true });
})();
