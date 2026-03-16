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
        
        // Pause on desktop hover
        const container = document.querySelector('.card-stack-container');
        if (container) {
            container.addEventListener('mouseenter', stopStackLoop);
            container.addEventListener('mouseleave', () => {
                if (!isStackPaused) startStackLoop();
            });
        }

        // Create and append overlay if it doesn't exist
        let overlay = document.querySelector('.card-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'card-overlay';
            document.body.appendChild(overlay);
        }

        // Card Flip Logic
        stackCards.forEach(card => {
            const toggleFlip = (forceClose = false) => {
                const isFlippingOpen = !card.classList.contains('flipped') && !forceClose;
                
                if (isFlippingOpen) {
                    stopStackLoop();
                    isStackPaused = true;
                    card.classList.add('flipped');
                    overlay.classList.add('active');
                    document.body.classList.add('no-scroll');
                } else {
                    card.classList.remove('flipped');
                    overlay.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    isStackPaused = false;
                    setTimeout(startStackLoop, 300);
                }
            };

            card.addEventListener('click', () => {
                if (card.classList.contains('card-front')) {
                    toggleFlip();
                }
            });

            overlay.addEventListener('click', () => {
                if (card.classList.contains('flipped')) {
                    toggleFlip(true);
                }
            });

            const closeBtn = card.querySelector('.close-details-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFlip(true);
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

    // Scroll Snapping Active Link logic
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainContainer = document.querySelector('.main-container');

    if (mainContainer) {
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
    }
    
    // Scroll-triggered Video Playback & Transition Sync
    const heroVideo = document.querySelector('.hero-video');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    let isHeroLocked = true;
    let videoThresholdPassed = false;
    let scrollPauseTimeout;
    let reverseInterval;

    const playHeroVideoForward = () => {
        if (reverseInterval) {
            clearInterval(reverseInterval);
            reverseInterval = null;
        }
        if (heroVideo && heroVideo.paused) {
            heroVideo.play().then(() => {
                if (scrollIndicator) scrollIndicator.classList.add('hidden');
            }).catch(err => console.log("Video play error:", err));
        }
        
        clearTimeout(scrollPauseTimeout);
        scrollPauseTimeout = setTimeout(() => {
            if (heroVideo) heroVideo.pause();
        }, 100);
    };

    const playHeroVideoReverse = () => {
        if (heroVideo) heroVideo.pause();
        if (scrollIndicator) scrollIndicator.classList.add('hidden');

        if (!reverseInterval) {
            reverseInterval = setInterval(() => {
                if (heroVideo && heroVideo.currentTime > 0.05) {
                    heroVideo.currentTime -= 0.05;
                } else if (heroVideo) {
                    heroVideo.currentTime = 0;
                    clearInterval(reverseInterval);
                    reverseInterval = null;
                    if (scrollIndicator) scrollIndicator.classList.remove('hidden');
                }
            }, 30);
        }

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
            if (scrollIndicator) scrollIndicator.classList.add('hidden');
            const playOnTouch = () => {
                if (heroVideo && heroVideo.paused) {
                    heroVideo.play().catch(e => console.log("Mobile tap-to-play prevented:", e));
                }
                document.removeEventListener('touchstart', playOnTouch);
                document.removeEventListener('click', playOnTouch);
            };
            document.addEventListener('touchstart', playOnTouch, { passive: true });
            document.addEventListener('click', playOnTouch);
        } else {
            window.addEventListener('wheel', (e) => {
                const scrollY = window.scrollY;
                const isAtTop = scrollY <= 10;
                
                if (isHeroLocked && e.deltaY > 0 && isAtTop) {
                    e.preventDefault();
                    playHeroVideoForward();

                    if (heroVideo.currentTime > (heroVideo.duration * 0.9)) {
                        videoThresholdPassed = true;
                        isHeroLocked = false;
                        document.querySelector('#about').scrollIntoView({ behavior: 'smooth' });
                    }
                } 
                else if (isAtTop && e.deltaY < 0) {
                    isHeroLocked = true;
                    videoThresholdPassed = false;
                    
                    if (heroVideo.currentTime > 0) {
                        e.preventDefault();
                        playHeroVideoReverse();
                    }
                }
            }, { passive: false });

            window.addEventListener('scroll', () => {
                if (isHeroLocked) {
                    if (window.scrollY > 10) {
                        playHeroVideoForward();
                        if (!videoThresholdPassed && heroVideo.currentTime < heroVideo.duration * 0.9) {
                            window.scrollTo(0, 0);
                        }
                    }
                }
            });

            heroVideo.addEventListener('timeupdate', () => {
                if (isHeroLocked && heroVideo.currentTime > (heroVideo.duration * 0.95)) {
                    videoThresholdPassed = true;
                    isHeroLocked = false;
                }
            });
        }
    }

});
