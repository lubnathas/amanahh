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

        // Card Flip Logic
        stackCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // If the card clicked is the front card (or within its stack position)
                if (card.classList.contains('card-front')) {
                    // Toggle flip
                    if (card.classList.contains('flipped')) {
                        card.classList.remove('flipped');
                        isStackPaused = false;
                        startStackLoop();
                    } else {
                        stopStackLoop();
                        isStackPaused = true;
                        
                        // Flip this card
                        card.classList.add('flipped');
                    }
                }
            });

            // Close button specifically
            const closeBtn = card.querySelector('.close-details-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    card.classList.remove('flipped');
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

    const isMobileDeviceCheck = () => window.innerWidth <= 768 || ('ontouchstart' in window);

    const playHeroVideoForward = () => {
        if (reverseInterval) {
            clearInterval(reverseInterval); // Stop reverse if playing
            reverseInterval = null;
        }
        if (heroVideo) {
            // Use 5.0 speed for ultra-snappy mobile unlocking, 2.5 for desktop
            heroVideo.playbackRate = isMobileDeviceCheck() ? 5.0 : 2.5; 
            if (heroVideo.paused) {
                heroVideo.play().then(() => {
                    if (scrollIndicator) scrollIndicator.classList.add('hidden');
                }).catch(err => console.log("Video play error:", err));
            }
        }
        
        // Strictly stop when scrolling stops (150ms gap for smoother feel)
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
            if (heroVideo) {
                heroVideo.pause();
                heroVideo.playbackRate = 1.0; // Reset for any organic playback
            }
        }, 150);
    };

    const playHeroVideoReverse = () => {
        if (heroVideo) {
            heroVideo.pause(); // Ensure native playback is stopped
            heroVideo.playbackRate = 1.0;
        }
        
        if (scrollIndicator) scrollIndicator.classList.add('hidden');

        // Only start the interval if it's not already running
        if (!reverseInterval) {
            reverseInterval = setInterval(() => {
                // significantly faster scrubbing speed for mobile for snappy response
                const scrubSpeed = isMobileDeviceCheck() ? 0.4 : 0.2;
                if (heroVideo && heroVideo.currentTime > scrubSpeed) {
                    heroVideo.currentTime -= scrubSpeed; 
                } else if (heroVideo) {
                    heroVideo.currentTime = 0;
                    clearInterval(reverseInterval);
                    reverseInterval = null;
                    if (scrollIndicator) scrollIndicator.classList.remove('hidden'); // Show indicator at start
                }
            }, 16); // 60fps for maximum smoothness
        }

        // Stop reverse scrubbing when scrolling stops
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
            clearInterval(reverseInterval);
            reverseInterval = null;
        }, 150);
    };

    if (heroVideo) {
        let touchStartY = 0;

        // Fallback for native autoplay restrictions on mobile
        const playOnTouch = () => {
            if (heroVideo && heroVideo.paused && heroVideo.currentTime === 0) {
                heroVideo.play().then(() => heroVideo.pause()).catch(e => console.log("Init play prevented:", e));
            }
            document.removeEventListener('touchstart', playOnTouch);
            document.removeEventListener('click', playOnTouch);
        };
        document.addEventListener('touchstart', playOnTouch, { passive: true });
        document.addEventListener('click', playOnTouch);

        const handleScrollInteraction = (deltaY, e) => {
            const scrollY = window.scrollY;
            const isAtTop = scrollY <= 10;
            
            // If at the top and scrolling down (or swiping up)
            if (isHeroLocked && deltaY > 0 && isAtTop) {
                if(e && e.cancelable) e.preventDefault();
                playHeroVideoForward();

                // Unlock condition
                if (heroVideo.currentTime > (heroVideo.duration * 0.9)) {
                    videoThresholdPassed = true;
                    isHeroLocked = false;
                    document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
                }
            } 
            // If at the top and scrolling UP (or swiping down)
            else if (isAtTop && deltaY < 0) {
                isHeroLocked = true;
                videoThresholdPassed = false;
                
                if (heroVideo.currentTime > 0) {
                    if(e && e.cancelable) e.preventDefault(); // Stop normal scrolling back up
                    playHeroVideoReverse();
                }
            }
        };

        window.addEventListener('wheel', (e) => {
            handleScrollInteraction(e.deltaY, e);
        }, { passive: false });

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            const touchEndY = e.touches[0].clientY;
            const deltaY = touchStartY - touchEndY; // Positive means swiping up (scrolling down the content)
            
            // Add slight threshold to prevent micro-jitters
            if (Math.abs(deltaY) > 2) {
                handleScrollInteraction(deltaY, e);
                // Update touch start to allow continuous scrubbing rather than a single burst
                touchStartY = touchEndY; 
            }
        }, { passive: false });

        // Backup for scroll/drag events bypassing listeners
        window.addEventListener('scroll', () => {
            if (isHeroLocked) {
                if (window.scrollY > 10) {
                    playHeroVideoForward();
                    
                    if (!videoThresholdPassed && heroVideo.currentTime < heroVideo.duration * 0.9) {
                        window.scrollTo(0, 0); // Snap back
                    }
                }
            }
        });

        // Event for video reaching end organically (fallback)
        heroVideo.addEventListener('timeupdate', () => {
            if (isHeroLocked && heroVideo.currentTime > (heroVideo.duration * 0.95)) {
                videoThresholdPassed = true;
                isHeroLocked = false;
            }
        });
    }

});
