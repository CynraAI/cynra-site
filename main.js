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

            // Still wire up CTA interactions
            initWaitlist();
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

        // Step 1: Wait for logo to load, then show it with a slight delay
        function showLogoWhenReady() {
            const logoDelay = 500; // ms after page is ready before logo appears
            const textDelayAfterLogo = 800; // ms after logo
            const ctaDelayAfterLogo = 1100; // ms after logo

            if (logo.complete && logo.naturalHeight !== 0) {
                // Logo already loaded - still wait a bit so background shows first
                setTimeout(() => {
                    logo.classList.add('visible');

                    // Step 2: Text fades in after a delay (after logo is visible)
                    setTimeout(() => {
                        textContent.classList.add('visible');
                    }, textDelayAfterLogo);

                    // Step 3: CTA appears after another delay
                    setTimeout(() => {
                        ctaSection.classList.add('visible');
                    }, ctaDelayAfterLogo);
                }, logoDelay);
            } else {
                // Wait for logo to load
                logo.addEventListener('load', () => {
                    setTimeout(() => {
                        logo.classList.add('visible');

                        // Step 2: Text fades in after a delay (after logo is visible)
                        setTimeout(() => {
                            textContent.classList.add('visible');
                        }, textDelayAfterLogo);

                        // Step 3: CTA appears after another delay
                        setTimeout(() => {
                            ctaSection.classList.add('visible');
                        }, ctaDelayAfterLogo);
                    }, logoDelay);
                });
                // Fallback: if image fails to load or takes too long, show after 1 second
                setTimeout(() => {
                    if (!logo.classList.contains('visible')) {
                        setTimeout(() => {
                            logo.classList.add('visible');

                            setTimeout(() => {
                                textContent.classList.add('visible');
                            }, textDelayAfterLogo);

                            setTimeout(() => {
                                ctaSection.classList.add('visible');
                            }, ctaDelayAfterLogo);
                        }, logoDelay);
                    }
                }, 1000);
            }
        }

        showLogoWhenReady();

        // Set up waitlist CTA interactions
        initWaitlist();
    }

    // Waitlist / "Get updates" interactions
    function initWaitlist() {
        const getUpdatesButton = document.getElementById('getUpdatesButton');
        const waitlistForm = document.getElementById('waitlistForm');
        const waitlistEmail = document.getElementById('waitlistEmail');
        const waitlistMessage = document.getElementById('waitlistMessage');

        if (!getUpdatesButton || !waitlistForm || !waitlistEmail || !waitlistMessage) {
            return;
        }

        // Initially hide form & message
        waitlistForm.style.display = 'none';
        waitlistMessage.textContent = '';

        getUpdatesButton.addEventListener('click', () => {
            getUpdatesButton.style.display = 'none';
            waitlistForm.style.display = 'flex';
            waitlistEmail.focus();
        });

        waitlistForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailValue = (waitlistEmail.value || '').trim();

            // Very lightweight email check
            if (!emailValue || !emailValue.includes('@')) {
                waitlistMessage.textContent = 'Please enter a valid email address.';
                waitlistMessage.classList.add('waitlist-message--error');
                return;
            }

            // Clear any previous error state
            waitlistMessage.classList.remove('waitlist-message--error');

            // Simulate successful subscription (you can hook this to a real backend later)
            waitlistForm.style.display = 'none';
            waitlistMessage.textContent = 'Thanks — we\'ll send you updates when Cynra launches.';
        });
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

