// Função para verificar se um elemento está visível na viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
        rect.bottom >= 0
    );
}

// Função para aplicar animações aos elementos quando ficarem visíveis
function handleScrollAnimations() {
    // Animar seções
    const sections = document.querySelectorAll('#projects, #about, #contact');
    sections.forEach(section => {
        if (isElementInViewport(section)) {
            section.classList.add('visible');
        }
    });
    
    // Animar cards de projetos com atraso sequencial
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        if (isElementInViewport(card)) {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100); // Cada card aparece com um atraso de 100ms em relação ao anterior
        }
    });
}

// Ensure the Supabase client is properly available globally
document.addEventListener('DOMContentLoaded', function() {
    // Attempt to initialize Supabase if not already done
    try {
        if (typeof supabase !== 'undefined' && !window.supabase) {
            window.supabase = supabase;
            console.log('Supabase client made available globally');
        }
    } catch (error) {
        console.error('Error setting up Supabase client:', error);
    }
});

// Aplicar animações durante o scroll
window.addEventListener('scroll', handleScrollAnimations);

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing slideshow');
    
    // Initialize animations and slideshow
    initSlideshow();
    
    // Smooth scrolling for "View Projects" button
    const viewProjectsButton = document.querySelector('a[href="#projects"]');
     
    // Add click event listener to the button
    if (viewProjectsButton) {
        viewProjectsButton.addEventListener('click', function(e) {
            // Prevent default anchor behavior
            e.preventDefault();
            
            // Get the target section
            const projectsSection = document.getElementById('projects');
            
            if (projectsSection) {
                // Calculate the target position
                const targetPosition = projectsSection.getBoundingClientRect().top + window.pageYOffset;
                
                // Current position
                const startPosition = window.pageYOffset;
                
                // Calculate distance
                const distance = targetPosition - startPosition;
                
                // Animation duration in milliseconds
                const duration = 800;
                
                // Animation variables
                let startTime = null;
                
                // Animation function
                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const scrollY = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                    
                    window.scrollTo(0, scrollY);
                    
                    // Continue animation if duration hasn't passed
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    }
                }
                
                // Easing function for smoother animation
                function easeInOutCubic(t, b, c, d) {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t * t + b;
                    t -= 2;
                    return c / 2 * (t * t * t + 2) + b;
                }
                
                // Start animation
                requestAnimationFrame(animation);
            }
        });
    }

    // Scroll animations for sections
    const sections = document.querySelectorAll('section');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.8;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < triggerBottom) {
                section.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    
    // Project card animations
    const projectCards = document.querySelectorAll('.project-card');
    
    function animateCards() {
        projectCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 200 * index);
        });
    }
    
    const projectsElement = document.getElementById('projects');
    if (projectsElement) {
        projectsElement.addEventListener('animationend', animateCards);
    }
    else{}
    
    // Initial check
    checkScroll();
});

// Check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Slideshow functionality - Simplified version
function initSlideshow() {
    const slideshow = document.querySelector('.hero-slideshow');
    if (!slideshow) return;
    
    const slides = Array.from(slideshow.querySelectorAll('.hero-slide'));
    const dots = document.querySelectorAll('.slideshow-dot');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let autoRotateInterval;
    let isDragging = false;
    let startX = 0;
    let dragDistance = 0;
    let autoRotatePaused = false;
    
    // Set the first slide as active
    slides[0].classList.add('active');
    if (dots.length > 0) dots[0].classList.add('active');
    
    // Reset manual control flag - enable auto rotation
    window.manualSlideControl = false;
    
    // Set up drag functionality
    slideshow.addEventListener('mousedown', dragStart);
    slideshow.addEventListener('touchstart', dragStart, { passive: true });
    slideshow.addEventListener('mouseup', dragEnd);
    slideshow.addEventListener('touchend', dragEnd);
    slideshow.addEventListener('mouseleave', dragEnd);
    slideshow.addEventListener('mousemove', drag);
    slideshow.addEventListener('touchmove', drag, { passive: true });
    
    // Stop animation on hover
    slideshow.addEventListener('mouseenter', () => {
        autoRotatePaused = true;
        clearInterval(autoRotateInterval);
    });
    
    slideshow.addEventListener('mouseleave', () => {
        autoRotatePaused = false;
        if (!isDragging && !window.manualSlideControl) {
            startAutoRotate();
        }
    });
    
    // Set up dot navigation if dots exist
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoRotate();
            });
        });
    }
    
    // Add listeners for manual navigation buttons
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToPrevSlide();
            resetAutoRotate();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToNextSlide();
            resetAutoRotate();
        });
    }
    
    // Start auto-rotate immediately
    console.log("Starting automatic slideshow");
    startAutoRotate();
    
    // Drag Functions
    function dragStart(e) {
        if (e.type.includes('mouse')) e.preventDefault();
        
        isDragging = true;
        startX = getPositionX(e);
        dragDistance = 0;
        
        // Stop auto-rotate while dragging
        autoRotatePaused = true;
        clearInterval(autoRotateInterval);
        
        // Add grabbing cursor
        slideshow.style.cursor = 'grabbing';
        
        // Remove transition during drag for responsiveness
        slides.forEach(slide => {
            slide.style.transition = 'none';
        });
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const currentX = getPositionX(e);
        dragDistance = currentX - startX;
        
        // Move current slide
        const activeSlide = slides[currentSlide];
        activeSlide.style.transform = `translateX(${dragDistance}px)`;
        
        // Get previous and next slide indices
        const nextIndex = (currentSlide + 1) % slides.length;
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        
        // Reset all slides first (clean state)
        slides.forEach(slide => {
            if (slide !== activeSlide && 
                slide !== slides[nextIndex] && 
                slide !== slides[prevIndex]) {
                slide.style.transform = '';
                slide.classList.remove('temp-active');
                slide.style.opacity = '';
                slide.style.zIndex = '';
            }
        });
        
        // Show next or previous slide based on drag direction
        if (dragDistance < 0) {
            // Dragging left (showing next slide)
            slides[nextIndex].classList.add('temp-active');
            slides[nextIndex].style.opacity = '1';
            slides[nextIndex].style.zIndex = '1';
            slides[nextIndex].style.transform = `translateX(calc(100% + ${dragDistance}px))`;
        } else if (dragDistance > 0) {
            // Dragging right (showing previous slide)
            slides[prevIndex].classList.add('temp-active');
            slides[prevIndex].style.opacity = '1';
            slides[prevIndex].style.zIndex = '1';
            slides[prevIndex].style.transform = `translateX(calc(-100% + ${dragDistance}px))`;
        }
    }
    
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Reset cursor
        slideshow.style.cursor = 'grab';
        
        // Get the threshold for slide change (20% of slideshow width)
        const threshold = slideshow.offsetWidth * 0.2;
        
        // Determine if we should change slides based on drag distance
        if (Math.abs(dragDistance) > threshold) {
            // Change slide if threshold is passed
            if (dragDistance < 0) {
                // Dragged left - go to next slide
                goToNextSlide();
            } else {
                // Dragged right - go to previous slide
                goToPrevSlide();
            }
        } else {
            // Threshold not passed, reset all slides
            slides.forEach(slide => {
                slide.style.transition = 'transform 0.3s ease-out';
                slide.style.transform = '';
                slide.classList.remove('temp-active');
                slide.style.opacity = '';
                slide.style.zIndex = '';
            });
            
            // Ensure current slide is visible
            slides[currentSlide].classList.add('active');
        }
        
        // After animation completes, reset all styles
        setTimeout(() => {
            slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.style.transform = '';
                    slide.style.transition = '';
                    slide.style.opacity = '';
                    slide.style.zIndex = '';
                }
            });
            
            // Restart auto-rotate if not manually controlled and not paused
            autoRotatePaused = false;
            if (!window.manualSlideControl) {
                startAutoRotate();
            }
        }, 300); // Match the transition duration
    }
    
    // Helper Functions
    function getPositionX(e) {
        return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }
    
    function goToSlide(index) {
        if (index === currentSlide) return;
        
        // Determine if we're going forward or backward
        const direction = index > currentSlide ? 'next' : 'prev';
        
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        if (dots.length > 0) dots[currentSlide].classList.remove('active');
        
        // Prepare transition effect
        slides.forEach(slide => {
            slide.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        });
        
        // Set new slide as active
        const oldIndex = currentSlide;
        currentSlide = index;
        
        // Add appropriate classes
        slides[currentSlide].classList.add('active');
        if (dots.length > 0) dots[currentSlide].classList.add('active');
        
        // Add appropriate transition effect
        if (direction === 'next') {
            slides[oldIndex].style.transform = 'translateX(-100%)';
            slides[currentSlide].style.transform = 'translateX(0)';
        } else {
            slides[oldIndex].style.transform = 'translateX(100%)';
            slides[currentSlide].style.transform = 'translateX(0)';
        }
        
        // Reset all styles after transition
        setTimeout(() => {
            slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.style.transform = '';
                    slide.style.transition = '';
                }
            });
        }, 300);
    }
    
    function goToNextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    function goToPrevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }
    
    function startAutoRotate() {
        // Clear any existing interval first
        clearInterval(autoRotateInterval);
        
        // Don't start autorotation if manual control is active or paused
        if (window.manualSlideControl || autoRotatePaused) {
            return;
        }
        
        console.log("Auto rotation started");
        
        // Store the interval ID in a variable
        autoRotateInterval = setInterval(() => {
            console.log("Auto advancing slide");
            goToNextSlide();
        }, 5000);
        
        // Also store globally for access by other scripts
        window.slideshowInterval = autoRotateInterval;
    }
    
    function resetAutoRotate() {
        // Don't restart autorotation if manual control is active
        if (window.manualSlideControl) {
            return;
        }
        
        clearInterval(autoRotateInterval);
        
        // Short delay before restarting to prevent immediate advancement
        setTimeout(() => {
            if (!autoRotatePaused) {
                startAutoRotate();
            }
        }, 100);
    }
} 