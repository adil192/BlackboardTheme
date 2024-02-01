/**
 * @fileoverview
 * Chrome treats extension css as user agent css,
 * which means the page's css can easily override it.
 * This script injects the extension css into the page below everything else,
 * so it can't be overridden.
 */

// @ts-check

(async function() {
    'use strict';

    /**
     * Firefox correctly prioritises extension css over page css,
     * so we don't need to do anything.
     * @type {boolean}
     */
    const firefox = navigator.userAgent.includes('Firefox');
    if (firefox) return;

    /**
     * The name of the css file to inject into the page,
     * with the .css extension.
     * @type {string}
     */
    const cssFilename = "{{cssFilename}}";

    console.log("UoM Blackboard: Inject CSS", cssFilename);

    /** @type {HTMLLinkElement} */
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // @ts-ignore
    link.href = (chrome ?? browser).runtime.getURL('styles/' + cssFilename);
    link.type = 'text/css';
    link.classList.add('uom-blackboard-extension');

    // first inject the css into <head>, so it's loaded as soon as possible
    /** @type {HTMLHeadElement | null} */
    let head = document.querySelector('head');
    while (!head) {
        await new Promise(resolve => setTimeout(resolve, 100));
        head = document.querySelector('head');
    }
    head.appendChild(link.cloneNode());

    // then inject the css into <body>, so it can't be overridden
    /** @type {HTMLBodyElement | null} */
    let body = document.querySelector('body');
    while (!body) {
        await new Promise(resolve => setTimeout(resolve, 100));
        body = document.querySelector('body');
    }
    body.appendChild(link);

    // watch for changes to the <body> element
    const observer = new MutationObserver(() => {
        if (!body) return;

        // Iterate through body's children backwards.
        // We should find the link element along with
        // other .uom-blackboard-extension elements,
        // all of which should be at the bottom.
        let child = body.lastChild;
        while (child) {
            // If we find the link element, we don't need to do anything.
            if (child === link) return;
            
            // If we find another .uom-blackboard-extension element,
            // ignore it and continue searching.
            if (child instanceof HTMLLinkElement && child.classList.contains('uom-blackboard-extension')) {
                child = child.previousSibling;
                continue;
            }

            // We found something else, so we need to re-inject the css.
            body.appendChild(link);
            return;
        }
    });
    observer.observe(body, {
        childList: true,
        subtree: true,
    });
})();
