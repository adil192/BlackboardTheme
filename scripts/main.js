// ==UserScript==
// @name         UoM Blackboard Userscript
// @namespace    http://tampermonkey.net/
// @version      20230415.00.00
// @description  An optional accompanying script for https://github.com/adil192/BlackboardTheme
// @author       adil192
// @match        https://online.manchester.ac.uk/webapps/portal/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=manchester.ac.uk
// @grant        none
// ==/UserScript==

function greyOutOldCourses() {
    const coursesDiv = document.querySelector("#div_339_1");
    if (!coursesDiv) return;

    coursesDiv.addEventListener("DOMSubtreeModified", () => {
        const courses = document.querySelectorAll("#CurrentCourses li");
        if (!courses.length) return;

        let firstSemesterCourses = [];
        let secondSemesterCourses = [];
        courses.forEach((course) => {
            const anchor = course.querySelector("a");
            const courseName = anchor.innerText;
            if (courseName.includes("1st Semester")) {
                firstSemesterCourses.push(course);
            } else if (courseName.includes("2nd Semester")) {
                secondSemesterCourses.push(course);
            }
        });

        if (firstSemesterCourses.length && secondSemesterCourses.length) {
            // If we have courses in both semesters, we must be in the second semester.
            // Grey out the first semester courses.
            firstSemesterCourses.forEach((course) => {
                course.classList.add("secondary");
            });
        }
    });
}

(function() {
    'use strict';

    window.addEventListener("load", () => {
        greyOutOldCourses();
    });
})();

