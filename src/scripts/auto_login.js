// @ts-check

(function () {
    'use strict';

    console.log("UoM Blackboard: Auto login");

    /** The username input. @type {HTMLInputElement | null} */
    const username = document.querySelector("input#username");
    /** The password input. @type {HTMLInputElement | null} */
    const password = document.querySelector("input#password");
    /** The submit button. @type {HTMLInputElement | null} */
    const submit = document.querySelector("input[type=submit]");

    if (!username || !password || !submit) {
        console.log("UoM Blackboard: Auto login: Could not find username, password or submit button.");
        return;
    }

    if (username.value && password.value) {
        console.log("UoM Blackboard: Auto login: Username and password are already filled in, submitting form.");
        submit.click();
    }
})();
