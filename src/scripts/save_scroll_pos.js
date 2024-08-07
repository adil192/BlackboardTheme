// Saves your scroll position,
// and highlights the current chapter in the table of contents.

// @ts-check

/** Last page element scrolled into view @type {Element | null} */
let lastPAtTop = null;

/** Last heading element scrolled into view @type {Element | null} */
let lastHAtTop = null;

/** The scrolling element @type {HTMLDivElement | null} */
let scrollElem = null;

/** The parent of the <p>s and <h3>s that form the main content @type {HTMLDivElement | null} */
let contentElem = null;

/** The table of contents sidebar @type {HTMLUListElement | null} */
let tocElem = null;

/**
 * Whether the page has loaded fully yet.
 * Don't save the scroll position until the page has loaded.
 * @type {boolean}
 */
let pageLoaded = false;

/**
 * Finds the html elements
 * @returns {Promise<void>}
 */
async function findElements() {
	if (scrollElem && contentElem && tocElem) return;

	scrollElem = document.querySelector('div#scroll-wrapper');
	contentElem = document.querySelector('div#leanpub-main');
	tocElem = document.querySelector('#leanpub-toc ul.toc');

	console.log('findElements', { scrollElem, contentElem, tocElem });

	if (!scrollElem || !contentElem || !tocElem) {
		// wait a bit and try again
		await new Promise(resolve => setTimeout(resolve, 100));
		return await findElements();
	}
}

/**
 * When a link appends a hash to the URL, scroll to the element with that ID
 * and remove the hash from the URL.
 * @param {HashChangeEvent} e
 */
function onHashChange(e) {
	const hash = e.newURL.substring(e.newURL.indexOf('#') + 1);
	if (hash) document.getElementById(hash)?.scrollIntoView();

	// remove the hash from the URL
	history.replaceState({}, document.title, window.location.pathname + window.location.search);
}

function onScroll() {
	if (!pageLoaded) return;
	if (!scrollElem || !contentElem || !tocElem) return;

	// find p element that is scrolled into view
	const paragraphs = Array.from(contentElem.querySelectorAll('p, h1, h2, h3, h4, h5, h6'));
	const pAtTop = paragraphs.find(child => {
		const rect = child.getBoundingClientRect();
		return rect.top >= 0;
	});
	// set lastScrolledContent to the p element that is scrolled into view
	if (pAtTop && pAtTop !== lastPAtTop) {
		console.log('pAtTop', pAtTop);
		lastPAtTop = pAtTop;
	}

	// find h3 element that is scrolled into view
	const headings = Array.from(contentElem.querySelectorAll('h1, h2, h3, h4, h5, h6'));
	const hAtTop = headings.find(child => {
		const rect = child.getBoundingClientRect();
		return rect.top >= 0;
	});
	if (hAtTop && hAtTop !== lastHAtTop) {
		lastHAtTop = hAtTop;

		if (!scrollElem || !contentElem || !tocElem) return;

		// highlight the matching toc element
		const sectionNumber = hAtTop.querySelector('span.section-number')?.textContent?.trim() ?? '';
		const allTocItems = Array.from(tocElem.querySelectorAll('li a'));
		const tocItem = allTocItems.find(item => {
			return item.querySelector('span.section-number')?.textContent?.trim() === sectionNumber;
		});
		if (tocItem) {
			// remove all highlights
			allTocItems.forEach(item => item.classList.remove('highlight'));
			// highlight the matching toc element
			tocItem.classList.add('highlight');
			tocItem.scrollIntoView();
		}

		// save current section
		if (sectionNumber) {
			console.log('Saving last section to', sectionNumber);
			localStorage.setItem('lastSection', sectionNumber);
		}
	}
}

(function () {
	'use strict';

	findElements().then(() => {
		if (!scrollElem || !contentElem || !tocElem) return;

		scrollElem.addEventListener('scroll', onScroll, { passive: true });

		window.addEventListener('resize', () => {
			// restore scroll to the lastScrolledContent
			if (lastPAtTop) {
				lastPAtTop.scrollIntoView();
			}
		});
	});

	// restore last section from local storage
	window.addEventListener('load', () => {
		findElements().then(async () => {
			if (!scrollElem || !contentElem || !tocElem) return;
			const lastSection = localStorage.getItem('lastSection');
			console.log('Restoring last section to', lastSection);
			if (lastSection) {
				const headings = Array.from(contentElem.querySelectorAll('h1, h2, h3, h4, h5, h6'));
				const lastSectionHeading = headings.find(child => {
					const sectionNumber = child.querySelector('span.section-number')?.textContent?.trim() ?? '';
					return sectionNumber === lastSection;
				});
				const tocItems = Array.from(tocElem.querySelectorAll('li a'));
				const tocItem = tocItems.find(item => {
					return item.querySelector('span.section-number')?.textContent?.trim() === lastSection;
				});
				if (lastSectionHeading) {
					lastPAtTop = lastSectionHeading;
					lastHAtTop = lastSectionHeading;
					lastSectionHeading.scrollIntoView();
				}
				if (tocItem) {
					tocItem.classList.add('highlight');
					tocItem.scrollIntoView();
				}
			}
			pageLoaded = true;
		});

		window.addEventListener('hashchange', onHashChange, { passive: true });
	}, { passive: true });
})();
