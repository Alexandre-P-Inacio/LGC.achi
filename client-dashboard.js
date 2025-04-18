// Client Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // If the dashboard overlay exists, set up the necessary event handlers for it
    if (document.getElementById('client-dashboard-overlay')) {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        // If user is admin, show a notification
        if (isAdmin) {
            showNotification('You are viewing this page as an admin. Clients will only see their relevant projects.', 'info');
        }
        
        // Check if URL hash indicates dashboard should be shown (e.g., after login redirect)
        if (window.location.hash === '#client-dashboard' && currentUser) {
            // Small delay to ensure the DOM is fully ready
            setTimeout(() => {
                showDashboard();
            }, 100);
        }
        
        // Add event listeners to close buttons and overlay
        setupDashboardListeners();
    }
});

// Initialize the dashboard components
function initializeDashboard() {
    console.log('Initializing dashboard');
    
    // Add event listeners to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            navigateToCategory(category);
        });
    });

    // No need for animation observer with the new sliding design
}

// Set up listeners for dashboard popup
function setupDashboardListeners() {
    // Close dashboard when clicking the close button
    const closeButton = document.querySelector('.close-dashboard');
    if (closeButton) {
        closeButton.addEventListener('click', closeDashboard);
    }
    
    // Close dashboard when clicking outside of it
    const overlay = document.getElementById('client-dashboard-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeDashboard();
            }
        });
    }

    // Add keyboard escape key support
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeDashboard();
        }
    });
}

// Function to show dashboard popup
function showDashboard() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html?redirect=index.html%23client-dashboard';
        return;
    }
    
    // Show dashboard overlay
    const overlay = document.getElementById('client-dashboard-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        
        // Add class to trigger animation after a small delay
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        // Initialize dashboard
        initializeDashboard();
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    }
}

// Function to close dashboard popup
function closeDashboard() {
    const overlay = document.getElementById('client-dashboard-overlay');
    if (overlay) {
        // First remove the active class to trigger slide-out
        overlay.classList.remove('active');
        
        // Then hide the overlay after animation completes
        setTimeout(() => {
            overlay.style.display = 'none';
            
            // Re-enable body scrolling
            document.body.style.overflow = 'auto';
        }, 300); // Match transition duration from CSS
    }
}

// Navigate to a specific category
function navigateToCategory(category) {
    // Store the selected category in localStorage
    localStorage.setItem('selectedCategory', category);
    
    // Close the dashboard immediately before navigating since we have simpler UI now
    closeDashboard();
    
    // Navigate to the projects page filtered by category
    window.location.href = `portfolios.html?category=${category}`;
}

// Show a notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">&times;</button>
    `;
    
    // Add to the document
    document.body.appendChild(notification);
    
    // Add event listener for close button
    notification.querySelector('.close-btn').addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add notification style to our CSS
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification.info {
        background-color: #e7f3fe;
        border-left: 4px solid #2196F3;
        color: #0c5460;
    }
    
    .notification.warning {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        color: #856404;
    }
    
    .notification.error {
        background-color: #f8d7da;
        border-left: 4px solid #dc3545;
        color: #721c24;
    }
    
    .notification .close-btn {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 10px;
    }
`;
document.head.appendChild(style);

// Make functions available globally
window.showDashboard = showDashboard;
window.closeDashboard = closeDashboard;
window.initializeDashboard = initializeDashboard; 