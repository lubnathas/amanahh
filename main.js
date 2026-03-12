document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            
            // Toggle body scrolling when menu is open
            if (navLinksContainer.classList.contains('active')) {
                document.body.classList.add('no-scroll');
            } else {
                document.body.classList.remove('no-scroll');
            }
        });

        // Close menu when a link is clicked
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinksContainer.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Vision & Mission Reveal
    // Vertical Card Stack Animation
    const stackCards = Array.from(document.querySelectorAll('.stack-card'));
    let stackInterval;
    let isStackPaused = false;
    
    if (stackCards.length > 0) {
        // Initialize positions
        stackCards.forEach((card, index) => {
            if (index === 0) card.classList.add('card-front');
            else if (index === 1) card.classList.add('card-behind-1');
            else if (index === 2) card.classList.add('card-behind-2');
            else card.classList.add('card-hidden');
        });

        const animateStack = () => {
            // Get current positions
            const frontCard = document.querySelector('.card-front');
            const behind1Card = document.querySelector('.card-behind-1');
            const behind2Card = document.querySelector('.card-behind-2');
            const hiddenCards = document.querySelectorAll('.card-hidden');

            // 1. Swipe the front card up (left)
            if (frontCard) {
                frontCard.classList.remove('card-front');
                frontCard.classList.add('card-swiping');
                
                // After swipe finishes, move it to hidden at the back of the queue
                setTimeout(() => {
                    frontCard.classList.remove('card-swiping');
                    frontCard.classList.add('card-hidden');
                    // Force it to the end of the DOM to maintain order intuitively
                    frontCard.parentElement.appendChild(frontCard);
                }, 600); // matches CSS transition time
            }

            // 2. Move behind-1 to front
            if (behind1Card) {
                behind1Card.classList.remove('card-behind-1');
                behind1Card.classList.add('card-front');
            }

            // 3. Move behind-2 to behind-1
            if (behind2Card) {
                behind2Card.classList.remove('card-behind-2');
                behind2Card.classList.add('card-behind-1');
            }

            // 4. Bring the first hidden card into the behind-2 slot
            if (hiddenCards.length > 0) {
                const nextInLine = Array.from(hiddenCards).find(c => !c.classList.contains('card-swiping'));
                if (nextInLine) {
                    nextInLine.classList.remove('card-hidden');
                    nextInLine.classList.add('card-behind-2');
                }
            }
        };

        const startStackLoop = () => {
            if (!stackInterval) {
                stackInterval = setInterval(animateStack, 1500);
            }
        };

        const stopStackLoop = () => {
            if (stackInterval) {
                clearInterval(stackInterval);
                stackInterval = null;
            }
        };

        // Start continuous loop
        startStackLoop();
        
        // Pause on desktop hover (optional, improves readability on mouse hover)
        const container = document.querySelector('.card-stack-container');
        if (container) {
            container.addEventListener('mouseenter', stopStackLoop);
            container.addEventListener('mouseleave', () => {
                if (!isStackPaused) startStackLoop(); // Only restart if not locked open
            });
        }

        // Click/Touch Expansion Logic
        stackCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // If the card clicked is the front card
                if (card.classList.contains('card-front')) {
                    // If it's already expanded, shrink it and resume
                    if (card.classList.contains('expanded')) {
                        card.classList.remove('expanded');
                        isStackPaused = false;
                        startStackLoop();
                    } 
                    // Otherwise expand it and pause
                    else {
                        stopStackLoop();
                        isStackPaused = true;
                        
                        // Close any other expanded cards just in case
                        document.querySelectorAll('.expanded').forEach(c => c.classList.remove('expanded'));
                        
                        card.classList.add('expanded');
                    }
                }
            });

            // Close button click specifically
            const closeBtn = card.querySelector('.close-details-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Stop the card click from firing
                    card.classList.remove('expanded');
                    isStackPaused = false;
                    startStackLoop();
                });
            }
        });
    }

    // Smooth Scrolling for nav and buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Snapping Active Link logic (optional enhancement)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainContainer = document.querySelector('.main-container');

    mainContainer.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (mainContainer.scrollTop >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    
    // Scroll-triggered Video Playback & Transition Sync
    const heroVideo = document.querySelector('.hero-video');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    let isHeroLocked = true;
    let videoThresholdPassed = false;
    let scrollPauseTimeout;
    let reverseInterval;

    const playHeroVideoForward = () => {
        if (reverseInterval) {
            clearInterval(reverseInterval); // Stop reverse if playing
            reverseInterval = null;
        }
        if (heroVideo.paused) {
            heroVideo.play().then(() => {
                if (scrollIndicator) scrollIndicator.classList.add('hidden');
            }).catch(err => console.log("Video play error:", err));
        }
        
        // Strictly stop when scrolling stops (100ms gap)
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
            heroVideo.pause();
        }, 100);
    };

    const playHeroVideoReverse = () => {
        heroVideo.pause(); // Ensure native playback is stopped
        
        if (scrollIndicator) scrollIndicator.classList.add('hidden');

        // Only start the interval if it's not already running
        if (!reverseInterval) {
            reverseInterval = setInterval(() => {
                if (heroVideo.currentTime > 0.05) {
                    heroVideo.currentTime -= 0.05; // Step back by 50ms
                } else {
                    heroVideo.currentTime = 0;
                    clearInterval(reverseInterval);
                    reverseInterval = null;
                    if (scrollIndicator) scrollIndicator.classList.remove('hidden'); // Show indicator at start
                }
            }, 30); // Run roughly 33fps
        }

        // Stop reverse scrubbing when scrolling stops
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
            clearInterval(reverseInterval);
            reverseInterval = null;
        }, 100);
    };

    if (heroVideo) {
        const isMobileDevice = window.matchMedia("(max-width: 768px)").matches || 
                               ('ontouchstart' in window) || 
                               (navigator.maxTouchPoints > 0);

        if (isMobileDevice) {
            // Unrestricted playback for mobile devices
            heroVideo.play().catch(e => console.log("Mobile autoplay prevented:", e));
            mainContainer.style.scrollSnapType = 'y mandatory';
            if (scrollIndicator) scrollIndicator.classList.add('hidden');
        } else {
            // Prevent scroll snapping until video finishes once
            mainContainer.style.scrollSnapType = 'none';

            mainContainer.addEventListener('wheel', (e) => {
                // Check if user is at the very top of the page
                const isAtTop = mainContainer.scrollTop <= 10;
                
                // If at the top and scrolling down
                if (isHeroLocked && e.deltaY > 0 && isAtTop) {
                    e.preventDefault();
                    playHeroVideoForward();

                    // Unlock condition
                    if (heroVideo.currentTime > (heroVideo.duration * 0.9)) {
                        videoThresholdPassed = true;
                        isHeroLocked = false;
                        mainContainer.style.scrollSnapType = 'y mandatory';
                        document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
                    }
                } 
                // If at the top (or trying to scroll past top) and scrolling UP
                else if (isAtTop && e.deltaY < 0) {
                    // Re-lock the hero section so they can scrub backward
                    isHeroLocked = true;
                    videoThresholdPassed = false;
                    mainContainer.style.scrollSnapType = 'none'; // Disable snapping so they don't jump down
                    
                    if (heroVideo.currentTime > 0) {
                        e.preventDefault(); // Stop normal scrolling
                        playHeroVideoReverse();
                    }
                }
            }, { passive: false });

            // Backup for touch/drag scrolling
            mainContainer.addEventListener('scroll', () => {
                if (isHeroLocked) {
                    if (mainContainer.scrollTop > 10) {
                        playHeroVideoForward();
                        
                        // If they managed to scroll past the lock (e.g. mobile drag), snap them back if video not done
                        if (!videoThresholdPassed && heroVideo.currentTime < heroVideo.duration * 0.9) {
                            mainContainer.scrollTop = 0;
                        }
                    }
                }
            });

            // Event for video reaching end organically (fallback)
            heroVideo.addEventListener('timeupdate', () => {
                if (isHeroLocked && heroVideo.currentTime > (heroVideo.duration * 0.95)) {
                    videoThresholdPassed = true;
                    isHeroLocked = false;
                    mainContainer.style.scrollSnapType = 'y mandatory';
                }
            });
        }
    }

});
