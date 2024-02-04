/// Adds a new tab button when in a course iframe

// @ts-check

(async function() {
    'use strict';

    let main = document.querySelector('#main-content');
    while (!main) {
        await new Promise(resolve => setTimeout(resolve, 500));
        main = document.querySelector('#main-content');
    }

    /** Adds a new tab button below the close button on the iframe */
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

    /** Opens the current iframe's src in a new tab */
    function openIframeInNewTab() {
        const iframe = document.querySelector('.classic-learn-iframe');
        console.log('Opening iframe in new tab', iframe);
        if (!iframe) return;

        const url = iframe.getAttribute('src');
        if (!url) return;

        const newTab = window.open(url, '_blank');
        newTab?.focus();
    }

    /** Registers a middle click event listener on the course card */
    function registerMiddleClick() {
        /** @type {NodeListOf<HTMLDivElement>} */
        const courseCard = document.querySelectorAll('.course-element-card');
        courseCard.forEach(card => {
            card.onauxclick = e => {
                console.log('auxclick', e.button, e, card);
                if (e.button !== 1) return;

                e.preventDefault();
                e.stopPropagation();
                
                const courseId = card.getAttribute('data-course-id');
                if (!courseId) return;

                const url = `https://online.manchester.ac.uk/webapps/blackboard/execute/courseMain?course_id=${courseId}`;
                window.open(url, '_blank');
            };
        });
    }

    function onPageUpdate() {
        addNewTabButton();
        registerMiddleClick();
    }

    const observer = new MutationObserver(onPageUpdate);
    observer.observe(main, {
        childList: true,
        subtree: true,
    });
    onPageUpdate();
})();
