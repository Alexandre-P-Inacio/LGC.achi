// Initialize Supabase client
// Don't re-declare these variables since they're already defined in the HTML
// const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI'
// Use the existing Supabase client from window
const supabase = window.supabase;
console.log('Using Supabase client from global scope in admin.js');

// Check if user is admin and redirect if not
async function checkAdminAccess() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const { data, error } = await supabase
        .from('Users')
        .select('is_admin')
        .eq('username', currentUser)
        .single();

    if (error || !data || !data.is_admin) {
        window.location.href = 'index.html';
        return;
    }

    // Set admin name in header
    document.getElementById('admin-name').textContent = `Welcome, ${currentUser}`;
}

// Load projects
async function loadProjects() {
    const { data, error } = await supabase
        .from('architecture_projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading projects:', error);
        return;
    }

    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';

    if (data.length === 0) {
        projectsContainer.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <p>No projects found. Add your first project by clicking the "Add New Project" button above.</p>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(project => {
        // Get status badge class
        let statusClass = '';
        switch (project.status) {
            case 'completed':
                statusClass = 'status-completed';
                break;
            case 'in-progress':
                statusClass = 'status-in-progress';
                break;
            case 'planning':
                statusClass = 'status-planning';
                break;
            default:
                statusClass = '';
        }

        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="project-title">${project.title}</div>
                <div class="project-description">${project.description}</div>
            </td>
            <td>${project.location}</td>
            <td>${project.project_type}</td>
            <td><span class="status-badge ${statusClass}">${project.status}</span></td>
            <td>${project.year_completed}</td>
            <td>
                <div class="action-buttons">
                    <a href="project-form.html?id=${project.id}" class="action-button edit-button" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                    <button class="action-button delete-button" onclick="deleteProject(${project.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        projectsContainer.appendChild(row);
    });
}

// Add new project
async function addProject(event) {
    event.preventDefault();

    const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        location: document.getElementById('project-location').value,
        year_completed: parseInt(document.getElementById('project-year').value),
        area_sqm: parseFloat(document.getElementById('project-area').value),
        project_type: document.getElementById('project-type').value,
        status: document.getElementById('project-status').value,
        main_image_url: document.getElementById('project-main-image').value,
        gallery_images: document.getElementById('project-gallery').value.split(',').map(url => url.trim()).filter(url => url),
        client_name: document.getElementById('project-client').value || null,
        budget: document.getElementById('project-budget').value ? parseFloat(document.getElementById('project-budget').value) : null,
        duration_months: document.getElementById('project-duration').value ? parseInt(document.getElementById('project-duration').value) : null,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('architecture_projects')
        .insert([projectData]);

    if (error) {
        console.error('Error adding project:', error);
        alert('Error adding project. Please try again.');
        return;
    }

    // Clear form and reload projects
    event.target.reset();
    loadProjects();
    alert('Project added successfully!');
}

// Edit project
async function editProject(projectId) {
    const { data, error } = await supabase
        .from('architecture_projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error) {
        console.error('Error loading project:', error);
        return;
    }

    // Populate form with project data
    document.getElementById('project-title').value = data.title;
    document.getElementById('project-description').value = data.description;
    document.getElementById('project-location').value = data.location;
    document.getElementById('project-year').value = data.year_completed;
    document.getElementById('project-area').value = data.area_sqm;
    document.getElementById('project-type').value = data.project_type;
    document.getElementById('project-status').value = data.status;
    document.getElementById('project-main-image').value = data.main_image_url;
    document.getElementById('project-gallery').value = data.gallery_images?.join(', ') || '';
    document.getElementById('project-client').value = data.client_name || '';
    document.getElementById('project-budget').value = data.budget || '';
    document.getElementById('project-duration').value = data.duration_months || '';

    // Change form to edit mode
    const form = document.getElementById('add-project-form');
    form.dataset.editId = projectId;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save"></i> Update Project';

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });

    // Remove old submit event listener
    form.removeEventListener('submit', addProject);
    
    // Add new submit event listener for update
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            location: document.getElementById('project-location').value,
            year_completed: parseInt(document.getElementById('project-year').value),
            area_sqm: parseFloat(document.getElementById('project-area').value),
            project_type: document.getElementById('project-type').value,
            status: document.getElementById('project-status').value,
            main_image_url: document.getElementById('project-main-image').value,
            gallery_images: document.getElementById('project-gallery').value.split(',').map(url => url.trim()).filter(url => url),
            client_name: document.getElementById('project-client').value || null,
            budget: document.getElementById('project-budget').value ? parseFloat(document.getElementById('project-budget').value) : null,
            duration_months: document.getElementById('project-duration').value ? parseInt(document.getElementById('project-duration').value) : null,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('architecture_projects')
            .update(projectData)
            .eq('id', projectId);

        if (error) {
            console.error('Error updating project:', error);
            alert('Error updating project. Please try again.');
            return;
        }

        // Reset form and reload projects
        form.reset();
        form.removeAttribute('data-edit-id');
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Project';
        form.removeEventListener('submit', arguments.callee);
        form.addEventListener('submit', addProject);
        loadProjects();
        alert('Project updated successfully!');
    });
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    const { error } = await supabase
        .from('architecture_projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
        return;
    }

    loadProjects();
    alert('Project deleted successfully!');
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminAccess();
    loadProjects();

    // Add event listeners
    document.getElementById('add-project-form').addEventListener('submit', addProject);
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}); 