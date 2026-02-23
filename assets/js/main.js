/**
 * ============================================
 * WEB ATELIER (UDIT) - Student Project Template
 * ============================================
 * Main JavaScript: Scrollytelling Functionality
 * ============================================
 * PEDAGOGICAL NOTE: This file implements
 * scrollytelling with Intersection Observer API.
 * Progressive enhancement: site works without JS.
 * ============================================
 */

// ===== SHARED HEADER TEMPLATE LOADER =====
function getBasePath() {
	// Detect if we're in a subfolder like /educational/ or /editorial/
	const path = window.location.pathname;
	const inSubpage = path.includes('/educational/') || path.includes('/editorial/');
	return inSubpage ? '..' : '.';
}

function loadSharedHeader() {
	const host = document.querySelector('[data-include-header]');
	if (!host) return;

	const basePath = getBasePath();
	const headerPath = `${basePath}/assets/partials/header.html`;

	fetch(headerPath)
		.then((response) => response.text())
		.then((html) => {
			host.innerHTML = html;

			// Wire up nav links based on where we are
			document.querySelectorAll('.header-nav [data-nav-target]').forEach((link) => {
				const target = link.getAttribute('data-nav-target');
				if (!target) return;

				// On the main page, just use hash links; on subpages, link back to index.html
				const href = basePath === '.' ? `#${target}` : `${basePath}/index.html#${target}`;
				link.setAttribute('href', href);
			});

			// goes to home/top when clicking my name
			const homeLink = document.querySelector('.header-title [data-nav-home]');
			if (homeLink) {
				const homeHref = basePath === '.' ? '#top' : `${basePath}/index.html#top`;
				homeLink.setAttribute('href', homeHref);
			}
		})
		.catch((error) => {
			console.error('Error loading shared header template:', error);
		});
}

loadSharedHeader();

// ===== SHARED FOOTER TEMPLATE LOADER =====
function loadSharedFooter() {
	const host = document.querySelector('[data-include-footer]');
	if (!host) return;

	const basePath = getBasePath();
	const footerPath = `${basePath}/assets/partials/footer.html`;

	fetch(footerPath)
		.then((response) => response.text())
		.then((html) => {
			host.innerHTML = html;

			// Fix icon image paths relative to the current page
			host.querySelectorAll('[data-footer-src]').forEach((img) => {
				const rel = img.getAttribute('data-footer-src');
				if (!rel) return;
				img.setAttribute('src', `${basePath}/${rel}`);
			});

			// Fix contact link to point to the main page contact section when on subpages
			const contactLink = host.querySelector('[data-footer-contact]');
			if (contactLink) {
				const href = basePath === '.' ? '#contact' : `${basePath}/index.html#contact`;
				contactLink.setAttribute('href', href);
			}
		})
		.catch((error) => {
			console.error('Error loading shared footer template:', error);
		});
}

loadSharedFooter();

// ===== INTERSECTION OBSERVER FOR SCROLL-TRIGGERED ANIMATIONS =====
// PEDAGOGICAL NOTE: Modern, performant way to detect when elements
// enter viewport. Better than scroll event listeners.

const observerOptions = {
	threshold: 0.2, // Trigger when 20% of element is visible
	rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
};

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			// Element is visible, add 'visible' class to trigger CSS animations
			entry.target.classList.add('visible');

			// PEDAGOGICAL NOTE: Optional - stop observing after animation
			// Uncomment below if you want one-time animations only
			// observer.unobserve(entry.target);
		}
	});
}, observerOptions);

// Observe all sections with data-observe attribute
// PEDAGOGICAL NOTE: data-* attributes are semantic way to mark elements for JS
document.querySelectorAll('[data-observe]').forEach((section) => {
	observer.observe(section);
});

// ===== SCROLL PROGRESS INDICATOR =====
// PEDAGOGICAL NOTE: Shows user how far they've scrolled through the page

function updateScrollProgress() {
	const windowHeight = window.innerHeight;
	const documentHeight = document.documentElement.scrollHeight;
	const scrollTop = window.scrollY;

	// Calculate percentage scrolled
	const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

	// Update progress display
	const progressElement = document.getElementById('progress');
	if (progressElement) {
		progressElement.textContent = Math.round(scrollPercent);
	}
}

// Listen for scroll events (throttled by browser's requestAnimationFrame)
window.addEventListener('scroll', updateScrollProgress);

// Initialize on page load
updateScrollProgress();

// ===== HEADER BACKGROUND TOGGLE =====
// Transparent at top, solid background once main content starts

function updateHeaderBackground() {
	const header = document.querySelector('.site-header');
	if (!header) return;

	// Prefer #about on the main page; fall back to first story section on subpages
	const primarySection =
		document.getElementById('about') ||
		document.querySelector('.story-section');

	let triggerPoint;
	if (primarySection) {
		triggerPoint = primarySection.offsetTop - header.offsetHeight;
	} else {
		// If no content sections exist yet, make header solid after a small scroll
		triggerPoint = header.offsetHeight;
	}

	if (window.scrollY >= triggerPoint) {
		header.classList.add('site-header--solid');
	} else {
		header.classList.remove('site-header--solid');
	}
}

window.addEventListener('scroll', updateHeaderBackground);
updateHeaderBackground();

// ===== SCROLL TO TOP FUNCTION =====
// PEDAGOGICAL NOTE: Smooth scroll to top for better UX

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	});
}

// Make function available globally for onclick in HTML
// PEDAGOGICAL NOTE: In production, prefer addEventListener over onclick
window.scrollToTop = scrollToTop;

// ===== SMOOTH SCROLL BEHAVIOR =====
// PEDAGOGICAL NOTE: CSS scroll-behavior is simpler, but this works in all browsers

document.documentElement.style.scrollBehavior = 'smooth';

// ===== REDUCED MOTION PREFERENCE =====
// PEDAGOGICAL NOTE: Respect user's accessibility preferences
// If user prefers reduced motion, disable scroll animations

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	// Disable smooth scrolling
	document.documentElement.style.scrollBehavior = 'auto';

	// Optionally: add a class to body to disable CSS animations
	document.body.classList.add('reduce-motion');

	console.log('Reduced motion preference detected - animations disabled');
}

// ===== CONSOLE LOG FOR DEBUGGING =====
// PEDAGOGICAL NOTE: Helpful during development, remove in production

console.log('✅ Scrollytelling initialized');
console.log(`📊 Observing ${document.querySelectorAll('[data-observe]').length} sections`);
