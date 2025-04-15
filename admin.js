// Initialize Supabase client
// Don't re-declare these variables since they're already defined in the HTML
// const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI'
// Use the existing Supabase client from window
const supabase = window.supabase;
console.log('Using Supabase client from global scope in admin.js');

// Global variables
let allProjects = [];
let currentPage = 1;
const projectsPerPage = 10;

// Create projects in database directly
async function ensureProjectsTable() {
    console.log('Ensuring projects table exists...');
    
    
    // Check if table exists
    try {
        console.log('Checking if projects table exists...');
        const { data, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
        
        if (error) {
            console.error('Error checking projects table:', error);
            return false;
        }
        
        console.log('Projects table exists. Count:', data?.count || 0);
        return true;
    } catch (e) {
        console.error('Error checking projects table:', e);
        return false;
    }
}

// Force insert a test project
async function createTestProject() {
    console.log('Creating a test project...');
    
    try {
        const testProject = {
            name: 'Test Project ' + new Date().toLocaleTimeString(),
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase.from('projects').insert([testProject]).select();
        
        if (error) {
            console.error('Error creating test project:', error);
            return null;
        }
        
        console.log('Test project created successfully:', data);
        return data?.[0] || null;
    } catch (e) {
        console.error('Exception creating test project:', e);
        return null;
    }
}

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

// Update stats
async function updateStats() {
    try {
        const { data, error } = await supabase
            .from('architecture_projects')
            .select('status');
        
        if (error) throw error;
        
        // Calcular estatísticas baseadas nos valores booleanos
        const totalProjects = data.length;
        const completedProjects = data.filter(p => p.status === true).length;
        const inProgressProjects = data.filter(p => p.status === null).length;
        const uncompletedProjects = data.filter(p => p.status === false).length;
        
        // Update UI
        document.getElementById('total-projects').textContent = totalProjects;
        document.getElementById('completed-projects').textContent = completedProjects;
        document.getElementById('in-progress-projects').textContent = inProgressProjects;
        document.getElementById('uncompleted-projects').textContent = uncompletedProjects;
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Load projects
async function loadProjects(page = 1, filters = {}) {
    try {
        // Ensure the projects table exists
        try {
            const { error: tableError } = await supabase.rpc('create_projects_table_if_not_exists');
            if (tableError) {
                console.error('Error ensuring projects table exists:', tableError);
            }
        } catch (e) {
            console.warn('Could not create table if not exists, may already exist:', e);
        }
        
        // DEBUG: Try a direct query without RPC
        console.log('Attempting to load projects directly...');
        const { data: directData, error: directError } = await supabase
            .from('projects')
            .select('*');
        
        console.log('Direct query results:', { data: directData, error: directError });
        
        // Get all projects first (for filtering client-side)
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Projects loaded:', { data, error, count: data?.length || 0 });
        
        if (error) {
            console.error('Error loading projects:', error);
            
            // Try a basic query as admin
            const { data: adminData, error: adminError } = await supabase.auth.getSession();
            console.log('Current session:', adminData, adminError);
            
            return;
        }
        
        // If no data or empty array, show message in table
        if (!data || data.length === 0) {
            console.log('No projects found - displaying empty state');
            updateProjectsTable([]);
            return;
        }
        
        // Store all projects for filtering
        allProjects = data || [];
        
        // Apply filters if any
        let filteredProjects = allProjects;
        
        // Filter by search term
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredProjects = filteredProjects.filter(project => 
                project.name?.toLowerCase().includes(searchTerm)
            );
        }
        
        // Calculate pagination
        const startIndex = (page - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
        
        // Update the projects table
        updateProjectsTable(paginatedProjects);
        
        // Update pagination controls
        updatePagination(page, totalPages);

    } catch (err) {
        console.error('Error in loadProjects:', err);
    }
}

// Format file name from URL
function getFileNameFromUrl(url) {
    if (!url) return '';
    try {
        // Extract filename from URL
        const pathParts = new URL(url).pathname.split('/');
        let fileName = pathParts[pathParts.length - 1];
        
        // Decode URI components
        fileName = decodeURIComponent(fileName);
        
        // Remove any timestamp or random part (after the last dash)
        if (fileName.includes('-')) {
            const parts = fileName.split('-');
            if (parts.length > 1 && parts[parts.length-1].includes('.')) {
                // Keep the extension
                const extension = parts[parts.length-1].split('.')[1];
                fileName = parts.slice(0, -1).join('-') + '.' + extension;
            }
        }
        
        return fileName;
    } catch (e) {
        console.error('Error parsing file URL:', e);
        return 'View File';
    }
}

// Update projects table with data
function updateProjectsTable(projects) {
    console.log('Updating projects table with:', projects);
    const projectsContainer = document.getElementById('projects-container');
    
    // Make sure the container exists
    if (!projectsContainer) {
        console.error('Projects container element not found!');
        return;
    }
    
    projectsContainer.innerHTML = '';

    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <p>No projects found. Add your first project by clicking the "Add New Project" button above.</p>
                </td>
            </tr>
        `;
        return;
    }

    projects.forEach(project => {
        console.log('Processing project:', project);
        
        // Create a simple version of the row first to ensure it works
        const row = document.createElement('tr');
        
        try {
            // Format the date
            const createdDate = project.created_at 
                ? new Date(project.created_at).toLocaleDateString() 
                : 'Unknown date';
            
            // Get file info (safely)
            let fileInfo = { name: 'No file', type: 'Document' };
            if (project.file_url) {
                try {
                    const url = new URL(project.file_url);
                    const pathParts = url.pathname.split('/');
                    fileInfo.name = decodeURIComponent(pathParts[pathParts.length - 1]);
                    if (fileInfo.name.includes('.')) {
                        fileInfo.type = fileInfo.name.split('.').pop().toUpperCase();
                    }
                } catch (e) {
                    console.warn('Error parsing file URL:', e);
                }
            }
            
            // Usar o valor exato da coluna status
            const statusValue = project.status;
            console.log('Status value:', statusValue); // Debug
            
            let statusText, statusClass;
            
            // Mapear os valores booleanos para os textos corretos
            if (statusValue === true) {
                statusText = 'Completed';
                statusClass = 'status-completed';
            } else if (statusValue === false) {
                statusText = 'Uncompleted';
                statusClass = 'status-uncompleted';
            } else if (statusValue === null) {
                statusText = 'In Progress';
                statusClass = 'status-in-progress';
            }
            
            // Create table row with basic data
            row.innerHTML = `
                <td>
                    <div class="project-title">${project.name || 'Unnamed Project'}</div>
                </td>
                <td>${createdDate}</td>
                <td>
                    ${project.file_url 
                        ? `<a href="${project.file_url}" target="_blank">${fileInfo.name}</a>` 
                        : 'No file'}
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${fileInfo.type}</td>
                <td>
                    <div class="action-buttons">
                        <a href="project-form.html?id=${project.id}" class="action-button edit-button" title="Edit">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="action-button delete-button" onclick="deleteProject('${project.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        } catch (e) {
            console.error('Error creating row for project:', e, project);
            row.innerHTML = `
                <td colspan="6">
                    Error displaying project: ${e.message}
                </td>
            `;
        }
        
        projectsContainer.appendChild(row);
    });
}

// Update pagination controls
function updatePagination(currentPage, totalPages) {
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    // Don't show pagination if there's only one page
    if (totalPages <= 1) {
        document.querySelector('.pagination-container').style.display = 'none';
        return;
    } else {
        document.querySelector('.pagination-container').style.display = 'flex';
    }
    
    // Create page number buttons
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-number');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            loadProjects(i, getCurrentFilters());
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    // Update prev/next buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Get current filters from the UI
function getCurrentFilters() {
    return {
        searchTerm: document.getElementById('search-projects').value
    };
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        // Get the project to check if it has a file to delete
        const { data: project, error: getError } = await supabase
            .from('projects')
            .select('file_url')
            .eq('id', projectId)
            .single();
            
        if (getError) {
            console.error('Error retrieving project:', getError);
        } else if (project && project.file_url) {
            try {
                // Extract the file path from the URL
                const url = new URL(project.file_url);
                const pathParts = url.pathname.split('/');
                const filePath = pathParts.slice(pathParts.indexOf('projects') + 1).join('/');
                
                // Delete the file from storage
                const { error: deleteFileError } = await supabase.storage
                    .from('projects')
                    .remove([filePath]);
                    
                if (deleteFileError) {
                    console.error('Error deleting file:', deleteFileError);
                } else {
                    console.log('File deleted successfully');
                }
            } catch (e) {
                console.error('Error parsing file URL:', e);
            }
        }

        // Delete the project record
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project: ' + error.message);
            return;
        }

        // Reload data
        await updateStats();
        await loadProjects(currentPage, getCurrentFilters());
        alert('Project deleted successfully!');
    } catch (err) {
        console.error('Error in deleteProject:', err);
        alert('An unexpected error occurred while deleting the project.');
    }
}

// Search projects
function searchProjects() {
    const searchTerm = document.getElementById('search-projects').value;
    loadProjects(1, { ...getCurrentFilters(), searchTerm });
}

// Filter projects
async function filterProjects() {
    const searchTerm = document.getElementById('search-projects').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    try {
        let query = supabase
            .from('architecture_projects')
            .select('*');
        
        // Aplicar filtro baseado nos valores booleanos
        if (statusFilter !== 'all') {
            if (statusFilter === 'true') {
                query = query.eq('status', true);  // Completed
            } else if (statusFilter === 'false') {
                query = query.eq('status', false); // Uncompleted
            } else if (statusFilter === 'null') {
                query = query.is('status', null);  // In Progress
            }
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Store all projects for filtering
        allProjects = data || [];
        
        // Apply filters if any
        let filteredProjects = allProjects;
        
        // Filter by search term
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(project => 
                project.name?.toLowerCase().includes(searchTerm)
            );
        }
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
        
        // Update the projects table
        updateProjectsTable(paginatedProjects);
        
        // Update pagination controls
        updatePagination(currentPage, totalPages);

    } catch (error) {
        console.error('Error filtering projects:', error);
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    updateStats();
    
    // Manter apenas os event listeners necessários
    document.getElementById('search-button').addEventListener('click', filterProjects);
    
    document.getElementById('search-projects').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterProjects();
        }
    });
    
    document.getElementById('status-filter').addEventListener('change', filterProjects);
}); 