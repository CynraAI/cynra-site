// Cynra Temporary Site - Animation Controller
// Handles fade-in animations and year setting

(function() {
    'use strict';

    // Set current year in footer
    function setCurrentYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // Check if user prefers reduced motion
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Initialize animations
    function initAnimations() {
        if (prefersReducedMotion()) {
            // Skip animations for users who prefer reduced motion
            const logo = document.getElementById('logo');
            const textContent = document.getElementById('textContent');
            const ctaSection = document.getElementById('ctaSection');

            if (logo) logo.classList.add('visible');
            if (textContent) textContent.classList.add('visible');
            if (ctaSection) ctaSection.classList.add('visible');
            return;
        }

        // Animation sequence
        const logo = document.getElementById('logo');
        const textContent = document.getElementById('textContent');
        const ctaSection = document.getElementById('ctaSection');

        if (!logo || !textContent || !ctaSection) {
            console.warn('Animation elements not found');
            return;
        }

        // Step 1: Logo fades in + scale (0ms delay, 700ms duration)
        setTimeout(() => {
            logo.classList.add('visible');
        }, 0);

        // Step 2: Text fades in after 400ms delay (350-450ms range, using 400ms)
        setTimeout(() => {
            textContent.classList.add('visible');
        }, 400);

        // Step 3: CTA appears after another 300ms delay (total ~700ms after text)
        setTimeout(() => {
            ctaSection.classList.add('visible');
        }, 1100);
    }

    // Initialize when DOM is ready
    function init() {
        setCurrentYear();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAnimations);
        } else {
            // DOM already loaded
            initAnimations();
        }
    }

    // Start initialization
    init();
})();

