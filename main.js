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

            // Waitlist already initialized in init()
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

        // Waitlist already initialized in init()
    }

    // Initialize Supabase client
    let supabaseClient = null;
    let supabaseEdgeFunctionUrl = null;

    function initSupabase() {
        if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.warn('[Cynra] Supabase not configured. Emails will only be stored locally.');
            return;
        }

        try {
            // Initialize Supabase client
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );

            // Construct Edge Function URL
            supabaseEdgeFunctionUrl = `${SUPABASE_CONFIG.url}/functions/v1/store-waitlist-email`;

            console.log('[Cynra] Supabase initialized successfully');
        } catch (err) {
            console.error('[Cynra] Failed to initialize Supabase:', err);
        }
    }

    // Store email in Supabase (encrypted via Edge Function)
    async function storeEmailInSupabase(email) {
        if (!supabaseEdgeFunctionUrl || !SUPABASE_CONFIG.anonKey) {
            throw new Error('Supabase not configured');
        }

        try {
            const response = await fetch(supabaseEdgeFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to store email');
            }

            return data;
        } catch (err) {
            console.error('[Cynra] Supabase storage error:', err);
            throw err;
        }
    }

    // Store email submissions in localStorage (backup/client-side log)
    function logWaitlistEmail(email) {
        try {
            const key = 'cynra_waitlist_log';
            const existingRaw = window.localStorage.getItem(key);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];

            const entry = {
                email,
                timestamp: new Date().toISOString()
            };

            existing.push(entry);
            window.localStorage.setItem(key, JSON.stringify(existing));

            // Also log to console for quick inspection during development
            // eslint-disable-next-line no-console
            console.log('[Cynra waitlist] Logged email locally:', entry);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Unable to log waitlist email locally', err);
        }
    }

    // Waitlist / "Get updates" interactions
    function initWaitlist() {
        // Use a small delay to ensure DOM is fully ready
        setTimeout(() => {
            const getUpdatesButton = document.getElementById('getUpdatesButton');
            const waitlistForm = document.getElementById('waitlistForm');
            const waitlistEmail = document.getElementById('waitlistEmail');
            const waitlistMessage = document.getElementById('waitlistMessage');

            if (!getUpdatesButton || !waitlistForm || !waitlistEmail || !waitlistMessage) {
                console.error('[Cynra] Waitlist elements not found:', {
                    button: !!getUpdatesButton,
                    form: !!waitlistForm,
                    email: !!waitlistEmail,
                    message: !!waitlistMessage
                });
                return;
            }

            // Initially hide form & message
            waitlistForm.style.display = 'none';
            waitlistMessage.textContent = '';

            // Ensure button is clickable - override parent's pointer-events
            getUpdatesButton.style.pointerEvents = 'auto';
            getUpdatesButton.style.cursor = 'pointer';
            getUpdatesButton.style.position = 'relative';
            getUpdatesButton.style.zIndex = '10';

            // Test if button is clickable
            console.log('[Cynra] Setting up button click handler');

            getUpdatesButton.addEventListener('click', function(e) {
                console.log('[Cynra] Button clicked!');
                e.preventDefault();
                e.stopPropagation();
                getUpdatesButton.style.display = 'none';
                waitlistForm.style.display = 'flex';
                waitlistEmail.focus();
            }, true); // Use capture phase

            // Also try mousedown as fallback
            getUpdatesButton.addEventListener('mousedown', function(e) {
                console.log('[Cynra] Button mousedown!');
                e.preventDefault();
                getUpdatesButton.style.display = 'none';
                waitlistForm.style.display = 'flex';
                setTimeout(() => waitlistEmail.focus(), 100);
            });

            // Form submit handler
            waitlistForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const emailValue = (waitlistEmail.value || '').trim();
                const submitButton = waitlistForm.querySelector('.waitlist-submit');

                // Very lightweight email check
                if (!emailValue || !emailValue.includes('@')) {
                    waitlistMessage.textContent = 'Please enter a valid email address.';
                    waitlistMessage.classList.add('waitlist-message--error');
                    return;
                }

                // Clear any previous error state
                waitlistMessage.classList.remove('waitlist-message--error');

                // Disable submit button and show loading state
                if (submitButton) {
                    submitButton.disabled = true;
                    const originalText = submitButton.textContent;
                    submitButton.textContent = 'Saving...';
                }

                try {
                    // Try to store in Supabase (encrypted)
                    if (supabaseClient && supabaseEdgeFunctionUrl) {
                        try {
                            await storeEmailInSupabase(emailValue);
                            console.log('[Cynra] Email stored in Supabase successfully');
                        } catch (supabaseError) {
                            console.warn('[Cynra] Supabase storage failed, falling back to local storage:', supabaseError);
                            // Fall back to local storage if Supabase fails
                            logWaitlistEmail(emailValue);
                        }
                    } else {
                        // Supabase not configured, use local storage
                        logWaitlistEmail(emailValue);
                    }

                    // Show success message
                    waitlistForm.style.display = 'none';
                    waitlistMessage.textContent = 'Thanks — we\'ll send you updates when Cynra launches.';

                } catch (error) {
                    console.error('[Cynra] Error storing email:', error);
                    waitlistMessage.textContent = 'Something went wrong. Please try again.';
                    waitlistMessage.classList.add('waitlist-message--error');
                    
                    // Re-enable submit button
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Notify me';
                    }
                }
            });
        }, 100);
    }

    // Legal tab interactions
    function initLegalTab() {
        const closeButton = document.querySelector('[data-close-legal]');
        const legalTab = document.querySelector('.legal-tab');
        const legalTrigger = document.querySelector('.legal-tab-trigger');

        if (!closeButton || !legalTab || !legalTrigger) {
            return;
        }

        closeButton.addEventListener('click', () => {
            if (legalTab.hasAttribute('open')) {
                legalTrigger.click();
            }

            legalTrigger.focus();
        });
    }

    // Animate <details> open/close for legal sections
    function initDetailsAnimations() {
        if (prefersReducedMotion()) {
            return;
        }

        const detailsElements = document.querySelectorAll('.legal-tab, .legal-item');

        function setExpandedState(summary, isExpanded) {
            summary.setAttribute('aria-expanded', String(isExpanded));
        }

        function getOrCreateContentWrapper(details, summary) {
            let content = details.querySelector(':scope > .details-animated-content');
            if (content) {
                return content;
            }

            content = document.createElement('div');
            content.className = 'details-animated-content';

            let nextNode = summary.nextSibling;
            while (nextNode) {
                const currentNode = nextNode;
                nextNode = nextNode.nextSibling;
                content.appendChild(currentNode);
            }

            details.appendChild(content);
            return content;
        }

        function animateDetails(details, summary, content, shouldOpen) {
            const existingEnd = content._detailsTransitionEnd;
            if (existingEnd) {
                content.removeEventListener('transitionend', existingEnd);
                content._detailsTransitionEnd = null;
            }

            if (!shouldOpen) {
                content.style.transition = 'none';
                content.style.willChange = '';
                content.style.overflow = 'hidden';
                const currentHeight = content.getBoundingClientRect().height;
                content.style.height = `${currentHeight}px`;
                void content.offsetHeight;
                content.style.height = '0px';
                content.style.opacity = '0';
                details.removeAttribute('open');
                content.style.transition = '';
                content.style.overflow = '';
                return;
            }

            const duration = 260;
            const easing = 'cubic-bezier(0.2, 0.65, 0.25, 1)';
            const currentHeight = content.getBoundingClientRect().height;

            content.style.overflow = 'hidden';
            content.style.willChange = 'height, opacity';
            content.style.transition = 'none';
            content.style.height = `${currentHeight}px`;
            content.style.opacity = '0';

            details.setAttribute('open', '');

            // Force style flush so the transition can run
            void content.offsetHeight;

            const targetHeight = content.scrollHeight;
            content.style.transition = `height ${duration}ms ${easing}, opacity ${duration - 30}ms ease`;
            content.style.height = `${targetHeight}px`;
            content.style.opacity = '1';

            const onTransitionEnd = (event) => {
                if (event.propertyName !== 'height') {
                    return;
                }

                content.style.height = 'auto';
                content.style.transition = '';
                content.style.willChange = '';
                content.style.overflow = '';
                content.removeEventListener('transitionend', onTransitionEnd);
                content._detailsTransitionEnd = null;
            };

            content._detailsTransitionEnd = onTransitionEnd;
            content.addEventListener('transitionend', onTransitionEnd);
        }

        detailsElements.forEach((details) => {
            const summary = details.querySelector(':scope > summary');
            if (!summary) {
                return;
            }

            const content = getOrCreateContentWrapper(details, summary);
            const isOpen = details.hasAttribute('open');

            content.style.overflow = 'hidden';
            content.style.height = isOpen ? 'auto' : '0px';
            content.style.opacity = isOpen ? '1' : '0';
            setExpandedState(summary, isOpen);

            summary.addEventListener('click', (event) => {
                event.preventDefault();
                const shouldOpen = !details.hasAttribute('open');
                setExpandedState(summary, shouldOpen);
                animateDetails(details, summary, content, shouldOpen);

                if (shouldOpen && details.classList.contains('legal-tab')) {
                    setTimeout(() => {
                        details.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 70);
                }
            });
        });
    }

    // Initialize when DOM is ready
    function init() {
        setCurrentYear();
        
        // Initialize Supabase
        initSupabase();
        
        // Initialize waitlist functionality immediately (doesn't depend on animations)
        // This ensures the button works even if animations haven't completed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initWaitlist();
                initLegalTab();
                initDetailsAnimations();
                initAnimations();
            });
        } else {
            // DOM already loaded
            initWaitlist();
            initLegalTab();
            initDetailsAnimations();
            initAnimations();
        }
    }

    // Start initialization
    init();
})();

