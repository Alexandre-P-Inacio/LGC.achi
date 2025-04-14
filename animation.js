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

// Aplicar animações no carregamento inicial
document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimations();
    
    // Adicionar animação de pulse ao logo a cada 5 segundos
    const logo = document.querySelector('.logo');
    if (logo) {
        setInterval(() => {
            logo.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                logo.style.animation = '';
            }, 1000);
        }, 5000);
    }
});

// Aplicar animações durante o scroll
window.addEventListener('scroll', handleScrollAnimations); 