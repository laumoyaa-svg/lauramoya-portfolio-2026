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
	// Detect if we're in a subfolder like /educational/, /editorial/ or /projects/
	const path = window.location.pathname;
	const inSubpage =
		path.includes('/educational/') ||
		path.includes('/editorial/') ||
		path.includes('/projects/');
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

			// Wire up nav links (desktop + mobile overlay) based on where we are
			host.querySelectorAll('[data-nav-target]').forEach((link) => {
				const target = link.getAttribute('data-nav-target');
				if (!target) return;

				// On the main page, just use hash links; on subpages, link back to index.html
				const href = basePath === '.' ? `#${target}` : `${basePath}/index.html#${target}`;
				link.setAttribute('href', href);
			});

			// goes to home/top when clicking my name or "Top of the Page" in overlay
			host.querySelectorAll('[data-nav-home]').forEach((homeLink) => {
				const homeHref = basePath === '.' ? '#top' : `${basePath}/index.html#top`;
				homeLink.setAttribute('href', homeHref);
			});

			// Links to dedicated project subpages (Editorial / Educational)
			host.querySelectorAll('[data-nav-page]').forEach((link) => {
				const page = link.getAttribute('data-nav-page');
				if (!page) return;

				const href = `${basePath}/${page}/index.html`;
				link.setAttribute('href', href);
			});

			// Mobile hamburger → overlay menu behavior
			const toggleButton = host.querySelector('#navbar-toggle');
			const closeButton = host.querySelector('#navbar-close');
			const overlay = host.querySelector('#navbar-menu');

			if (toggleButton && overlay) {
				const openMenu = () => {
					overlay.classList.add('active');
					overlay.setAttribute('aria-hidden', 'false');
					toggleButton.setAttribute('aria-expanded', 'true');
					document.body.style.overflow = 'hidden';
				};

				const closeMenu = () => {
					overlay.classList.remove('active');
					overlay.setAttribute('aria-hidden', 'true');
					toggleButton.setAttribute('aria-expanded', 'false');
					document.body.style.overflow = '';
				};

				toggleButton.addEventListener('click', () => {
					if (overlay.classList.contains('active')) {
						closeMenu();
					} else {
						openMenu();
					}
				});

				if (closeButton) {
					closeButton.addEventListener('click', closeMenu);
				}

				// Close menu when clicking any overlay link
				overlay.querySelectorAll('a').forEach((link) => {
					link.addEventListener('click', closeMenu);
				});

				// Close on ESC key
				document.addEventListener('keydown', (event) => {
					if (event.key === 'Escape' && overlay.classList.contains('active')) {
						closeMenu();
					}
				});
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

// ===== BACK TO TOP BUTTON VISIBILITY =====
// Appears after the hero / first main section

const backToTopButton = document.createElement('button');
backToTopButton.className = 'back-to-top';
backToTopButton.type = 'button';
backToTopButton.setAttribute('aria-label', 'Back to top');
backToTopButton.innerHTML = '<span>↑</span>';

document.body.appendChild(backToTopButton);
backToTopButton.addEventListener('click', scrollToTop);

function getBackToTopTriggerOffset() {
	const hero = document.querySelector('.hero');
	if (hero) {
		return hero.offsetHeight;
	}

	const primarySection =
		document.getElementById('about') ||
		document.querySelector('.story-section') ||
		document.querySelector('.editorial-project') ||
		document.querySelector('.educational-project');

	if (primarySection) {
		return primarySection.offsetTop;
	}

	return window.innerHeight;
}

function updateBackToTopVisibility() {
	if (!backToTopButton) return;

	const triggerOffset = getBackToTopTriggerOffset();
	if (window.scrollY > triggerOffset) {
		backToTopButton.classList.add('back-to-top--visible');
	} else {
		backToTopButton.classList.remove('back-to-top--visible');
	}
}

window.addEventListener('scroll', updateBackToTopVisibility);
updateBackToTopVisibility();

// ===== CONSOLE LOG FOR DEBUGGING =====
// PEDAGOGICAL NOTE: Helpful during development, remove in production

console.log('✅ Scrollytelling initialized');
console.log(`📊 Observing ${document.querySelectorAll('[data-observe]').length} sections`);

// ===== PROJECT CARD CLICK BEHAVIOR =====
// Make the whole project card clickable, not just the inner link
function setupProjectCardClicks() {
	const editorialCard = document.getElementById('editorial');
	const educationalCard = document.getElementById('educational');

	if (editorialCard) {
		editorialCard.style.cursor = 'pointer';
		editorialCard.addEventListener('click', (event) => {
			// Let native link clicks behave normally
			const tag = event.target.tagName.toLowerCase();
			if (tag === 'a' || tag === 'button') return;
			window.location.href = 'editorial/index.html';
		});
	}

	if (educationalCard) {
		educationalCard.style.cursor = 'pointer';
		educationalCard.addEventListener('click', (event) => {
			const tag = event.target.tagName.toLowerCase();
			if (tag === 'a' || tag === 'button') return;
			window.location.href = 'educational/index.html';
		});
	}
}

setupProjectCardClicks();

document.querySelectorAll(".slider").forEach(slider => {
  const slides = slider.querySelectorAll(".slide");
  const next = slider.querySelector(".next");
  const prev = slider.querySelector(".prev");

  let index = 0;

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[i].classList.add("active");
  }

  next.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  prev.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });
});
