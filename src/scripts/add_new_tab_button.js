/// Adds a new tab button when in a course iframe

// @ts-check

(async function() {
    'use strict';

    let main = document.querySelector('#main-content');
    while (!main) {
        await new Promise(resolve => setTimeout(resolve, 500));
        main = document.querySelector('#main-content');
    }

    function addNewTabButton() {
        const btnContainer = document.querySelector('.bb-close-offset');
        const closeBtn = btnContainer?.querySelector('.bb-close');
        /** @type {HTMLButtonElement | null | undefined} */
        let newBtn = btnContainer?.querySelector('.bb-new-tab');

        if (!btnContainer || !closeBtn) return;

        // If the button already exists, do nothing
        if (newBtn) {
            newBtn.onclick = openIframeInNewTab;
            return;
        }
    
        newBtn = document.createElement('button');
        newBtn.classList.add('bb-new-tab');
        newBtn.setAttribute('aria-label', 'Open in new tab');
        newBtn.setAttribute('title', 'Open in new tab');
        newBtn.onclick = openIframeInNewTab;
        btnContainer.appendChild(newBtn);

        console.log('addNewTabButton added', newBtn);
    }

    function openIframeInNewTab() {
        const iframe = document.querySelector('.classic-learn-iframe');
        console.log('Opening iframe in new tab', iframe);
        if (!iframe) return;

        const url = iframe.getAttribute('src');
        if (!url) return;

        const newTab = window.open(url, '_blank');
        newTab?.focus();
    }

    const observer = new MutationObserver(addNewTabButton);
    observer.observe(main, { childList: true });
    addNewTabButton();
})();
