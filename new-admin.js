// Admin dashboard functions using PHP endpoints

// Check if user is admin and redirect if not
async function checkAdminAccess() {
    console.log('Checking admin access...');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`check_admin.php?username=${encodeURIComponent(currentUser)}`);
        const data = await response.json();
        
        if (!data.admin) {
            window.location.href = 'index.html';
            return;
        }

        // Set admin name in header
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = `Welcome, ${currentUser}`;
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = 'login.html';
    }
}

// Load projects for admin dashboard
async function loadProjects() {
    try {
        const response = await fetch('admin-api.php?action=list_projects');
        
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Delete a project
async function deleteProject(projectId) {
    try {
        const response = await fetch(`admin-api.php?action=delete_project&id=${projectId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete project');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: error.message };
    }
}

// Count projects
async function countProjects() {
    try {
        const response = await fetch('admin-api.php?action=count_projects');
        
        if (!response.ok) {
            throw new Error('Failed to count projects');
        }
        
        const result = await response.json();
        return result.count || 0;
    } catch (error) {
        console.error('Error counting projects:', error);
        return 0;
    }
}

// Create an admin user
async function createAdminUser(username, password) {
    try {
        const response = await fetch('admin-api.php?action=create_admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create admin user');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error creating admin user:', error);
        return { success: false, error: error.message };
    }
}

// Logout function
async function logout() {
    try {
        if (window.authFunctions && window.authFunctions.logout) {
            await window.authFunctions.logout();
        } else {
            // Fallback logout
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userId');
        }
        
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        
        // Still clear localStorage and redirect even if there's an error
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        window.location.href = 'login.html';
    }
}

// Initialize the admin dashboard
async function initAdminDashboard() {
    await checkAdminAccess();
    
    // Add event listener for logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Load and display projects
    const projects = await loadProjects();
    displayProjects(projects);
    
    // Update project count in dashboard
    const projectCount = await countProjects();
    const countElement = document.getElementById('project-count');
    if (countElement) {
        countElement.textContent = projectCount;
    }
}

// Display projects in the admin dashboard
function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = '<p class="no-projects">No projects found. Add your first project!</p>';
        return;
    }
    
    let html = '<div class="project-grid">';
    
    projects.forEach(project => {
        const date = new Date(project.created_at).toLocaleDateString();
        const featuredBadge = project.is_featured 
            ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' 
            : '';
        
        html += `
            <div class="project-card" data-id="${project.id}">
                <div class="project-header">
                    <h3>${project.name}</h3>
                    ${featuredBadge}
                </div>
                <div class="project-details">
                    <p><strong>Category:</strong> ${project.category}</p>
                    <p><strong>Status:</strong> ${project.status || 'Not specified'}</p>
                    <p><strong>Date Added:</strong> ${date}</p>
                    <p><strong>File:</strong> ${project.file_name || 'No file'}</p>
                </div>
                <div class="project-actions">
                    <a href="project-form.html?id=${project.id}" class="edit-button">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="get_file.php?project_id=${project.id}" class="view-button" target="_blank">
                        <i class="fas fa-eye"></i> View
                    </a>
                    <button class="delete-button" onclick="confirmDeleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    projectsContainer.innerHTML = html;
}

// Confirm and delete a project
function confirmDeleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        deleteProject(projectId).then(result => {
            if (result.success) {
                alert('Project deleted successfully!');
                // Reload the page to refresh the project list
                window.location.reload();
            } else {
                alert(`Failed to delete project: ${result.error}`);
            }
        });
    }
}

// Export functions
window.adminFunctions = {
    checkAdminAccess,
    loadProjects,
    deleteProject,
    countProjects,
    createAdminUser,
    logout,
    initAdminDashboard,
    displayProjects,
    confirmDeleteProject
};

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initAdminDashboard); 