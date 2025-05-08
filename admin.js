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
const projectsPerPage = 6; // Changed from 10 to 6 items per page
let allUsers = []; // Para armazenar todos os usuários

// Global variable for user pagination
let userCurrentPage = 1;
const usersPerPage = 6; // Changed from 10 to 6 items per page

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
            
            // If the error is about invalid UUID, it might be related to schema issues
            if (error.message && error.message.includes('invalid input syntax for type uuid')) {
                console.warn('UUID error encountered when checking projects table. Attempting to fix schema...');
                
                try {
                    // Create the table with proper UUID schema
                    const { error: rpcError } = await supabase.rpc('create_projects_table_if_not_exists', {
                        force_recreate: false
                    });
                    
                    if (rpcError) {
                        console.error('Error creating projects table with RPC:', rpcError);
                        return false;
                    }
                    
                    // Try selecting again to verify
                    const { data: verifyData, error: verifyError } = await supabase
                        .from('projects')
                        .select('*', { count: 'exact', head: true });
                        
                    if (verifyError) {
                        console.error('Error verifying table after fix attempt:', verifyError);
                        return false;
                    }
                    
                    console.log('Table issue fixed successfully. Count:', verifyData?.count || 0);
                    return true;
                } catch (rpcException) {
                    console.error('Exception in RPC fix attempt:', rpcException);
                    return false;
                }
            }
            
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
            
            // Check if this is the common "invalid input syntax for type uuid: id" error
            if (error.message && error.message.includes('invalid input syntax for type uuid: "id"')) {
                console.warn('Encountered common UUID format error. This typically happens on first admin login.');
                // Try again after a short delay (this often resolves the issue)
                setTimeout(() => {
                    loadProjects(page, filters);
                }, 500);
                return;
            }
            
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
        
        // Truncate long filenames to keep UI clean
        if (fileName.length > 15) {
            const extension = fileName.split('.').pop();
            const name = fileName.substring(0, fileName.lastIndexOf('.'));
            const truncatedName = name.substring(0, 10) + '...';
            fileName = truncatedName + '.' + extension;
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
    
    if (!projectsContainer) {
        console.error('Projects container element not found!');
        return;
    }
    
    projectsContainer.innerHTML = '';

    if (!projects || projects.length === 0) {
        projectsContainer.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <p>No projects found. Add your first project by clicking the \"Add New Project\" button above.</p>
                </td>
            </tr>
        `;
        return;
    }

    const firstProject = projects[0];
    const possibleStatusColumns = ['status', 'project_status', 'estado', 'state'];
    const statusColumn = possibleStatusColumns.find(col => firstProject[col] !== undefined) || 'status';

    const isMobile = window.innerWidth <= 700;

    projects.forEach(project => {
        const row = document.createElement('tr');
        row.setAttribute('data-project-id', project.id);
        
        try {
            const createdDate = project.created_at 
                ? new Date(project.created_at).toLocaleDateString() 
                : 'Unknown date';
            
            let fileInfo = { name: 'No file', type: 'Document' };
            if (project.file_url) {
                try {
                    const url = new URL(project.file_url);
                    const pathParts = url.pathname.split('/');
                    fileInfo.name = decodeURIComponent(pathParts[pathParts.length - 1]);
                    
                    // Determine file type based on file extension or name pattern
                    const isVideo = fileInfo.name.includes('video-') || 
                                    /\.(mp4|webm|mov|avi|wmv|mpeg|mpg)$/i.test(fileInfo.name);
                    
                    if (isVideo) {
                        fileInfo.type = 'Video';
                    } else if (fileInfo.name.includes('.')) {
                        fileInfo.type = fileInfo.name.split('.').pop().toUpperCase();
                    }
                } catch (e) {
                    console.warn('Error parsing file URL:', e);
                }
            }
            
            const statusValue = project[statusColumn];
            let statusText, statusClass;
            
            if (statusValue === 'completed' || statusValue === true || statusValue === 'Completed') {
                statusText = 'COMPLETED';
                statusClass = 'status-completed';
            } else if (statusValue === 'incompleted' || statusValue === false || statusValue === 'Incompleted') {
                statusText = 'INCOMPLETED';
                statusClass = 'status-incompleted';
            } else if (statusValue === 'in_progress' || statusValue === null || statusValue === 'In Progress') {
                statusText = 'IN PROGRESS';
                statusClass = 'status-in-progress';
            } else {
                statusText = statusValue || 'UNKNOWN';
                statusClass = `status-${(statusValue || 'unknown').toLowerCase().replace(/\s+/g, '-')}`;
            }
            
            let categoryDisplay = 'Uncategorized';
            if (project.category) {
                categoryDisplay = project.category
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            // Create a nice file link with an appropriate icon
            const fileLink = project.file_url 
                ? `<a href="javascript:void(0)" class="file-link" onclick="showFileInModal('${project.file_url}', '${fileInfo.name}')">
                      ${fileInfo.type === 'Video' ? '<i class="fas fa-video" style="margin-right: 5px; color: #e83e8c;"></i>' : ''}
                      ${fileInfo.name}
                   </a>` 
                : 'No file';
            
            // Add data attributes to the share button to make it easier to handle
            const safeProjectName = (project.name || 'Unnamed Project').replace(/'/g, '&#39;');
            
            if (isMobile) {
                // MOBILE: collapsible row with menu button
                row.innerHTML = `
                    <td colspan=\"7\" class=\"project-mobile-cell\">
                        <div class=\"project-title-mobile\" style=\"display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-weight: 500;\" onclick=\"toggleProjectDetails(this)\">
                            <span>${project.name || 'Unnamed Project'}</span>
                            <button class=\"menu-btn\" onclick=\"event.stopPropagation();toggleMenu(this)\" style=\"background: none; border: none; cursor: pointer; font-size: 1.2em; color: #888; padding: 4px 8px; border-radius: 50%;\">
                                <i class=\"fas fa-ellipsis-h\"></i>
                            </button>
                            <div class=\"menu-dropdown\" style=\"display: none; position: absolute; top: 32px; right: 0; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.13); min-width: 56px; z-index: 1000; padding: 10px 0; flex-direction: column; gap: 10px; align-items: stretch;\">
                                <button class=\"action-button edit-button\" onclick=\"window.location.href='project-form.html?id=${project.id}'\" title=\"Edit\"><i class=\"fas fa-edit\"></i></button>
                                <button class=\"action-button delete-button\" onclick=\"deleteProject('${project.id}')\" title=\"Delete\"><i class=\"fas fa-trash-alt\"></i></button>
                                <button class=\"action-button share-button\" 
                                    data-project-id=\"${project.id}\" 
                                    data-project-name=\"${safeProjectName}\"
                                    title=\"Share\"><i class=\"fas fa-share-alt\"></i></button>
                                <button class=\"action-button feature-button${project.is_featured ? ' featured' : ''}\" onclick=\"toggleFeaturedStatus('${project.id}', ${!project.is_featured})\" title=\"Favorite\"><i class=\"${project.is_featured ? 'fas' : 'far'} fa-star\"></i></button>
                            </div>
                        </div>
                        <div class=\"project-details-mobile\" style=\"display:none; margin-top:10px;\">
                            <div><b>Category:</b> <span class=\"category-badge\">${categoryDisplay}</span></div>
                            <div><b>Status:</b> <span class=\"status-badge ${statusClass}\">${statusText}</span></div>
                            <div><b>Type:</b> ${fileInfo.type}</div>
                            <div><b>File:</b> ${fileLink}</div>
                            <div><b>Created:</b> ${createdDate}</div>
                        </div>
                    </td>
                `;
            } else {
                // DESKTOP: tabela tradicional
                row.innerHTML = `
                    <td style=\"width: 20%;\">
                        <div style=\"display: flex; align-items: center; gap: 8px;\">
                            <span style=\"font-weight: 500;\">${project.name || 'Unnamed Project'}</span>
                        </div>
                    </td>
                    <td style=\"width: 13%;\"><span class=\"category-badge\">${categoryDisplay}</span></td>
                    <td style=\"width: 13%;\"><span class=\"status-badge ${statusClass}\">${statusText}</span></td>
                    <td style=\"width: 8%;\">
                        ${fileInfo.type === 'Video' ? '<i class="fas fa-video" style="margin-right: 5px; color: #e83e8c;"></i>' : ''}
                        ${fileInfo.type}
                    </td>
                    <td style=\"width: 22%;\">${fileLink}</td>
                    <td style=\"width: 12%;\">${createdDate}</td>
                    <td style=\"width: 12%;\">
                        <div class=\"action-buttons\">
                            <button class=\"action-button edit-button\" onclick=\"window.location.href='project-form.html?id=${project.id}'\" title=\"Edit\">
                                <i class=\"fas fa-edit\"></i>
                            </button>
                            <button class=\"action-button delete-button\" onclick=\"deleteProject('${project.id}')\" title=\"Delete\">
                                <i class=\"fas fa-trash-alt\"></i>
                            </button>
                            <button class=\"action-button share-button\" 
                                data-project-id=\"${project.id}\" 
                                data-project-name=\"${safeProjectName}\"
                                title=\"Share\">
                                <i class=\"fas fa-share-alt\"></i>
                            </button>
                            <button class=\"action-button feature-button${project.is_featured ? ' featured' : ''}\" onclick=\"toggleFeaturedStatus('${project.id}', ${!project.is_featured})\" title=\"Favorite\">
                                <i class=\"${project.is_featured ? 'fas' : 'far'} fa-star\"></i>
                            </button>
                        </div>
                    </td>
                `;
            }
        } catch (e) {
            console.error('Error creating row for project:', e, project);
            row.innerHTML = `
                <td colspan=\"7\">Error displaying project: ${e.message}</td>
            `;
        }
        
        projectsContainer.appendChild(row);
    });

    // Dropdown menu logic (mobile)
    if (!window.__menuDropdownInjected) {
        window.__menuDropdownInjected = true;
        document.addEventListener('click', function(e) {
            document.querySelectorAll('.card-menu, .project-title-mobile').forEach(menu => {
                const dropdown = menu.querySelector('.menu-dropdown');
                if (dropdown && !menu.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        });
        window.toggleMenu = function(btn) {
            const menu = btn.parentElement;
            const dropdown = menu.querySelector('.menu-dropdown');
            document.querySelectorAll('.card-menu .menu-dropdown, .project-title-mobile .menu-dropdown').forEach(d => { if (d !== dropdown) d.style.display = 'none'; });
            dropdown.style.display = (dropdown.style.display === 'flex') ? 'none' : 'flex';
        }
    }
    
    // Initialize event listeners for share buttons
    initializeEventListeners();
}

// Update pagination controls
function updatePagination(currentPage, totalPages, section = 'projects') {
    const prefix = section === 'users' ? 'users-' : '';
    const pageNumbersContainer = document.getElementById(`${prefix}page-numbers`);
    
    pageNumbersContainer.innerHTML = '';
    
    // Don't show pagination if there's only one page
    if (totalPages <= 1) {
        document.querySelector(`#${prefix}page-numbers`).parentElement.style.display = 'none';
        return;
    } else {
        document.querySelector(`#${prefix}page-numbers`).parentElement.style.display = 'flex';
    }
    
    // Determine range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Add first page button if not in range
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.classList.add('page-number');
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => {
            if (section === 'users') {
                loadUsers(1, getUserFilters());
            } else {
                loadProjects(1, getCurrentFilters());
            }
        });
        pageNumbersContainer.appendChild(firstPageBtn);
        
        // Add ellipsis if there's a gap
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('page-ellipsis');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }
    
    // Create page number buttons for the range
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-number');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (section === 'users') {
                loadUsers(i, getUserFilters());
            } else {
                loadProjects(i, getCurrentFilters());
            }
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
    
    // Add last page button if not in range
    if (endPage < totalPages) {
        // Add ellipsis if there's a gap
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('page-ellipsis');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.classList.add('page-number');
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => {
            if (section === 'users') {
                loadUsers(totalPages, getUserFilters());
            } else {
                loadProjects(totalPages, getCurrentFilters());
            }
        });
        pageNumbersContainer.appendChild(lastPageBtn);
    }
}

// Delete project
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        // Check that projectId is a valid UUID
        console.log('Attempting to delete project with ID:', projectId);
        
        if (!projectId || typeof projectId !== 'string') {
            console.error('Invalid project ID (null or not a string):', projectId);
            alert('Error: Invalid project ID');
            return;
        }
        
        // Basic UUID format validation (not perfect but catches obvious issues)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(projectId)) {
            console.error('Project ID is not a valid UUID format:', projectId);
            alert('Error: Invalid project ID format');
            return;
        }

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
        
        // Initialize user management
        await loadUsers();
        
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
        
        // Add pagination event listeners for projects
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
        
        // User management event listeners
        const userSearchInput = document.getElementById('search-users');
        if (userSearchInput) {
            userSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchUsers();
                }
            });
        }
        
        const roleFilter = document.getElementById('role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', filterUsers);
        }
        
        // Add user button
        const addUserButton = document.getElementById('add-user-button');
        if (addUserButton) {
            addUserButton.addEventListener('click', () => showUserModal());
        }
        
        // User modal close button
        const closeModalButtons = document.querySelectorAll('.close-modal');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the parent modal
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
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
    const videoWrapper = document.getElementById('video-wrapper');
    const videoPlayer = document.getElementById('video-player');
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
    videoWrapper.style.display = 'none';
    
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
        'docx': { type: 'Document', icon: 'DOCX', color: '#007bff' },
        // Add video file types
        'mp4': { type: 'Video', icon: 'MP4', color: '#e83e8c' },
        'webm': { type: 'Video', icon: 'WEBM', color: '#20c997' },
        'mov': { type: 'Video', icon: 'MOV', color: '#fd7e14' },
        'avi': { type: 'Video', icon: 'AVI', color: '#6610f2' },
        'wmv': { type: 'Video', icon: 'WMV', color: '#007bff' },
        'mpeg': { type: 'Video', icon: 'MPG', color: '#dc3545' },
        'mpg': { type: 'Video', icon: 'MPG', color: '#dc3545' },
    };
    
    const fileType = fileTypeMap[fileExtension] || { type: 'Unknown', icon: 'FILE', color: '#6c757d' };
    fileInfo.textContent = `${fileType.type} • ${formatFileSize(1024 * 1024)} • ${formatDate(new Date())}`;
    fileTypeIcon.textContent = fileType.icon;
    fileTypeIcon.style.background = fileType.color;
    
    // Show or hide zoom buttons based on file type
    const canZoom = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension);
    zoomInButton.style.display = canZoom ? 'flex' : 'none';
    zoomOutButton.style.display = canZoom ? 'flex' : 'none';
    
    // Check if the filename contains video prefix
    const isVideoFile = fileExtension.match(/(mp4|webm|mov|avi|wmv|mpeg|mpg)$/i) || fileName.includes('video-');
    
    // Choose appropriate preview based on file extension
    if (isVideoFile) {
        // Video preview
        const videoWrapper = document.getElementById('video-wrapper');
        const videoPlayer = document.getElementById('video-player');
        const videoDownloadButton = document.getElementById('video-download-button');
        const videoFullscreenButton = document.getElementById('video-fullscreen-button');
        
        videoWrapper.style.display = 'block';
        videoPlayer.src = fileUrl;
        
        // Set download link
        videoDownloadButton.href = fileUrl;
        videoDownloadButton.setAttribute('download', fileName);
        
        // Add fullscreen functionality
        videoFullscreenButton.onclick = function() {
            if (videoPlayer.requestFullscreen) {
                videoPlayer.requestFullscreen();
            } else if (videoPlayer.webkitRequestFullscreen) { /* Safari */
                videoPlayer.webkitRequestFullscreen();
            } else if (videoPlayer.msRequestFullscreen) { /* IE11 */
                videoPlayer.msRequestFullscreen();
            }
        };
        
        // Update the file type icon for video
        fileTypeIcon.textContent = 'VID';
        fileTypeIcon.style.background = '#e83e8c';
        
        // Video events
        videoPlayer.onloadeddata = function() {
            fileLoading.style.display = 'none';
            
            // Update file info with actual duration
            const duration = Math.round(videoPlayer.duration);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            const durationText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            
            const fileSizeText = formatFileSize(1024 * 1024); // Placeholder size
            fileInfo.textContent = `Video • ${fileSizeText} • ${durationText}`;
        };
        
        videoPlayer.onerror = function() {
            fileLoading.style.display = 'none';
            unsupportedView.style.display = 'block';
            console.error('Video loading error:', videoPlayer.error);
        };
        
        // Try to load the video
        videoPlayer.load();
    } 
    else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileExtension)) {
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

// Função para carregar usuários para compartilhamento
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error loading users:', error);
            return [];
        }
        
        allUsers = data || [];
        return allUsers;
    } catch (e) {
        console.error('Error in loadUsers:', e);
        return [];
    }
}

// Function to get users with whom a project is shared
async function getProjectShares(projectId) {
    try {
        console.log(`Getting shares for project ID: ${projectId}`);
        
        const { data, error } = await supabase
            .from('project_shares')
            .select(`
                id,
                user_id,
                shared_at,
                shared_by,
                Users:user_id (id, username),
                sharer:shared_by (username)
            `)
            .eq('project_id', projectId);
            
        if (error) {
            console.error('Error getting project shares:', error);
            return [];
        }
        
        console.log('Project shares data:', data);
        
        if (!data || data.length === 0) {
            console.log('No shares found for this project');
            return [];
        }
        
        return data;
    } catch (e) {
        console.error('Exception in getProjectShares:', e);
        return [];
    }
}

// Function to remove share access
async function removeShareAccess(shareId) {
    try {
        const { data, error } = await supabase
            .from('project_shares')
            .delete()
            .eq('id', shareId);
            
        if (error) {
            console.error('Error removing share access:', error);
            return { success: false, message: `Error removing access: ${error.message}` };
        }
        
        return { success: true, message: 'Access removed successfully!' };
    } catch (e) {
        console.error('Exception in removeShareAccess:', e);
        return { success: false, message: `Error removing access: ${e.message}` };
    }
}

// Function to show the share modal
function showShareModal(projectId, projectName) {
    console.log('Opening share modal for project:', projectId, projectName);
    
    // Create share modal if it doesn't exist
    let modal = document.getElementById('share-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Share Project</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <p id="share-project-name"></p>
                    
                    <div class="share-form">
                        <label for="share-user-select">Select user:</label>
                        <select id="share-user-select" class="form-control">
                            <option value="">Choose a user...</option>
                        </select>
                    </div>
                    
                    <div id="share-error" class="error-message" style="display: none;"></div>
                    <div id="share-success" class="success-message" style="display: none;"></div>
                    
                    <div class="current-shares-section">
                        <h3>Currently shared with</h3>
                        <div id="current-shares-list" class="current-shares-list">
                            <div class="loading-shares">Loading...</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="share-button" class="btn primary-button">Share</button>
                    <button id="cancel-share" class="btn secondary-button">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event to close modal
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#cancel-share').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside content area
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Update project information
    document.getElementById('share-project-name').textContent = `Project: ${projectName}`;
    
    // Clear error/success messages
    document.getElementById('share-error').style.display = 'none';
    document.getElementById('share-success').style.display = 'none';
    
    // Validate that users exist before trying to load them
    validateUsersExist().then(usersExist => {
        if (!usersExist) {
            const userSelect = document.getElementById('share-user-select');
            userSelect.innerHTML = '<option value="">No users available to share with</option>';
            userSelect.disabled = true;
            document.getElementById('share-button').disabled = true;
            
            // Show message about no users
            const errorDiv = document.getElementById('share-error');
            errorDiv.textContent = 'No regular users found in the system. Please create a non-admin user first.';
            errorDiv.style.display = 'block';
        } else {
            // Load users for sharing
            loadUsersForSharing(projectId);
        }
    });
    
    // Load current shares
    loadCurrentShares(projectId);
    
    // Configure share button
    const shareButton = document.getElementById('share-button');
    shareButton.onclick = async function() {
        try {
            const selectedUserId = document.getElementById('share-user-select').value;
            const errorDiv = document.getElementById('share-error');
            const successDiv = document.getElementById('share-success');
            
            // Validate user selection
            if (!selectedUserId) {
                errorDiv.textContent = 'Please select a user.';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                return;
            }
            
            // Show loading indicator
            showLoadingIndicator('Sharing project...');
            
            // Get current username
            const currentUsername = localStorage.getItem('currentUser');
            
            // Share the project (with timeout)
            const sharePromise = shareProject(projectId, selectedUserId, currentUsername);
            
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => resolve({ 
                    success: false, 
                    message: 'Operation timed out. Check console for errors.' 
                }), 15000);
            });
            
            // Race the share operation against the timeout
            const result = await Promise.race([sharePromise, timeoutPromise]);
            
            // Hide loading indicator
            hideLoadingIndicator();
            
            if (result.success) {
                successDiv.textContent = result.message;
                successDiv.style.display = 'block';
                errorDiv.style.display = 'none';
                
                // Reset select
                document.getElementById('share-user-select').value = '';
                
                // Reload the current shares list and available users
                loadCurrentShares(projectId);
                loadUsersForSharing(projectId);
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
                console.error('Share operation failed:', result.message);
            }
        } catch (error) {
            // Always hide loading indicator in case of error
            hideLoadingIndicator();
            
            // Show error message
            const errorDiv = document.getElementById('share-error');
            errorDiv.textContent = `An unexpected error occurred: ${error.message}`;
            errorDiv.style.display = 'block';
            
            // Hide success message
            const successDiv = document.getElementById('share-success');
            successDiv.style.display = 'none';
            
            console.error('Exception in share button handler:', error);
        }
    };
    
    // Display modal
    modal.style.display = 'block';
}

// Function to load users available for sharing
async function loadUsersForSharing(projectId) {
    try {
        const userSelect = document.getElementById('share-user-select');
        userSelect.innerHTML = '<option value="">Choose a user...</option>';
        userSelect.disabled = true;
        
        // Show loading in the dropdown
        const loadingOption = document.createElement('option');
        loadingOption.disabled = true;
        loadingOption.textContent = 'Loading users...';
        userSelect.appendChild(loadingOption);
        
        // Get users who already have access to this project
        const { data: shares, error: sharesError } = await supabase
            .from('project_shares')
            .select('user_id')
            .eq('project_id', projectId);
            
        if (sharesError) {
            console.error('Error getting project shares:', sharesError);
            throw sharesError;
        }
        
        console.log('Current shares:', shares);
        const userIdsWithAccess = shares ? shares.map(share => share.user_id) : [];
        
        // Get all users directly from the database
        const { data: users, error: usersError } = await supabase
            .from('Users')
            .select('id, username, is_admin');
            
        if (usersError) {
            console.error('Error fetching users from database:', usersError);
            throw usersError;
        }
        
        console.log('All users from database:', users);
        
        // Filter out admins and users who already have access
        const availableUsers = users ? users.filter(user => {
            const isAdmin = user.is_admin === true;
            const alreadyHasAccess = userIdsWithAccess.includes(user.id);
            return !isAdmin && !alreadyHasAccess;
        }) : [];
        
        console.log('Available users after filtering:', availableUsers);
        
        // Remove loading option
        try {
            userSelect.removeChild(loadingOption);
        } catch (e) {
            console.warn('Could not remove loading option:', e);
            userSelect.innerHTML = '<option value="">Choose a user...</option>';
        }
        
        if (!availableUsers || availableUsers.length === 0) {
            userSelect.innerHTML = '<option value="">No users available to share with</option>';
            userSelect.disabled = true;
            document.getElementById('share-button').disabled = true;
        } else {
            userSelect.innerHTML = '<option value="">Choose a user...</option>';
            userSelect.disabled = false;
            document.getElementById('share-button').disabled = false;
            
            availableUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                userSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users for sharing:', error);
        const userSelect = document.getElementById('share-user-select');
        userSelect.innerHTML = '<option value="">Error loading users</option>';
    }
}

// Function to check for users who can be added to projects
async function validateUsersExist() {
    try {
        // Get all non-admin users
        const { data: users, error } = await supabase
            .from('Users')
            .select('id, username, is_admin')
            .eq('is_admin', false);
            
        if (error) {
            console.error('Error checking for users:', error);
            return false;
        }
        
        console.log('Available non-admin users in system:', users);
        
        // If there are no regular users, create one for testing
        if (!users || users.length === 0) {
            console.warn('No non-admin users found. Creating a test user...');
            await createTestUser();
            return true;
        }
        
        return users.length > 0;
    } catch (e) {
        console.error('Error validating users exist:', e);
        return false;
    }
}

// Function to create a test user if none exist
async function createTestUser() {
    try {
        // Create unique test user
        const timestamp = new Date().getTime();
        const testUser = {
            username: `test_user_${timestamp}`,
            password: 'TestUser123!',
            is_admin: false,
            added_by_admin: true
        };
        
        const { data, error } = await supabase
            .from('Users')
            .insert([testUser])
            .select();
            
        if (error) {
            console.error('Error creating test user:', error);
            return false;
        }
        
        console.log('Created test user successfully:', data);
        return true;
    } catch (e) {
        console.error('Error creating test user:', e);
        return false;
    }
}

// Function to load and display current shares
async function loadCurrentShares(projectId) {
    const sharesContainer = document.getElementById('current-shares-list');
    sharesContainer.innerHTML = '<div class="loading-shares">Loading...</div>';
    
    const shares = await getProjectShares(projectId);
    
    if (shares.length === 0) {
        sharesContainer.innerHTML = '<div class="no-shares">This project is not shared with anyone yet.</div>';
        return;
    }
    
    let sharesHtml = '';
    shares.forEach(share => {
        const sharedDate = new Date(share.shared_at).toLocaleDateString();
        sharesHtml += `
            <div class="share-item" data-share-id="${share.id}">
                <div class="share-user-info">
                    <span class="share-username">${share.Users?.username || 'Unknown user'}</span>
                    <div class="share-details">
                        <span class="share-date">Shared on: ${sharedDate}</span>
                        <span class="share-by">by: ${share.sharer?.username || 'Unknown'}</span>
                    </div>
                </div>
                <button class="remove-share-btn" onclick="removeShare('${share.id}', '${projectId}')">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;
    });
    
    sharesContainer.innerHTML = sharesHtml;
}

// Global function to remove share (needs to be accessible from inline onclick)
window.removeShare = async function(shareId, projectId) {
    if (!confirm('Are you sure you want to remove this user\'s access to the project?')) {
        return;
    }
    
    const result = await removeShareAccess(shareId);
    
    if (result.success) {
        // Show success message
        const successDiv = document.getElementById('share-success');
        successDiv.textContent = result.message;
        successDiv.style.display = 'block';
        
        // Hide any error message
        const errorDiv = document.getElementById('share-error');
        errorDiv.style.display = 'none';
        
        // Reload shares
        loadCurrentShares(projectId);
        
        // Update available users in dropdown after removal
        loadUsersForSharing(projectId);
    } else {
        // Show error message
        const errorDiv = document.getElementById('share-error');
        errorDiv.textContent = result.message;
        errorDiv.style.display = 'block';
        
        // Hide any success message
        const successDiv = document.getElementById('share-success');
        successDiv.style.display = 'none';
    }
};

// Get current filters for user section
function getUserFilters() {
    return {
        searchTerm: document.getElementById('search-users')?.value || '',
        roleFilter: document.getElementById('role-filter')?.value || 'all'
    };
}

// Load users with pagination
async function loadUsers(page = 1, filters = {}) {
    try {
        console.log('Loading users with filters:', filters);
        
        // Set current page
        userCurrentPage = page;
        
        // Get filters
        const currentFilters = {...getUserFilters(), ...filters};
        
        console.log('Attempting to load from "Users" table...');
        // Use the capital "Users" table name since that's what we saw in the database schema
        // Don't request created_at since it doesn't exist
        // Also filter to only show users where added_by_admin is true
        let { data, error } = await supabase
            .from('Users')
            .select('id, username, password, is_admin, added_by_admin')
            .eq('added_by_admin', true)  // Only show users with added_by_admin = true
            .order('id', { ascending: false }); // Order by ID instead of created_at
            
        console.log('Users loading result:', { data, error, count: data?.length || 0 });

        if (error) {
            console.error('Error loading users:', error);
            // Display error message in the table
            const usersContainer = document.getElementById('users-container');
            if (usersContainer) {
                usersContainer.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 2rem;">
                            <p>Error loading users: ${error.message}</p>
                            <p>Please check the console for more details.</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // If no data or empty array, show message in table
        if (!data || data.length === 0) {
            console.log('No users found - displaying empty state');
            const usersContainer = document.getElementById('users-container');
            if (usersContainer) {
                usersContainer.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 2rem;">
                            <p>No users found. Add your first user by clicking the "Add New User" button above.</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }

        // Store all users
        allUsers = data || [];
        console.log('Loaded users:', allUsers);
        
        // Apply filters if any
        let filteredUsers = allUsers;
        
        // Filter by search term
        if (currentFilters.searchTerm) {
            const searchTerm = currentFilters.searchTerm.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.username?.toLowerCase().includes(searchTerm)
            );
            
            // Update search input if needed
            const searchInput = document.getElementById('search-users');
            if (searchInput && searchInput.value !== currentFilters.searchTerm) {
                searchInput.value = currentFilters.searchTerm;
            }
        }
        
        // Filter by role
        if (currentFilters.roleFilter && currentFilters.roleFilter !== 'all') {
            if (currentFilters.roleFilter === 'admin') {
                filteredUsers = filteredUsers.filter(user => user.is_admin === true);
            } else if (currentFilters.roleFilter === 'user') {
                filteredUsers = filteredUsers.filter(user => user.is_admin === false);
            }
            
            // Update role filter select if needed
            const roleFilter = document.getElementById('role-filter');
            if (roleFilter && roleFilter.value !== currentFilters.roleFilter) {
                roleFilter.value = currentFilters.roleFilter;
            }
        }
        
        // Calculate pagination
        const startIndex = (page - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        
        // Update the users table
        updateUsersTable(paginatedUsers);
        
        // Update pagination controls
        updatePagination(page, totalPages, 'users');

    } catch (err) {
        console.error('Error in loadUsers:', err);
        // Display error in the table
        const usersContainer = document.getElementById('users-container');
        if (usersContainer) {
            usersContainer.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 2rem;">
                        <p>Error loading users: ${err.message}</p>
                        <p>Please check the console for more details.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Function to update the users table
function updateUsersTable(users) {
    console.log('Updating users table with:', users);
    const usersContainer = document.getElementById('users-container');
    
    // Make sure the container exists
    if (!usersContainer) {
        console.error('Users container element not found!');
        return;
    }
    
    usersContainer.innerHTML = '';

    if (!users || users.length === 0) {
        usersContainer.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem;">
                    <p>No users found. Add your first user by clicking the "Add New User" button above.</p>
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        // Create a row
        const row = document.createElement('tr');
        row.setAttribute('data-user-id', user.id);
        
        try {
            // Create badge for added_by_admin - removing the Admin Created badge
            let adminBadge = '';
            
            // Nome e 3 pontinhos juntos na primeira célula
            row.innerHTML = `
                <td style="position: relative;">
                    <span style="font-weight: 500;">${user.username || 'Unnamed User'}</span>
                    <div class="card-menu mobile-actions" style="position: absolute; top: 50%; left: 150px; transform: translateY(-50%); display: block;">
                        <button class="menu-btn" onclick="toggleMenu(this)" style="background: none; border: none; cursor: pointer; font-size: 1.2em; color: #888; padding: 4px 8px; border-radius: 50%; margin: 0;">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <div class="menu-dropdown" style="display: none; position: absolute; top: 0; right: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; z-index: 1000;">
                            <button class="dropdown-item edit-item" onclick="showUserModal('${user.id}')">Edit</button>
                            <button class="dropdown-item delete-item" onclick="deleteUser('${user.id}')">Delete</button>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="role-container">
                        <span class="status-badge ${user.is_admin ? 'status-completed' : 'status-in-progress'}">
                            ${user.is_admin ? 'ADMIN' : 'USER'}
                        </span>
                    </div>
                </td>
                <td style="padding-right: 0;">
                    <div class="desktop-actions" style="display: flex; gap: 8px; justify-content: flex-end; width: 100%;">
                        <button class="action-button edit-button" onclick="showUserModal('${user.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete-button" onclick="deleteUser('${user.id}')" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
        } catch (e) {
            console.error('Error creating row for user:', e, user);
            row.innerHTML = `
                <td colspan="3">
                    Error displaying user: ${e.message}
                </td>
            `;
        }
        
        usersContainer.appendChild(row);
    });

    // --- DROPDOWN MENU JS ---
    // Add dropdown toggle logic (only once)
    if (!window.__userMenuDropdownInjected) {
        window.__userMenuDropdownInjected = true;
        document.addEventListener('click', function(e) {
            document.querySelectorAll('.card-menu').forEach(menu => {
                const dropdown = menu.querySelector('.menu-dropdown');
                if (dropdown && !menu.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        });
        window.toggleMenu = function(btn) {
            const menu = btn.parentElement;
            const dropdown = menu.querySelector('.menu-dropdown');
            // Fecha todos os outros
            document.querySelectorAll('.card-menu .menu-dropdown').forEach(d => { if (d !== dropdown) d.style.display = 'none'; });
            // Toggle o atual
            dropdown.style.display = (dropdown.style.display === 'flex') ? 'none' : 'flex';
        }
    }
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('search-users').value.trim();
    console.log('Searching for users:', searchTerm);
    
    // Reset to first page when searching
    loadUsers(1, {searchTerm: searchTerm});
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('role-filter').value;
    console.log('Filtering users by role:', roleFilter);
    
    // Reset to first page when filtering
    loadUsers(1, {roleFilter: roleFilter});
}

// Initialize user management
document.addEventListener('DOMContentLoaded', async () => {
    // If we're on the admin page
    if (document.getElementById('users-container')) {
        // Load initial users
        await loadUsers();
        
        // Add event listeners
        const searchUsersButton = document.querySelector('.search-button');
        if (searchUsersButton) {
            searchUsersButton.addEventListener('click', searchUsers);
        }
        
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchUsers();
                }
            });
        }
    }
}); 

// Add or edit user in the database
async function saveUser() {
    try {
        // Get form values
        const userId = document.getElementById('user-id').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('user-password').value;
        const isAdmin = document.getElementById('user-role').value === 'admin';
        
        // Validate form
        if (!username) {
            alert('Username is required');
            return;
        }
        
        // For new users, password is required and must pass validation
        if (!userId && !password) {
            alert('Password is required for new users');
            return;
        }
        
        // If password is provided (new user or changing password), validate it
        if (password) {
            // Check if validatePassword is available from auth.js
            if (typeof validatePassword === 'function') {
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    alert(passwordValidation.error);
                    return;
                }
            } else {
                // Fallback validation if validatePassword function is not available
                if (password.length < 8) {
                    alert('Password must be at least 8 characters long');
                    return;
                }
                
                if (!/[A-Z]/.test(password)) {
                    alert('Password must contain at least one uppercase letter');
                    return;
                }
                
                if (!/[a-z]/.test(password)) {
                    alert('Password must contain at least one lowercase letter');
                    return;
                }
                
                if (!/[0-9]/.test(password)) {
                    alert('Password must contain at least one number');
                    return;
                }
                
                if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                    alert('Password must contain at least one special character');
                    return;
                }
            }
        }

        // Show loading indicator
        showLoadingIndicator('Checking username availability...');
        
        // We'll always use 'Users' with capital U as our table name
        const tableName = 'Users';
        
        // For new users or when username is changed, check if the username already exists
        if (!userId) {
            // Check if username already exists
            const { data: existingUsers, error: checkError } = await supabase
                .from(tableName)
                .select('id')
                .eq('username', username);
                
            if (checkError) {
                throw checkError;
            }
            
            if (existingUsers && existingUsers.length > 0) {
                hideLoadingIndicator();
                alert(`Username "${username}" is already taken. Please choose a different username.`);
                return;
            }
        }
        
        // Create user data object
        const userData = {
            username,
            is_admin: isAdmin
        };
        
        // Add password only if provided (for updates)
        if (password) {
            userData.password = password;
        }
        
        // Show loading indicator
        showLoadingIndicator('Saving user...');
        
        if (userId) {
            // For updates, check if username changed and if the new username is already taken
            if (window.originalUsername && window.originalUsername !== username) {
                const { data: existingUsers, error: checkError } = await supabase
                    .from(tableName)
                    .select('id')
                    .eq('username', username);
                    
                if (checkError) {
                    throw checkError;
                }
                
                if (existingUsers && existingUsers.length > 0) {
                    hideLoadingIndicator();
                    alert(`Username "${username}" is already taken. Please choose a different username.`);
                    return;
                }
            }
            
            // Update existing user
            const { data, error } = await supabase
                .from(tableName)
                .update(userData)
                .eq('id', userId);
                
            if (error) throw error;
            showNotification('User updated successfully', 'success');
        } else {
            // For new users, password is required
            if (!password) {
                alert('Password is required for new users');
                hideLoadingIndicator();
                return;
            }
            
            // Set added_by_admin to true for new users
            userData.added_by_admin = true;
            
            // Create new user
            const { data, error } = await supabase
                .from(tableName)
                .insert([userData]);
                
            if (error) throw error;
            showNotification('User created successfully', 'success');
        }
        
        // Close the modal
        closeUserModal();
        
        // Reload users
        loadUsers(userCurrentPage, getUserFilters());
        
    } catch (error) {
        console.error('Error saving user:', error);
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
            alert(`Username already exists. Please choose a different username.`);
        } else {
            showNotification(`Error: ${error.message}`, 'error');
        }
    } finally {
        hideLoadingIndicator();
    }
}

// Delete a user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        // Show loading indicator
        showLoadingIndicator('Deleting user...');
        
        // Get current username to prevent self-deletion
        const currentUsername = localStorage.getItem('currentUser');
        
        // Get the username of the user being deleted
        const { data, error: userError } = await supabase
            .from('Users')
            .select('username')
            .eq('id', userId)
            .single();
            
        if (userError) throw userError;
        
        // Prevent self-deletion
        if (data.username === currentUsername) {
            throw new Error("You cannot delete your own account");
        }
        
        // Delete the user
        const { error } = await supabase
            .from('Users')
            .delete()
            .eq('id', userId);
            
        if (error) throw error;
        
        // Show success message
        showNotification('User deleted successfully', 'success');
        
        // Reload users
        loadUsers(userCurrentPage, getUserFilters());
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        hideLoadingIndicator();
    }
}

// Show user modal for adding or editing a user
function showUserModal(userId = null) {
    console.log('Opening user modal for user ID:', userId);
    
    // Reset form
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    
    // Set title based on whether we're adding or editing
    document.getElementById('user-modal-title').textContent = userId ? 'Edit User' : 'Add New User';
    
    // If user ID is provided, load user data
    if (userId) {
        console.log('Loading user data for editing...');
        loadUserData(userId);
    }
    
    // Show modal with animation
    const modal = document.getElementById('user-modal');
    modal.classList.add('show');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close user modal
function closeUserModal() {
    // Hide modal with animation
    const modal = document.getElementById('user-modal');
    modal.classList.remove('show');
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

// Helper function to show loading indicator
function showLoadingIndicator(message = 'Loading...') {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'loading-spinner-container';
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        const messageElement = document.createElement('div');
        messageElement.id = 'loading-message';
        messageElement.className = 'loading-message';
        
        spinnerContainer.appendChild(spinner);
        spinnerContainer.appendChild(messageElement);
        loadingOverlay.appendChild(spinnerContainer);
        
        document.body.appendChild(loadingOverlay);
    }
    
    // Update message
    const messageElement = document.getElementById('loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    // Show overlay
    loadingOverlay.style.display = 'flex';
}

// Helper function to hide loading indicator
function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Helper function to show notification
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Function to create a test user
async function createTestUser() {
    try {
        console.log('Creating a test user...');
        
        // We'll use 'Users' with capital U for our table name
        const tableName = 'Users';
        
        // Create a random test user with timestamp to ensure uniqueness
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const testUser = {
            username: `testuser_${timestamp}_${random}`,
            password: `password${random}`,
            is_admin: false,
            added_by_admin: true
            // No created_at field as it doesn't exist in the table
        };
        
        // Show loading indicator
        showLoadingIndicator('Creating test user...');
        
        // Insert the test user
        const { data, error } = await supabase
            .from(tableName)
            .insert([testUser])
            .select();
            
        if (error) {
            hideLoadingIndicator();
            console.error('Error creating test user:', error);
            alert(`Error creating test user: ${error.message}`);
            return null;
        }
        
        console.log('Test user created successfully:', data);
        
        // Reload the users list
        loadUsers();
        
        hideLoadingIndicator();
        
        // Show success notification
        showNotification(`Test user created: ${testUser.username}`, 'success');
        
        // Show details in alert
        setTimeout(() => {
            alert(`Test user created successfully!\n\nUsername: ${testUser.username}\nPassword: ${testUser.password}`);
        }, 500); // Small delay to ensure notification appears first
        
        return data?.[0] || null;
    } catch (e) {
        hideLoadingIndicator();
        console.error('Exception creating test user:', e);
        alert(`Exception creating test user: ${e.message}`);
        return null;
    }
}

// Add CSS for improved pagination and search styles
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS if not already present
    if (!document.getElementById('enhanced-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'enhanced-styles';
        styleElement.textContent = `
            /* Improved Search Bar */
            .search-container {
                display: flex;
                gap: 8px;
                margin-bottom: 15px;
                width: 100%;
            }
            
            .search-input {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            
            .search-input:focus {
                border-color: #3a7bd5;
                box-shadow: 0 1px 3px rgba(58,123,213,0.15);
                outline: none;
            }
            
            .search-button {
                background-color: #3a7bd5;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 16px;
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.1s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .search-button:hover {
                background-color: #2d6bc0;
            }
            
            .search-button:active {
                transform: translateY(1px);
            }
            
            /* Improved Pagination */
            .pagination-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
                gap: 8px;
            }
            
            .page-button, .page-number {
                min-width: 36px;
                height: 36px;
                border-radius: 6px;
                border: 1px solid #e0e0e0;
                background-color: white;
                color: #555;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            }
            
            .page-button {
                padding: 0 12px;
            }
            
            .page-button:hover:not(:disabled), .page-number:hover:not(.active) {
                background-color: #f5f5f5;
                border-color: #d0d0d0;
            }
            
            .page-number.active {
                background-color: #3a7bd5;
                color: white;
                border-color: #3a7bd5;
                font-weight: 500;
            }
            
            .page-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Filter Dropdown */
            .filter-select {
                padding: 10px 12px;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                font-size: 14px;
                background-color: white;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                cursor: pointer;
            }
            
            .filter-select:focus {
                border-color: #3a7bd5;
                outline: none;
            }

            /* Desktop View Fixes */
            @media (min-width: 701px) {
                .admin-dashboard {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .projects-table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }

                .projects-table th,
                .projects-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                    vertical-align: middle;
                }

                .projects-table th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-start;
                }

                .action-button {
                    width: 36px;
                    height: 36px;
                    border-radius: 6px;
                    border: none;
                    background: #232526;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .action-button:hover {
                    background: #2d2d2d;
                }

                .feature-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: 8px;
                    color: #ffc107;
                }

                .category-badge,
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-completed {
                    background-color: #28a745;
                    color: white;
                }

                .status-incompleted {
                    background-color: #dc3545;
                    color: white;
                }

                .status-in-progress {
                    background-color: #ffc107;
                    color: #000;
                }

                .file-link {
                    color: #3a7bd5;
                    text-decoration: none;
                    word-break: break-all;
                }

                .file-link:hover {
                    text-decoration: underline;
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
});

// Load user data for editing
async function loadUserData(userId) {
    // Show loading indicator
    showLoadingIndicator('Loading user data...');
    
    // Use 'Users' with capital U as our table name
    const tableName = 'Users';
    
    try {
        // Get user data
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', userId)
            .single();
        
        hideLoadingIndicator();
        
        if (error) {
            console.error('Error loading user:', error);
            showNotification(`Error: ${error.message}`, 'error');
            return;
        }
        
        // Populate form
        document.getElementById('user-id').value = data.id;
        document.getElementById('username').value = data.username || '';
        document.getElementById('user-role').value = data.is_admin ? 'admin' : 'user';
        
        // Store the original username for comparison later
        window.originalUsername = data.username;
        
        // Note: We don't populate the password field for security
    } catch (err) {
        hideLoadingIndicator();
        console.error('Error in loadUserData:', err);
        showNotification('Failed to load user data', 'error');
    }
}

// Função global para expandir/colapsar detalhes do projeto no mobile
window.toggleProjectDetails = function(titleElem) {
    // Corrigir para pegar o próximo elemento irmão (detalhes)
    let details = titleElem.parentElement.querySelector('.project-details-mobile');
    if (!details) {
        // fallback: procurar próximo irmão direto
        details = titleElem.nextElementSibling;
    }
    if (details) {
        details.style.display = (details.style.display === 'none' || details.style.display === '') ? 'block' : 'none';
    }
}

// Adicionar CSS responsivo para garantir que mobile-actions aparece só no mobile
if (!document.getElementById('user-actions-responsive-style')) {
    const style = document.createElement('style');
    style.id = 'user-actions-responsive-style';
    style.innerHTML = `
      .desktop-actions { display: flex; gap: 8px; }
      .mobile-actions { display: none; }
      @media (max-width: 700px) {
        .desktop-actions { display: none !important; }
        .mobile-actions { display: block !important; }
      }
    `;
    document.head.appendChild(style);
}

// Adicionar CSS para remover padding-right da última célula da tabela de usuários
if (!document.getElementById('users-table-actions-padding-fix')) {
    const style = document.createElement('style');
    style.id = 'users-table-actions-padding-fix';
    style.innerHTML = `
      #users-container td:last-child { padding-right: 0 !important; }
    `;
    document.head.appendChild(style);
}

// Adicionar CSS para remover scroll da tabela de user management
if (!document.getElementById('users-table-no-scroll')) {
    const style = document.createElement('style');
    style.id = 'users-table-no-scroll';
    style.innerHTML = `
      #users-container, .users-table {
        max-width: 100% !important;
      }
      .projects-table {
        table-layout: fixed;
        width: 100%;
      }
      .projects-table-container {
        overflow-x: auto !important;
        max-width: 100% !important;
        -webkit-overflow-scrolling: touch;
      }
      .admin-section {
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);
}

// Adicionar CSS para centralizar e ajustar o modal de visualização de arquivos
if (!document.getElementById('file-viewer-modal-center-style')) {
    const style = document.createElement('style');
    style.id = 'file-viewer-modal-center-style';
    style.innerHTML = `
      #file-viewer-modal {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        position: fixed;
        z-index: 9999;
        background: rgba(0,0,0,0.7);
      }
      #file-viewer-modal .modal-content,
      #file-viewer-modal .pdf-preview,
      #file-viewer-modal iframe,
      #file-viewer-modal img,
      #flipbook, #flipbook-pages {
        display: block;
        margin-left: auto;
        margin-right: auto;
        max-width: 100vw;
        max-height: 90vh;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
}

// Função global para fechar o modal de visualização de arquivos
window.closeFileViewerModal = function() {
  const modal = document.getElementById('file-viewer-modal');
  if (modal) modal.style.display = 'none';
}
// Garantir que o botão de fechar chama closeFileViewerModal
setTimeout(() => {
  const closeBtn = document.querySelector('#file-viewer-modal .close-modal');
  if (closeBtn) closeBtn.setAttribute('onclick', 'closeFileViewerModal()');
}, 500);
// CSS para modal centralizado e responsivo
if (!document.getElementById('file-viewer-modal-fix-style')) {
    const style = document.createElement('style');
    style.id = 'file-viewer-modal-fix-style';
    style.innerHTML = `
      #file-viewer-modal {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        position: fixed;
        z-index: 9999;
        background: rgba(0,0,0,0.7);
      }
      #file-viewer-modal .modal-content {
        background: #fff;
        border-radius: 12px;
        max-width: 90vw;
        max-height: 90vh;
        width: 100%;
        box-shadow: 0 4px 32px rgba(0,0,0,0.18);
        overflow: auto;
        display: flex;
        flex-direction: column;
      }
      #file-viewer-modal iframe,
      #file-viewer-modal img,
      #flipbook, #flipbook-pages {
        display: block;
        margin-left: auto;
        margin-right: auto;
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
}

// Remover CSS e JS de centralização forçada do modal e função de fechar automática
var oldModalStyle = document.getElementById('file-viewer-modal-center-style');
if (oldModalStyle) oldModalStyle.remove();
var fixModalStyle = document.getElementById('file-viewer-modal-fix-style');
if (fixModalStyle) fixModalStyle.remove();
// Remover função global de fechar modal se existir
if (window.closeFileViewerModal) delete window.closeFileViewerModal;
// Adicionar apenas CSS para centralizar o conteúdo do preview
if (!document.getElementById('file-viewer-preview-center-style')) {
    const style = document.createElement('style');
    style.id = 'file-viewer-preview-center-style';
    style.innerHTML = `
      #file-viewer-modal iframe,
      #file-viewer-modal img,
      #flipbook, #flipbook-pages {
        display: block;
        margin-left: auto;
        margin-right: auto;
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
      }
    `;
    document.head.appendChild(style);
}

// Modificar showFileInModal para esconder o hamburguer ao abrir o modal
const originalShowFileInModal = window.showFileInModal;
window.showFileInModal = function(fileUrl, fileName) {
  var hamburger = document.getElementById('admin-hamburger');
  if (hamburger) hamburger.style.display = 'none';
  if (typeof originalShowFileInModal === 'function') {
    originalShowFileInModal.apply(this, arguments);
  }
}
// Modificar função de fechar o modal para mostrar o hamburguer novamente
function showFileViewerHamburger() {
  var hamburger = document.getElementById('admin-hamburger');
  if (hamburger) hamburger.style.display = '';
}
// Detecta fechamento do modal por botão de fechar
const closeBtn = document.querySelector('#file-viewer-modal .close-modal');
if (closeBtn) {
  closeBtn.addEventListener('click', showFileViewerHamburger);
}
// Detecta fechamento do modal por clique fora (opcional)
const fileViewerModal = document.getElementById('file-viewer-modal');
if (fileViewerModal) {
  fileViewerModal.addEventListener('click', function(e) {
    if (e.target === fileViewerModal) showFileViewerHamburger();
  });
}

// Add back button for tablet mode
document.addEventListener('DOMContentLoaded', function() {
    // Create the back button element
    const backButton = document.createElement('a');
    backButton.id = 'tablet-back-button';
    backButton.href = 'index.html';
    backButton.textContent = 'Voltar';
    
    // Add an icon if Font Awesome is available
    if (typeof FontAwesome !== 'undefined' || document.querySelector('link[href*="font-awesome"]')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-arrow-left';
        icon.style.marginRight = '8px';
        backButton.prepend(icon);
    }
    
    // Append the button to the body
    document.body.appendChild(backButton);
    
    // Check tablet mode and show/hide button accordingly
    function checkTabletMode() {
        if (window.matchMedia('(min-width: 601px) and (max-width: 1024px)').matches) {
            backButton.style.display = 'inline-flex';
        } else {
            backButton.style.display = 'none';
        }
    }
    
    // Check on load and when window is resized
    checkTabletMode();
    window.addEventListener('resize', checkTabletMode);
});

// Function to initialize event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners');
    
    // Initialize share buttons if they exist
    const shareButtons = document.querySelectorAll('.share-button');
    if (shareButtons.length > 0) {
        console.log(`Found ${shareButtons.length} share buttons, attaching event listeners`);
        shareButtons.forEach(button => {
            // Remove any existing event listeners to prevent duplicates
            button.removeEventListener('click', handleShareButtonClick);
            
            // Add the event listener
            button.addEventListener('click', handleShareButtonClick);
        });
    } else {
        console.log('No share buttons found in the DOM');
    }
}

// Function to handle share button click
function handleShareButtonClick(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent event bubbling
    
    const projectId = this.getAttribute('data-project-id');
    const projectName = this.getAttribute('data-project-name');
    
    console.log(`Share button clicked for project: ${projectId} - ${projectName}`);
    
    if (projectId && projectName) {
        showShareModal(projectId, projectName);
    } else {
        console.error('Share button clicked but missing data attributes', this);
    }
}

// Add DOMContentLoaded event listener to initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    
    // Check if user is admin
    checkAdminAccess();
    
    // Load projects data
    loadAdminInfo();
    
    // Initialize event listeners
    initializeEventListeners();
});

// Function to share a project with a user
async function shareProject(projectId, userId, currentUsername) {
    console.log(`Sharing project ${projectId} with user ${userId} by ${currentUsername}`);
    
    try {
        // Get ID of current user (who is sharing)
        const { data: currentUser, error: userError } = await supabase
            .from('Users')
            .select('id')
            .eq('username', currentUsername)
            .single();
            
        if (userError) {
            console.error('Error getting current user:', userError);
            return { success: false, message: 'Error getting current user information.' };
        }
        
        console.log('Current user found:', currentUser);
        
        if (!currentUser || !currentUser.id) {
            console.error('Current user not found or has no ID');
            return { success: false, message: 'Current user not found.' };
        }
        
        // Create the share record
        const { data, error } = await supabase
            .from('project_shares')
            .insert([{ 
                project_id: projectId, 
                user_id: userId, 
                shared_by: currentUser.id,
                shared_at: new Date().toISOString()
            }]);
            
        if (error) {
            console.error('Error creating project share:', error);
            return { success: false, message: `Error sharing: ${error.message}` };
        }

        console.log('Project share created successfully!');

        // Try to send a notification, but don't block on success
        try {
            // Get the username of the user who will receive access
            const { data: userData, error: userDataError } = await supabase
                .from('Users')
                .select('username')
                .eq('id', userId)
                .single();
                
            if (!userDataError && userData && userData.username) {
                console.log('Recipient user found:', userData);
                
                // Get the project name
                const { data: projectData, error: projectError } = await supabase
                    .from('projects')
                    .select('name')
                    .eq('id', projectId)
                    .single();
                    
                const projectName = projectError || !projectData ? 'a project' : projectData.name;
                
                // Create notification content
                const notificationContent = `${currentUsername} shared the project "${projectName}" with you.`;
                
                // Insert notification using the notification system if available
                if (typeof insertSystemNotification === 'function') {
                    const result = await insertSystemNotification(
                        userData.username,
                        notificationContent,
                        projectId
                    );
                    
                    if (!result.success) {
                        console.warn('Notification could not be sent, but project was shared');
                    } else {
                        console.log('Notification sent successfully');
                    }
                } else {
                    console.log('Notification system not available, skipping notification');
                }
            }
        } catch (notificationError) {
            // Log but don't fail if notification fails
            console.error('Error sending notification:', notificationError);
        }
        
        return { 
            success: true, 
            message: 'Project shared successfully!' 
        };
    } catch (e) {
        console.error('Exception in shareProject:', e);
        return { success: false, message: `Error sharing: ${e.message}` };
    }
}

// Function to insert a system notification (simplified version)
async function insertSystemNotification(receiverUsername, content, projectId = null) {
    try {
        console.log('Creating system notification', { receiver: receiverUsername, content, projectId });
        
        // Create the notification data
        const notificationData = {
            sender: 'system',
            receiver: receiverUsername,
            content: content,
            read: false,
            is_edited: false,
            is_deleted: false
        };
        
        // Only add project_id if it's provided and valid
        if (projectId !== null && projectId !== undefined) {
            notificationData.project_id = projectId;
        }
        
        // Insert directly into the chat_messages table
        const { data, error } = await supabase
            .from('chat_messages')
            .insert([notificationData]);
            
        if (error) {
            console.error('Failed to insert notification:', error);
            return { success: false, error };
        }
        
        console.log('Notification inserted successfully');
        return { success: true, data };
    } catch (e) {
        console.error('Exception in insertSystemNotification:', e);
        return { success: false, error: e };
    }
}

// Toggle featured status of a project
async function toggleFeaturedStatus(projectId, setFeatured) {
    try {
        showLoadingIndicator('Updating featured status...');
        
        // Update the project's is_featured status
        const { data, error } = await supabase
            .from('projects')
            .update({ is_featured: setFeatured })
            .eq('id', projectId)
            .select();
        
        hideLoadingIndicator();
        
        if (error) {
            console.error('Error toggling featured status:', error);
            showNotification('Failed to update featured status', 'error');
            return;
        }
        
        // Show success notification
        const message = setFeatured ? 
            'Project set as featured successfully!' : 
            'Project removed from featured successfully!';
        showNotification(message, 'success');
        
        // Reload projects to update UI
        loadProjects(currentPage, getCurrentFilters());
        
        // Update stats if stats elements exist
        if (document.getElementById('total-projects')) {
            updateStats();
        }
        
    } catch (err) {
        hideLoadingIndicator();
        console.error('Error in toggleFeaturedStatus:', err);
        showNotification('An error occurred while updating featured status', 'error');
    }
}

// Initialize scroll buttons functionality
function initScrollButtons() {
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');
    const container = document.querySelector('.project-carousel-wrapper');
    
    if (!leftBtn || !rightBtn || !container) return;
    
    console.log('Initializing scroll buttons');
    
    // Make buttons visible
    leftBtn.style.display = 'flex';
    rightBtn.style.display = 'flex';
    
    // Default left button disabled at start position
    leftBtn.disabled = true;
    leftBtn.style.opacity = '0.5';
    
    // Scroll amount per click (width of one card + margin)
    const scrollAmount = 300;
    
    // Scroll left
    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    // Scroll right
    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Update button states on scroll
    container.addEventListener('scroll', () => {
        const scrollPosition = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Enable/disable buttons based on scroll position
        leftBtn.disabled = scrollPosition <= 0;
        leftBtn.style.opacity = scrollPosition <= 0 ? '0.5' : '1';
        
        rightBtn.disabled = scrollPosition >= maxScroll - 10; // 10px buffer
        rightBtn.style.opacity = scrollPosition >= maxScroll - 10 ? '0.5' : '1';
    });
}

// Initialize horizontal table scrolling
function initTableScrolling() {
    // Find all table containers
    const tableContainers = document.querySelectorAll('.projects-table-container');
    
    tableContainers.forEach(container => {
        // Force overflow-x to auto
        container.style.overflowX = 'auto';
        
        // Find the table inside
        const table = container.querySelector('.projects-table');
        if (table) {
            // Ensure table has enough width to trigger scrolling on smaller screens
            if (window.innerWidth < 1200) {
                // Set min-width based on column count
                const columnCount = table.querySelectorAll('th').length;
                const minColumnWidth = 150; // minimum width per column in pixels
                table.style.minWidth = (columnCount * minColumnWidth) + 'px';
            }
        }
    });
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Other initialization code...
    
    // Initialize scroll buttons
    setTimeout(initScrollButtons, 1000); // Delay to ensure elements are loaded
    
    // Initialize table scrolling
    initTableScrolling();
    
    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        initTableScrolling();
    });
});
