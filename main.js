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

            // Hide logo immediately for reduced motion users
            if (logo) {
                logo.classList.add('hidden');
            }
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

        // Step 1: Wait for logo to load, then show it with a slight delay
        function showLogoWhenReady() {
            const logoDelay = 300; // ms after page is ready before logo appears
            const logoDisplayDuration = 2000; // ms logo stays visible before fading out
            const logoFadeOutDuration = 700; // ms for logo fade out
            const textDelayAfterLogoFade = 300; // ms after logo fades out before text appears
            const ctaDelayAfterText = 300; // ms after text appears before CTA appears

            function startAnimationSequence() {
                // Step 1: Show logo
                setTimeout(() => {
                    logo.classList.add('visible');

                    // Step 2: After logo displays, fade it out
                    setTimeout(() => {
                        logo.classList.remove('visible');
                        logo.classList.add('hidden');

                        // Step 3: After logo fades out, show text
                        setTimeout(() => {
                            textContent.classList.add('visible');

                            // Step 4: Show CTA after text
                            setTimeout(() => {
                                ctaSection.classList.add('visible');
                            }, ctaDelayAfterText);
                        }, textDelayAfterLogoFade);
                    }, logoDisplayDuration);
                }, logoDelay);
            }

            if (logo.complete && logo.naturalHeight !== 0) {
                // Logo already loaded
                startAnimationSequence();
            } else {
                // Wait for logo to load
                logo.addEventListener('load', () => {
                    startAnimationSequence();
                });
                // Fallback: if image fails to load or takes too long, start after 1 second
                setTimeout(() => {
                    if (!logo.classList.contains('visible') && !logo.classList.contains('hidden')) {
                        startAnimationSequence();
                    }
                }, 1000);
            }
        }

        showLogoWhenReady();

    }

    // Initialize when DOM is ready
    function init() {
        setCurrentYear();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAnimations);
        } else {
            initAnimations();
        }
    }

    // Start initialization
    init();
})();

