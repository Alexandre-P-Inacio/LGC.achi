// Use the existing Supabase client from window.supabase
// We'll remove the initialization code that's causing conflicts
const supabase = window.supabase;

console.log('Using existing Supabase client:', supabase);

// Check if user is admin and redirect if not
async function checkAdminAccess() {
    console.log('Checking admin access...');
    const currentUser = localStorage.getItem('currentUser');
    console.log('Current user from localStorage:', currentUser);
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const { data, error } = await supabase
        .from('Users')
        .select('is_admin')
        .eq('username', currentUser)
        .single();

    console.log('Admin check result:', { data, error });

    if (error || !data || !data.is_admin) {
        window.location.href = 'index.html';
        return;
    }

    // Set admin name in header
    document.getElementById('admin-name').textContent = `Welcome, ${currentUser}`;
}

// Get project ID from URL parameter
function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load project data for editing
async function loadProjectData(projectId) {
    console.log('Loading project data for ID:', projectId);
    
    const { data, error } = await supabase
        .from('architecture_projects')
        .select('*')
        .eq('id', projectId)
        .single();

    console.log('Project data load result:', { data, error });

    if (error) {
        console.error('Error loading project:', error);
        alert('Error loading project. Redirecting to dashboard.');
        window.location.href = 'admin.html';
        return;
    }

    // Update form title
    document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Project';
    
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
    
    // Update save button text
    document.getElementById('save-button').innerHTML = '<i class="fas fa-save"></i> Update Project';
}

// Save project (add or update)
async function saveProject(event) {
    console.log('Save project function called');
    event.preventDefault();
    
    const projectId = getProjectIdFromUrl();
    const isEdit = !!projectId;
    console.log('Is edit mode:', isEdit, 'Project ID:', projectId);
    
    try {
        // Build the projectData object with form values
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
        };
        
        console.log('Project data to save:', projectData);
        
        let result;
        
        if (isEdit) {
            // Update existing project
            projectData.updated_at = new Date().toISOString();
            
            console.log('Updating existing project with ID:', projectId);
            // Simplified update operation
            result = await supabase
                .from('architecture_projects')
                .update(projectData)
                .eq('id', projectId);
        } else {
            // Add new project - following the same pattern as the register function
            // Adding timestamps
            projectData.created_at = new Date().toISOString();
            projectData.updated_at = new Date().toISOString();
            
            console.log('Inserting new project with data:', projectData);
            // Simplified insert operation that matches register function pattern
            result = await supabase
                .from('architecture_projects')
                .insert([projectData]);
        }
        
        console.log('Supabase result:', result);
        
        if (result.error) {
            console.error('Error saving project:', result.error);
            alert(`Error ${isEdit ? 'updating' : 'adding'} project: ${result.error.message}`);
            return;
        }

        console.log('Project saved successfully!');
        alert(`Project ${isEdit ? 'updated' : 'added'} successfully!`);
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
    } catch (err) {
        console.error('Exception occurred while saving project:', err);
        alert(`An unexpected error occurred: ${err.message}`);
    }
}

// Initialize form
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing project form');
    
    try {
        await checkAdminAccess();
        
        const projectId = getProjectIdFromUrl();
        console.log('Project ID from URL:', projectId);
        
        if (projectId) {
            await loadProjectData(projectId);
        }
        
        // Add form submit handler
        const form = document.getElementById('project-form');
        console.log('Project form element:', form);
        
        if (form) {
            form.addEventListener('submit', saveProject);
            console.log('Submit handler attached to form');
        } else {
            console.error('Form element not found!');
        }
        
        // Add logout handler
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } catch (err) {
        console.error('Error initializing project form:', err);
    }
}); 