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


// Aplicar animações durante o scroll
window.addEventListener('scroll', handleScrollAnimations);

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Slide animation for hero background
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slideshow-dot');
    let currentSlide = 0;
    let slideInterval;
    const slideIntervalTime = 5000; // Change slide every 5 seconds

    function goToSlide(slideIndex) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to selected slide and dot
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
        
        // Update current slide
        currentSlide = slideIndex;
    }

    function nextSlide() {
        // Calculate next slide index
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
    }

    // Set up dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            
            // Go to selected slide
            goToSlide(slideIndex);
            
            // Reset interval timer
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, slideIntervalTime);
        });
    });

    // Start the slideshow
    if (slides.length > 0) {
        // Initialize with first slide
        goToSlide(0);
        
        // Set interval for auto-sliding
        slideInterval = setInterval(nextSlide, slideIntervalTime);
    }

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
    
    document.getElementById('projects').addEventListener('animationend', animateCards);
    
    // Initial check
    checkScroll();
});

// This function can contain other animations you might want to add
function initializeAnimations() {
    // Add fade-in animations for sections
    const sections = document.querySelectorAll('section');
    
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => {
            section.classList.add('section-hidden');
            sectionObserver.observe(section);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        sections.forEach(section => {
            section.classList.add('animated');
        });
    }
} 