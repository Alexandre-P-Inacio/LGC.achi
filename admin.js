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

// Função de logout para substituir a que estava em auth.js
async function logout() {
    try {
        console.log('Logging out user...');
        localStorage.removeItem('currentUser');
        
        // Try Supabase logout if necessary
        try {
            const { error } = await supabase.auth.signOut();
            if (error) console.error('Error in Supabase signOut:', error);
        } catch (e) {
            console.error('Exception in Supabase signOut:', e);
        }
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (e) {
        console.error('Error in logout function:', e);
        alert('An error occurred during logout. Please try again.');
    }
}

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

// Update the last updated timestamp
function updateTimestamp() {
    const updateTimeElement = document.getElementById('update-time');
    if (updateTimeElement) {
        updateTimeElement.textContent = new Date().toLocaleString();
    }
}

// Update stats
async function updateStats() {
    try {
        // Fetch all projects to calculate stats
        const { data, error } = await supabase
            .from('projects')
            .select('*');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            // No projects, set all counts to zero
            document.getElementById('total-projects').textContent = '0';
            document.getElementById('completed-projects').textContent = '0';
            document.getElementById('in-progress-projects').textContent = '0';
            document.getElementById('uncompleted-projects').textContent = '0';
            return;
        }
        
        // Determine what column is used for status
        const firstProject = data[0];
        const possibleStatusColumns = ['status', 'project_status', 'estado', 'state'];
        const statusColumn = possibleStatusColumns.find(col => firstProject[col] !== undefined) || 'status';
        console.log(`Stats using status column: "${statusColumn}"`);
        
        // Calculate statistics based on status enum values
        const totalProjects = data.length;
        
        // Count completed projects
        const completedProjects = data.filter(p => {
            const status = p[statusColumn];
            return status === 'completed' || status === true || status === 'Completed';
        }).length;
        
        // Count in-progress projects
        const inProgressProjects = data.filter(p => {
            const status = p[statusColumn];
            return status === 'in_progress' || status === null || status === 'In Progress';
        }).length;
        
        // Count incompleted projects
        const incompletedProjects = data.filter(p => {
            const status = p[statusColumn];
            return status === 'incompleted' || status === false || status === 'Incompleted';
        }).length;
        
        console.log('Project statistics:', {
            total: totalProjects,
            completed: completedProjects,
            inProgress: inProgressProjects,
            incompleted: incompletedProjects
        });
        
        // Update UI
        document.getElementById('total-projects').textContent = totalProjects;
        document.getElementById('completed-projects').textContent = completedProjects;
        document.getElementById('in-progress-projects').textContent = inProgressProjects;
        document.getElementById('uncompleted-projects').textContent = incompletedProjects;
        
        // Update the timestamp
        updateTimestamp();
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Get current filters for use in pagination
function getCurrentFilters() {
    return {
        searchTerm: document.getElementById('search-projects').value,
        statusFilter: document.getElementById('status-filter').value
    };
}

// Load projects
async function loadProjects(page = 1, filters = {}) {
    try {
        // Update timestamp
        updateTimestamp();
        
        // Set current page
        currentPage = page;
        
        // Get filters
        const currentFilters = {...getCurrentFilters(), ...filters};
        console.log('Loading projects with filters:', currentFilters);
        
        // If status filter is set, use filterProjects instead
        if (currentFilters.statusFilter && currentFilters.statusFilter !== 'all') {
            // Set the select to match the filter if not already set
            const statusFilter = document.getElementById('status-filter');
            if (statusFilter.value !== currentFilters.statusFilter) {
                statusFilter.value = currentFilters.statusFilter;
            }
            return filterProjects(page);
        }
        
        // Normal loading without status filter
        // Ensure the projects table exists
        try {
            const { error: tableError } = await supabase.rpc('create_projects_table_if_not_exists');
            if (tableError) {
                console.error('Error ensuring projects table exists:', tableError);
            }
        } catch (e) {
            console.warn('Could not create table if not exists, may already exist:', e);
        }
        
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
        if (currentFilters.searchTerm) {
            const searchTerm = currentFilters.searchTerm.toLowerCase();
            filteredProjects = filteredProjects.filter(project => 
                project.name?.toLowerCase().includes(searchTerm)
            );
            
            // Update search input if needed
            const searchInput = document.getElementById('search-projects');
            if (searchInput.value !== currentFilters.searchTerm) {
                searchInput.value = currentFilters.searchTerm;
            }
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
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <p>No projects found. Add your first project by clicking the "Add New Project" button above.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Determine what column is used for status
    const firstProject = projects[0];
    const possibleStatusColumns = ['status', 'project_status', 'estado', 'state'];
    const statusColumn = possibleStatusColumns.find(col => firstProject[col] !== undefined) || 'status';
    console.log(`Table renderer using status column: "${statusColumn}"`);

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
            
            // Get the status from the correct column
            const statusValue = project[statusColumn];
            console.log(`Project ${project.id || project.name} status (${statusColumn}):`, statusValue);
            
            let statusText, statusClass;
            
            // Map status values to appropriate text and class
            if (statusValue === 'completed' || statusValue === true || statusValue === 'Completed') {
                statusText = 'Completed';
                statusClass = 'status-completed';
            } else if (statusValue === 'incompleted' || statusValue === false || statusValue === 'Incompleted') {
                statusText = 'Incompleted';
                statusClass = 'status-incompleted';
            } else if (statusValue === 'in_progress' || statusValue === null || statusValue === 'In Progress') {
                statusText = 'In Progress';
                statusClass = 'status-in-progress';
            } else {
                // Default fallback
                statusText = statusValue || 'Unknown';
                statusClass = `status-${(statusValue || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
            }
            
            // Format category name for display
            let categoryDisplay = 'Uncategorized';
            if (project.category) {
                categoryDisplay = project.category
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            // Create table row with basic data
            row.innerHTML = `
                <td>
                    <div class="project-title">${project.name || 'Unnamed Project'}</div>
                </td>
                <td>
                    <span class="category-badge">${categoryDisplay}</span>
                </td>
                <td>${createdDate}</td>
                <td>
                    ${project.file_url 
                        ? `<a href="javascript:void(0)" class="file-link" onclick="showFileInModal('${project.file_url}', '${fileInfo.name}')">${fileInfo.name}</a>` 
                        : 'No file'}
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${fileInfo.type}</td>
                <td>
                    <div class="action-buttons">
                        <a href="project-form.html?id=${project.id}" class="action-button edit-button" title="Edit">
                            <i class="fas fa-edit" style="font-size: 16px; color: white;"></i>
                        </a>
                        <button class="action-button delete-button" onclick="deleteProject('${project.id}')" title="Delete">
                            <i class="fas fa-trash-alt" style="font-size: 16px; color: white;"></i>
                        </button>
                    </div>
                </td>
            `;
        } catch (e) {
            console.error('Error creating row for project:', e, project);
            row.innerHTML = `
                <td colspan="7">
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
    const searchTerm = document.getElementById('search-projects').value.trim();
    console.log('Searching for:', searchTerm);
    
    // Reset to first page when searching
    loadProjects(1, {searchTerm: searchTerm});
}

// Filter projects
async function filterProjects(page = 1) {
    try {
        console.log('Filtering projects...');
        
        // Set current page
        currentPage = page || 1;
        
        const searchTerm = document.getElementById('search-projects').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        
        console.log(`Filter values: searchTerm="${searchTerm}", status="${statusFilter}"`);
        
        // Show loading state
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer) {
            projectsContainer.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #333;"></i>
                        <p style="margin-top: 1rem;">Loading projects...</p>
                    </td>
                </tr>
            `;
        }
        
        // First, fetch all projects to see what we're working with and filter on client side
        const { data: allProjectsData, error: allProjectsError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (allProjectsError) {
            console.error('Error fetching projects:', allProjectsError);
            if (projectsContainer) {
                projectsContainer.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                        <p>Error loading projects: ${allProjectsError.message}</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        if (!allProjectsData || allProjectsData.length === 0) {
            console.log('No projects found in database');
            if (projectsContainer) {
                projectsContainer.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            <p>No projects found. Add your first project by clicking the "Add New Project" button above.</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // Debug: Log all projects and their status values
        console.log('All projects:', allProjectsData);
        console.log('Status values:', allProjectsData.map(p => p.status || p.project_status));
        
        // IMPORTANT: Let's see what column is actually used for status
        const firstProject = allProjectsData[0];
        const possibleStatusColumns = ['status', 'project_status', 'estado', 'state'];
        const statusColumn = possibleStatusColumns.find(col => firstProject[col] !== undefined) || 'status';
        console.log(`Using status column: "${statusColumn}"`);
        
        // Filter projects based on the status value
        let filteredProjects = allProjectsData;
        
        if (statusFilter && statusFilter !== 'all') {
            console.log(`Filtering by status: ${statusFilter}`);
            
            // Filter projects according to the specified status
            filteredProjects = allProjectsData.filter(project => {
                const projectStatus = project[statusColumn];
                
                if (statusFilter === 'completed') {
                    return projectStatus === 'completed' || projectStatus === true || projectStatus === 'Completed';
                } else if (statusFilter === 'incompleted') {
                    return projectStatus === 'incompleted' || projectStatus === false || projectStatus === 'Incompleted';
                } else if (statusFilter === 'in_progress') {
                    return projectStatus === 'in_progress' || projectStatus === null || projectStatus === 'In Progress';
                }
                
                // If the status doesn't match any expected value, keep the default
                return true;
            });
            
            console.log(`Filtered to ${filteredProjects.length} projects with status "${statusFilter}"`);
        }
        
        // Apply search term filter if needed
        if (searchTerm) {
            filteredProjects = filteredProjects.filter(project => 
                (project.name && project.name.toLowerCase().includes(searchTerm))
            );
            console.log(`Search filtered to ${filteredProjects.length} projects`);
        }
        
        // If no projects found after filtering
        if (filteredProjects.length === 0) {
            if (projectsContainer) {
                projectsContainer.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem;">
                            <p>No projects found matching your criteria.</p>
                            <button onclick="resetFilters()" class="reset-filters-button">
                                <i class="fas fa-undo"></i> Clear Filters
                            </button>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = Math.min(startIndex + projectsPerPage, filteredProjects.length);
        const paginatedProjects = filteredProjects.slice(startIndex, endIndex);
        
        // Update the projects table with the paginated results
        updateProjectsTable(paginatedProjects);
        
        // Update pagination controls
        updatePagination(currentPage, totalPages);
        
    } catch (err) {
        console.error('Error in filterProjects:', err);
        alert('Error filtering projects: ' + err.message);
    }
}

// Reset all filters and reload projects
function resetFilters() {
    // Reset search input
    document.getElementById('search-projects').value = '';
    
    // Reset status filter to "all"
    document.getElementById('status-filter').value = 'all';
    
    // Reset to first page and reload projects
    loadProjects(1);
}

// Make sure the admin email stays visible by keeping it separate from the project loading process
// Add this near the beginning of your script or in the document ready function:
async function loadAdminInfo() {
    const { data: user, error } = await supabase.auth.getUser();
    if (user) {
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.textContent = user.email || 'Admin';
        }
    } else {
        console.error('User not found:', error);
    }
}


// Call this function when the page loads and never reset it during filtering
document.addEventListener('DOMContentLoaded', function() {
    loadAdminInfo();
    // Other initialization code...
});

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing admin dashboard...');
        
        // Check Supabase connection
        const { data: versionData, error: versionError } = await supabase.rpc('version');
        console.log('Supabase connection test:', versionData || 'unavailable', versionError);
        
    await checkAdminAccess();
        
        // Ensure projects table exists
        const tableExists = await ensureProjectsTable();
        
        if (tableExists) {
            console.log('Projects table exists, checking for data...');
            // Check if there are any projects
            const { count, error: countError } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true });
                
            console.log('Projects count:', count, 'Error:', countError);
                
            if (!countError && count === 0) {
                console.log('No projects found, creating test project...');
                await createTestProject();
            }
        } else {
            console.log('Projects table does not exist, creating test project anyway...');
            await createTestProject();
        }
        
        // Load initial data
        await updateStats();
        await loadProjects();
        
        // Add event listeners for search and filter
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', searchProjects);
        }
        
        const searchInput = document.getElementById('search-projects');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchProjects();
                }
            });
        }
        
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                filterProjects(1); // Reset to first page when changing filter
            });
        }
        
        // Add pagination event listeners
        const prevPage = document.getElementById('prev-page');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (currentPage > 1) {
                    loadProjects(--currentPage, getCurrentFilters());
                }
            });
        }
        
        const nextPage = document.getElementById('next-page');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                loadProjects(++currentPage, getCurrentFilters());
            });
        }
        
        // Logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
        }
        
    } catch (err) {
        console.error('Error initializing admin dashboard:', err);
        
        // Create a visible error message for the user
        const adminMain = document.querySelector('.admin-main');
        if (adminMain) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `
                <h3>Error Initializing Dashboard</h3>
                <p>${err.message}</p>
                <p>Please check the console for more details.</p>
                <button onclick="location.reload()">Retry</button>
            `;
            adminMain.prepend(errorDiv);
        }
    }
});

// Debug function to inspect projects data
window.inspectProjects = async function() {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*');
            
        if (error) {
            console.error('Error fetching projects for inspection:', error);
            return;
        }
        
        if (!data || data.length === 0) {
            console.log('No projects found in database');
            return;
        }
        
        // Log the first project to see its structure
        console.log('First project structure:', data[0]);
        
        // List all available columns
        const columns = Object.keys(data[0]);
        console.log('Available columns:', columns);
        
        // Check status values
        const statusValues = [...new Set(data.map(p => p.status))];
        console.log('Unique status values in database:', statusValues);
        
        // Count projects by status
        const statusCounts = statusValues.reduce((acc, status) => {
            acc[status || 'null'] = data.filter(p => p.status === status).length;
            return acc;
        }, {});
        console.log('Projects count by status:', statusCounts);
        
        return {
            total: data.length,
            structure: data[0],
            columns,
            statusValues,
            statusCounts,
            allProjects: data
        };
    } catch (err) {
        console.error('Error in inspectProjects:', err);
    }
};

// Show file in modal with appropriate preview based on file type
function showFileInModal(fileUrl, fileName) {
    const modal = document.getElementById('file-viewer-modal');
    const title = document.getElementById('modal-file-title');
    const iframe = document.getElementById('file-iframe');
    const imgPreview = document.getElementById('file-image');
    const unsupportedView = document.getElementById('file-unsupported');
    const downloadLink = document.getElementById('file-download-link');
    const downloadButton = document.getElementById('download-button');
    const fileLoading = document.getElementById('file-loading');
    const fileInfo = document.getElementById('file-info');
    const fileTypeIcon = document.getElementById('file-type-icon');
    const zoomInButton = document.getElementById('zoom-in-button');
    const zoomOutButton = document.getElementById('zoom-out-button');
    const flipbook = document.getElementById('flipbook');
    const flipbookWrapper = document.getElementById('flipbook-wrapper');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    // Reset zoom
    imgPreview.style.transform = 'scale(1)';
    
    // Show loading indicator
    fileLoading.style.display = 'flex';
    
    // Hide all preview elements initially
    iframe.style.display = 'none';
    imgPreview.style.display = 'none';
    unsupportedView.style.display = 'none';
    flipbookWrapper.style.display = 'none';
    flipbook.style.display = 'none';
    
    // Destroy any existing Turn.js instance - fix for "is is an invalid value" error
    try {
        if ($(flipbook).data().turn) {
            $(flipbook).turn('destroy');
        }
    } catch (e) {
        console.log('No existing Turn instance to destroy:', e);
    }
    
    // Reset flipbook container
    flipbook.innerHTML = '';
    
    // Set the modal title to the file name
    title.textContent = fileName || 'File Preview';
    
    // Set download links
    downloadLink.href = fileUrl;
    downloadLink.setAttribute('download', fileName || 'download');
    downloadButton.href = fileUrl;
    downloadButton.setAttribute('download', fileName || 'download');
    
    // Show the modal
    modal.style.display = 'block';
    
    // Determine file type and update file info
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const fileTypeMap = {
        'jpg': { type: 'Image', icon: 'JPG', color: '#3a7bd5' },
        'jpeg': { type: 'Image', icon: 'JPG', color: '#3a7bd5' },
        'png': { type: 'Image', icon: 'PNG', color: '#28a745' },
        'gif': { type: 'Image', icon: 'GIF', color: '#fd7e14' },
        'svg': { type: 'Image', icon: 'SVG', color: '#6610f2' },
        'webp': { type: 'Image', icon: 'WP', color: '#20c997' },
        'pdf': { type: 'Document', icon: 'PDF', color: '#dc3545' },
        'txt': { type: 'Text', icon: 'TXT', color: '#6c757d' },
        'html': { type: 'Code', icon: 'HTML', color: '#e83e8c' },
        'htm': { type: 'Code', icon: 'HTML', color: '#e83e8c' },
        'css': { type: 'Code', icon: 'CSS', color: '#007bff' },
        'js': { type: 'Code', icon: 'JS', color: '#ffc107' },
        'doc': { type: 'Document', icon: 'DOC', color: '#007bff' },
        'docx': { type: 'Document', icon: 'DOCX', color: '#007bff' }
    };
    
    const fileType = fileTypeMap[fileExtension] || { type: 'Unknown', icon: 'FILE', color: '#6c757d' };
    fileInfo.textContent = `${fileType.type} • ${formatFileSize(1024 * 1024)} • ${formatDate(new Date())}`;
    fileTypeIcon.textContent = fileType.icon;
    fileTypeIcon.style.background = fileType.color;
    
    // Show or hide zoom buttons based on file type
    const canZoom = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension);
    zoomInButton.style.display = canZoom ? 'flex' : 'none';
    zoomOutButton.style.display = canZoom ? 'flex' : 'none';
    
    // Choose appropriate preview based on file extension
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension)) {
        // Image preview
        imgPreview.onload = function() {
            fileLoading.style.display = 'none';
            imgPreview.style.display = 'block';
        };
        imgPreview.onerror = function() {
            fileLoading.style.display = 'none';
            unsupportedView.style.display = 'block';
        };
        imgPreview.src = fileUrl;
    } 
    else if (['pdf'].includes(fileExtension)) {
        // PDF Flipbook using PDF.js and Turn.js
        flipbookWrapper.style.display = 'block';
        
        try {
            console.log('Starting PDF processing for flipbook');
            // First check if libraries are loaded
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('PDF.js library not loaded');
            }
            
            if (typeof $ === 'undefined' || typeof $.fn.turn === 'undefined') {
                throw new Error('Turn.js library not loaded');
            }
            
            // Load the PDF file
            console.log('Loading PDF from URL:', fileUrl);
            pdfjsLib.getDocument(fileUrl).promise.then(function(pdf) {
                console.log('PDF loaded successfully with', pdf.numPages, 'pages');
                
                // Store number of pages globally
                window.numPages = pdf.numPages;
                
                // Clear existing content first
                flipbook.innerHTML = '';
                
                // Create a new container for Turn.js to avoid issues with reuse
                const flipContainer = document.createElement('div');
                flipContainer.id = 'flipbook-pages';
                flipContainer.className = 'flipbook-container';
                flipbook.appendChild(flipContainer);
                
                // Initialize the flipbook with only the exact required pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page';
                    pageDiv.id = `page-${i}`;
                    pageDiv.style.position = 'relative';
                    pageDiv.style.overflow = 'hidden';
                    
                    // Loading placeholder
                    const placeholder = document.createElement('div');
                    placeholder.style.position = 'absolute';
                    placeholder.style.top = '50%';
                    placeholder.style.left = '50%';
                    placeholder.style.transform = 'translate(-50%, -50%)';
                    placeholder.style.color = '#999';
                    placeholder.textContent = `Carregando página ${i}...`;
                    pageDiv.appendChild(placeholder);
                    
                    // Page number for reference
                    const pageNumber = document.createElement('div');
                    pageNumber.textContent = i;
                    pageNumber.style.position = 'absolute';
                    pageNumber.style.bottom = '10px';
                    pageNumber.style.right = '10px';
                    pageNumber.style.fontSize = '12px';
                    pageNumber.style.color = '#999';
                    pageNumber.style.zIndex = '100';
                    pageDiv.appendChild(pageNumber);
                    
                    flipContainer.appendChild(pageDiv);
                }
                
                // Initialize the flipbook with explicit numeric dimensions
                setTimeout(() => {
                    try {
                        $(flipContainer).turn({
                            width: 800,
                            height: 600,
                            autoCenter: true,
                            display: 'single',
                            duration: 600,
                            acceleration: true,
                            gradients: true,
                            elevation: 50,
                            page: 1,
                            when: {
                                turning: function(event, page, view) {
                                    // Load current page
                                    loadPageContent(page);
                                },
                                turned: function(event, page, view) {
                                    // Update navigation button states
                                    prevBtn.disabled = page <= 1;
                                    nextBtn.disabled = page >= pdf.numPages;
                                }
                            }
                        });
                        
                        console.log('Turn.js initialized successfully');
                    } catch (turnError) {
                        console.error('Error initializing Turn.js:', turnError);
                        fallbackToPdfViewer(fileUrl);
                    }
                }, 100); // Small delay to ensure DOM is ready
                
                // Function to directly render PDF page to a canvas
                async function loadPageContent(pageNum) {
                    if (pageNum < 1 || pageNum > pdf.numPages) return;
                    
                    const pageDiv = document.getElementById(`page-${pageNum}`);
                    if (!pageDiv || pageDiv.querySelector('canvas')) return;
                    
                    try {
                        const page = await pdf.getPage(pageNum);
                        
                        const viewport = page.getViewport({scale: 1.0});
                        const containerWidth = 750;
                        const containerHeight = 550;
                        
                        const scaleX = containerWidth / viewport.width;
                        const scaleY = containerHeight / viewport.height;
                        const scale = Math.min(scaleX, scaleY) * 0.95;
                        
                        const scaledViewport = page.getViewport({scale});
                        
                        const canvas = document.createElement('canvas');
                        canvas.width = scaledViewport.width;
                        canvas.height = scaledViewport.height;
                        
                        canvas.style.position = 'absolute';
                        canvas.style.top = '50%';
                        canvas.style.left = '50%';
                        canvas.style.transform = 'translate(-50%, -50%)';
                        canvas.style.border = '1px solid #eee';
                        
                        pageDiv.innerHTML = '';
                        pageDiv.appendChild(canvas);
                        
                        const pageNumber = document.createElement('div');
                        pageNumber.textContent = pageNum;
                        pageNumber.style.position = 'absolute';
                        pageNumber.style.bottom = '10px';
                        pageNumber.style.right = '10px';
                        pageNumber.style.fontSize = '12px';
                        pageNumber.style.color = '#333';
                        pageNumber.style.background = 'rgba(255,255,255,0.7)';
                        pageNumber.style.padding = '3px 8px';
                        pageNumber.style.borderRadius = '10px';
                        pageDiv.appendChild(pageNumber);
                        
                        const context = canvas.getContext('2d');
                        await page.render({
                            canvasContext: context,
                            viewport: scaledViewport
                        }).promise;
                    } catch (error) {
                        console.error(`Error rendering page ${pageNum}:`, error);
                        pageDiv.innerHTML = `<div style="padding: 20px; text-align: center;">
                            Erro ao carregar página ${pageNum}<br>
                            <small>${error.message}</small>
                        </div>`;
                    }
                }
                
                // Load first page immediately
                loadPageContent(1);
                
                // Hide loading indicator and show flipbook
                fileLoading.style.display = 'none';
                flipbook.style.display = 'block';
                
                // Update button states
                prevBtn.disabled = true;
                nextBtn.disabled = pdf.numPages <= 1;
                
                // Add navigation handlers
                $(prevBtn).off('click').on('click', function() {
                    try {
                        $(flipContainer).turn('previous');
                    } catch (e) {
                        console.error('Error navigating to previous page:', e);
                    }
                    return false;
                });
                
                $(nextBtn).off('click').on('click', function() {
                    try {
                        $(flipContainer).turn('next');
                    } catch (e) {
                        console.error('Error navigating to next page:', e);
                    }
                    return false;
                });
                
            }).catch(function(error) {
                console.error('Error loading PDF:', error);
                fallbackToPdfViewer(fileUrl);
            });
        } catch (e) {
            console.error('General error in PDF processing:', e);
            fallbackToPdfViewer(fileUrl);
        }
    }
    else if (['doc', 'docx'].includes(fileExtension)) {
        iframe.onload = function() {
            fileLoading.style.display = 'none';
            iframe.style.display = 'block';
        };
        iframe.onerror = function() {
            fileLoading.style.display = 'none';
            unsupportedView.style.display = 'block';
        };
        const encodedUrl = encodeURIComponent(fileUrl);
        iframe.src = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
    }
    else if (['txt', 'html', 'htm', 'css', 'js'].includes(fileExtension)) {
        iframe.onload = function() {
            fileLoading.style.display = 'none';
            iframe.style.display = 'block';
        };
        iframe.onerror = function() {
            fileLoading.style.display = 'none';
            unsupportedView.style.display = 'block';
        };
        iframe.src = fileUrl;
    }
    else {
        fileLoading.style.display = 'none';
        unsupportedView.style.display = 'block';
    }
}

// Fallback function for PDF viewing
function fallbackToPdfViewer(pdfUrl) {
    console.log('Using fallback PDF viewer');
    const fileLoading = document.getElementById('file-loading');
    const flipbookWrapper = document.getElementById('flipbook-wrapper');
    const iframe = document.getElementById('file-iframe');
    const unsupportedView = document.getElementById('file-unsupported');
    
    fileLoading.style.display = 'none';
    flipbookWrapper.style.display = 'none';
    
    iframe.onload = function() {
        fileLoading.style.display = 'none';
        iframe.style.display = 'block';
    };
    iframe.onerror = function() {
        fileLoading.style.display = 'none';
        unsupportedView.style.display = 'block';
    };
    iframe.src = pdfUrl;
} 