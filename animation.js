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
    // Find the "View Projects" button by its href attribute
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
    
    // Initialize other animations here
    initializeAnimations();
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