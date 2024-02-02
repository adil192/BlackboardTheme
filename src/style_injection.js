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

    while (!document.body || !document.head) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (navigator.userAgent.includes('Firefox')) {
        // Firefox correctly prioritises extension css over page css,
        // so we don't usually need this script.
        // However, sometimes the css isn't loaded at all,
        // so we need to inject it manually.
        // Check if the `--fonts-body` variable is set.
        // If it's not, then the css hasn't loaded.
        const style = getComputedStyle(document.documentElement);
        if (style.getPropertyValue('--fonts-body')) {
            // The css has loaded, so we don't need to do anything.
            return;
        }
        console.log("UoM Blackboard: Custom css missing, injecting manually");
    }

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
    if (document.head.firstChild) {
        document.head.insertBefore(link, document.head.firstChild);
    } else {
        document.head.appendChild(link);
    }
    // then inject the css into <body>, so it can't be overridden
    document.body.appendChild(link);

    // watch for changes to the <body> element
    const observer = new MutationObserver(() => {
        // Iterate through body's children backwards.
        // We should find the link element along with
        // other .uom-blackboard-extension elements,
        // all of which should be at the bottom.
        let child = document.body.lastChild;
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
            document.body.appendChild(link);
            return;
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
