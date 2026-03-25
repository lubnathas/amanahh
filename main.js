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
    const stackContainers = document.querySelectorAll('.card-stack-container');
    
    stackContainers.forEach(container => {
        const stackCards = Array.from(container.querySelectorAll('.stack-card'));
        let stackInterval;
        let isStackPaused = false;
        let isAnimating = false; // Strictly prevents blank holes in small card collections when rapidly clicked
        
        if (stackCards.length > 0) {
            // Initialize positions
            stackCards.forEach((card, index) => {
                if (index === 0) card.classList.add('card-front');
                else if (index === 1) card.classList.add('card-behind-1');
                else if (index === 2) card.classList.add('card-behind-2');
                else card.classList.add('card-hidden');
            });

            const animateStack = () => {
                // Ignore call if an animation is currently swiping to prevent missing "blank" pages
                if (isAnimating) return;
                isAnimating = true;
                
                // Get current positions locally from this container
                const frontCard = container.querySelector('.card-front');
                const behind1Card = container.querySelector('.card-behind-1');
                const behind2Card = container.querySelector('.card-behind-2');
                const hiddenCards = container.querySelectorAll('.card-hidden');

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
                        isAnimating = false; // Release lock for the next click seamlessly
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
                    // Make the Why Choose Us stack rotate slightly slower for comfortable reading
                    stackInterval = setInterval(animateStack, container.id === 'whyChooseStack' ? 2500 : 1500);
                }
            };

            const stopStackLoop = () => {
                if (stackInterval) {
                    clearInterval(stackInterval);
                    stackInterval = null;
                }
            };

            // Start continuous loop ONLY if it's visible, but we start it here and pause it if needed
            // If it's hidden under a button, it won't be seen anyway, but we start the loop
            if (window.getComputedStyle(container).display !== 'none') {
                startStackLoop();
            }

            // Listen for display changes (when know more is clicked)
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'style') {
                        if (window.getComputedStyle(container).display !== 'none') {
                            startStackLoop();
                        }
                    }
                });
            });
            observer.observe(container, { attributes: true });
            
            // Pause on desktop hover (optional, improves readability on mouse hover)
            container.addEventListener('mouseenter', stopStackLoop);
            container.addEventListener('mouseleave', () => {
                if (!isStackPaused) startStackLoop(); // Only restart if not locked open
            });

            // Card Flip Logic
            stackCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Check if this card has a backside
                    const hasBackInfo = card.querySelector('.card-back');

                    // If the card clicked is the front card (or within its stack position)
                    if (card.classList.contains('card-front')) {
                        if (hasBackInfo) {
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
                        } else {
                            // Single sided cards just immediately animate to the next slide on click
                            animateStack();
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
    });

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
    const aboutVideo = document.querySelector('.about-bg-video'); /* Retrieve the heavy why-choose-us video for explicit mobile controls */
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
        if (isMobileDeviceCheck()) {
            isHeroLocked = false;
            if (scrollIndicator) scrollIndicator.classList.add('hidden');

            // Listen for user tap to bypass generic blocks
            const playOnTouch = () => {
                if (heroVideo) {
                    heroVideo.playbackRate = 1.5; // Play a little fast on mobile devices
                    if (heroVideo.paused) {
                        heroVideo.play().catch(e => console.log("Hero Mobile tap-to-play prevented:", e));
                    }
                }
                if (aboutVideo && aboutVideo.paused) {
                    // Force the heavy Why Choose Us video to bypass iOS arbitrary autoplay rejection
                    aboutVideo.play().catch(e => console.log("About Mobile tap-to-play prevented:", e));
                }
                document.removeEventListener('touchstart', playOnTouch);
                document.removeEventListener('click', playOnTouch);
            };
            document.addEventListener('touchstart', playOnTouch, { passive: true });
            document.addEventListener('click', playOnTouch);
            
            // Critical Mobile iOS intersection observer: Constantly enforce playback when video enters viewport limits
            if ('IntersectionObserver' in window && aboutVideo) {
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (aboutVideo.paused) {
                                aboutVideo.play().catch(e => console.log("Explicit mobile observer play failed:", e));
                            }
                        } else {
                            aboutVideo.pause(); // Conserve battery by strictly pausing the 18MB video when scrolled away
                        }
                    });
                }, { threshold: 0.1 });
                videoObserver.observe(aboutVideo);
            }

            // Attempt to autoplay immediately just in case
            setTimeout(() => {
                if (heroVideo) {
                    heroVideo.playbackRate = 1.5; // Speed up ambient playback
                    if (heroVideo.paused) {
                        heroVideo.play().catch(e => console.log(e));
                    }
                }
                if (aboutVideo && aboutVideo.paused) {
                    aboutVideo.play().catch(e => console.log(e));
                }
            }, 100);

        } else {
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
    }
    // 'Click to know more' button logic
    const knowMoreBtn = document.getElementById('knowMoreBtn');
    const whyChooseStack = document.getElementById('whyChooseStack');
    const hideBundleBtn = document.getElementById('hideBundleBtn');
    
    if (knowMoreBtn && whyChooseStack) {
        knowMoreBtn.addEventListener('click', () => {
            knowMoreBtn.style.display = 'none';
            whyChooseStack.style.display = 'flex'; // Stack container relies on flex centering
            
            // Small delay to allow display to render before fading in opacity
            setTimeout(() => {
                whyChooseStack.style.opacity = '1';
                if(hideBundleBtn) hideBundleBtn.style.display = 'inline-block';
            }, 50);
        });
    }

    if (hideBundleBtn && knowMoreBtn && whyChooseStack) {
        hideBundleBtn.addEventListener('click', () => {
            whyChooseStack.style.opacity = '0';
            hideBundleBtn.style.display = 'none';
            
            // Wait for fade out, then completely restore original state
            setTimeout(() => {
                whyChooseStack.style.display = 'none';
                knowMoreBtn.style.display = 'block';
            }, 500);
        });
    }

    // Dynamic Sparkling Mouse Trail Effect
    let lastSparkleTime = 0;
    
    // Only add mouse sparkles on desktop to avoid weird tap/scroll artifacts on touch devices
    if (!isMobileDeviceCheck()) {
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            
            // Limit to 1 sparkle per 35ms (roughly ~30fps) to keep CPU usage low and transitions buttery smooth
            if (now - lastSparkleTime > 35) {
                lastSparkleTime = now;
                
                const sparkle = document.createElement('div');
                sparkle.classList.add('sparkle-particle');
                
                // Randomize trajectory (scatter out, predominantly falling down slightly)
                const tx = (Math.random() - 0.5) * 80; // Trajectory X
                const ty = (Math.random() - 0.2) * 80; // Trajectory Y
                
                // Set fixed position mapped exactly to the mouse tip
                sparkle.style.left = `${e.clientX}px`;
                sparkle.style.top = `${e.clientY}px`;
                
                // Pass random values to CSS variables for dynamic CSS animations
                sparkle.style.setProperty('--tx', `${tx}px`);
                sparkle.style.setProperty('--ty', `${ty}px`);
                
                // Randomize scale to make it feel organic and magical
                const baseSize = Math.random() * 4 + 3; // 3px to 7px dots
                sparkle.style.width = `${baseSize}px`;
                sparkle.style.height = `${baseSize}px`;
                
                document.body.appendChild(sparkle);
                
                // Auto garbage collect element from DOM after animation completes
                setTimeout(() => {
                    if (sparkle.parentNode) sparkle.remove();
                }, 750); // Matches the 0.7s CSS animation time plus slight buffer
            }
        });
    }

});
