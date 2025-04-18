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

    // Load shared projects for the user
    loadSharedProjects();

    // Set up intersection observer for animation
    setupIntersectionObserver();
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
        overlay.style.display = 'flex';
        
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
        overlay.style.display = 'none';
        
        // Re-enable body scrolling
        document.body.style.overflow = 'auto';
    }
}

// Navigate to a specific category
function navigateToCategory(category) {
    // Store the selected category in localStorage
    localStorage.setItem('selectedCategory', category);
    
    // Navigate to the projects page filtered by category
    window.location.href = `portfolios.html?category=${category}`;
}

// Load projects shared with the current user
async function loadSharedProjects() {
    try {
        // Get the current user
        const currentUsername = localStorage.getItem('currentUser');
        if (!currentUsername) {
            console.error('No logged in user found');
            return;
        }
        
        // Get the user ID
        const { data: userData, error: userError } = await supabase
            .from('Users')
            .select('id')
            .eq('username', currentUsername)
            .single();
            
        if (userError || !userData) {
            console.error('Error getting user ID:', userError);
            return;
        }
        
        // Get shared projects for this user
        const { data: sharedProjectsData, error: sharedError } = await supabase
            .from('project_shares')
            .select(`
                id,
                shared_at,
                shared_by,
                project_id,
                projects:project_id (
                    id, 
                    name, 
                    description,
                    category,
                    file_url,
                    image_url,
                    status,
                    created_at
                ),
                sharer:shared_by (username)
            `)
            .eq('user_id', userData.id)
            .order('shared_at', { ascending: false });
            
        if (sharedError) {
            console.error('Error loading shared projects:', sharedError);
            return;
        }
        
        if (!sharedProjectsData || sharedProjectsData.length === 0) {
            console.log('No shared projects found');
            // Verificar se o elemento existe antes de tentar atualizá-lo
            const sharedProjectsSection = document.getElementById('shared-projects-section');
            if (sharedProjectsSection) {
                sharedProjectsSection.style.display = 'none';
            }
            return;
        }
        
        console.log('Shared projects:', sharedProjectsData);
        
        // Criar ou atualizar a seção de projetos compartilhados
        let sharedProjectsSection = document.getElementById('shared-projects-section');
        
        // Se a seção não existir, criá-la
        if (!sharedProjectsSection) {
            const dashboardContent = document.querySelector('.dashboard-popup-content');
            
            if (dashboardContent) {
                // Criar a seção de projetos compartilhados
                sharedProjectsSection = document.createElement('div');
                sharedProjectsSection.id = 'shared-projects-section';
                sharedProjectsSection.className = 'shared-projects-section';
                
                // Adicionar a seção depois do texto introdutório
                const contentParagraph = dashboardContent.querySelector('p');
                if (contentParagraph) {
                    contentParagraph.insertAdjacentElement('afterend', sharedProjectsSection);
                } else {
                    dashboardContent.prepend(sharedProjectsSection);
                }
            } else {
                console.error('Dashboard content not found');
                return;
            }
        }
        
        // Construir o conteúdo HTML para a seção de projetos compartilhados
        sharedProjectsSection.innerHTML = `
            <h3>Projects Shared With You</h3>
            <div class="shared-projects-list">
                ${sharedProjectsData.map(item => {
                    const project = item.projects;
                    
                    if (!project) return '';  // Skip if project data is missing
                    
                    // Determinar status do projeto
                    let statusClass = 'status-unknown';
                    let statusText = 'Unknown';
                    
                    if (project.status === 'completed' || project.status === true || project.status === 'Completed') {
                        statusClass = 'status-completed';
                        statusText = 'Completed';
                    } else if (project.status === 'incompleted' || project.status === false || project.status === 'Incompleted') {
                        statusClass = 'status-incompleted';
                        statusText = 'Incomplete';
                    } else if (project.status === 'in_progress' || project.status === null || project.status === 'In Progress') {
                        statusClass = 'status-in-progress';
                        statusText = 'In Progress';
                    }
                    
                    // Formatar a categoria
                    const category = project.category ? project.category
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ') : 'No category';
                    
                    // Formatar a data de compartilhamento
                    const sharedDate = new Date(item.shared_at).toLocaleDateString();
                    
                    return `
                        <div class="shared-project-card">
                            <div class="shared-project-header">
                                <h4>${project.name || 'Unnamed Project'}</h4>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </div>
                            <div class="shared-project-details">
                                <p class="category-tag">${category}</p>
                                <p class="shared-by">Shared by: ${item.sharer?.username || 'Unknown user'}</p>
                                <p class="shared-date">On: ${sharedDate}</p>
                            </div>
                            <div class="shared-project-actions">
                                <a href="javascript:void(0)" class="view-project-button" onclick="viewSharedProject('${project.id}')">
                                    View Details
                                </a>
                                ${project.file_url ? `
                                <a href="${project.file_url}" class="download-file-button" download="${project.name} - File">
                                    <i class="fas fa-download"></i> Download File
                                </a>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        sharedProjectsSection.style.display = 'block';
        
    } catch (e) {
        console.error('Error loading shared projects:', e);
    }
}

// Function to view a shared project
function viewSharedProject(projectId) {
    // Implementar a visualização do projeto
    console.log('Viewing project:', projectId);
    
    // Por enquanto, apenas mostra uma notificação
    showNotification('View functionality is still being implemented.', 'info');
}

// Set up intersection observer for animation
function setupIntersectionObserver() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const options = {
            root: null, // Use the viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when at least 10% of the element is visible
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Stop observing once it's visible
                }
            });
        }, options);
        
        // Observe each category card
        document.querySelectorAll('.category-card').forEach(card => {
            observer.observe(card);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.add('visible');
        });
    }
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