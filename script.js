// About section toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('about-toggle-btn');
    const aboutText = document.querySelector('.about-text');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            aboutText.classList.toggle('expanded');
        });
    }
}); 