/// Blackboard automatically hides the navigation menu when the screen becomes 1037px or smaller, but doesn't expand it again when the screen becomes larger.
/// This script simply expands the menu when the screen becomes larger than 1037px, unless you manually collapsed the menu.

(async function() {
    'use strict';

    console.log("UoM Blackboard: Expand menu");

    /** @type {HTMLAnchorElement | null} */
    let menuPuller = null;
    while (!menuPuller) {
        menuPuller = document.querySelector('#menuPuller');
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * @returns {boolean} Whether the menu is expanded.
     */
    function isMenuExpanded() {
        return menuPuller?.getAttribute('aria-expanded') == 'true';
    }

    /**
     * @returns {boolean} Whether the screen is larger than 1037px.
     */
    function isLargeScreen() {
        return window.visualViewport.width > 1037;
    }

    /**
     * The desired state of the menu when the screen is large.
     * (Small screens automatically hide the menu as normal.)
     * @type {boolean}
     */
    let desiredExpandedState = true;

    menuPuller.addEventListener('click', () => {
        if (!isLargeScreen()) return;

        // user manually clicked the menu puller,
        // so they want to change the menu state
        desiredExpandedState = isMenuExpanded();
    });

    window.addEventListener('resize', () => {
        if (!isLargeScreen()) return;

        // restore the menu to the desired state
        if (isMenuExpanded() !== desiredExpandedState) {
            menuPuller?.click();
        }
    });
})();
