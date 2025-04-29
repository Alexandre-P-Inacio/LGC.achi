// Check if user is admin and redirect if not
async function checkAdminAccess() {
    console.log('Checking admin access...');
    const currentUser = localStorage.getItem('currentUser');
    console.log('Current user from localStorage:', currentUser);
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`check_admin.php?username=${encodeURIComponent(currentUser)}`);
        const data = await response.json();
        
        console.log('Admin check result:', data);

        if (!data.admin) {
            window.location.href = 'index.html';
            return;
        }

        // Set admin name in header
        document.getElementById('admin-name').textContent = `Welcome, ${currentUser}`;
    } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = 'login.html';
    }
}

// Get project ID from URL parameter
function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load project data for editing
async function loadProjectData(projectId) {
    console.log('Loading project data for ID:', projectId);
    
    try {
        const response = await fetch(`get_project.php?id=${projectId}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to load project data');
        }
        
        const data = result.data;
        console.log('Project data load result:', data);

        // Update form title
        document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Project';
        
        // Populate form with project data
        document.getElementById('project-title').value = data.name;
        
        // Set category dropdown value if it exists
        const categorySelect = document.getElementById('project-category');
        if (categorySelect && data.category) {
            // Find and select the matching option
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === data.category) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Set the status dropdown value if it exists
        const statusSelect = document.getElementById('project-status');
        if (statusSelect && data.status) {
            // Find and select the matching option
            for (let i = 0; i < statusSelect.options.length; i++) {
                if (statusSelect.options[i].value === data.status) {
                    statusSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Set featured checkbox state
        document.getElementById('project-featured').checked = data.is_featured || false;
        
        // Display current file name if exists
        if (data.file_name) {
            const fileInput = document.getElementById('project-file');
            
            // Create a display element for current file
            const currentFileDisplay = document.createElement('div');
            currentFileDisplay.className = 'current-file-display';
            currentFileDisplay.innerHTML = `
                <p>Current file: <a href="get_file.php?project_id=${projectId}" target="_blank">${data.file_name}</a></p>
                <p><small>Upload a new file only if you want to replace the current one</small></p>
            `;
            
            // Insert the display before the file input
            fileInput.parentNode.insertBefore(currentFileDisplay, fileInput.nextSibling);
            
            // Make file input optional when editing
            fileInput.removeAttribute('required');
        }
        
        // Update save button text
        document.getElementById('save-button').innerHTML = '<i class="fas fa-save"></i> Update Project';
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project. Redirecting to dashboard.');
        window.location.href = 'admin.html';
    }
}

// Save project with file upload
async function saveProject(event) {
    console.log('Save project function called');
    event.preventDefault();
    
    const projectId = getProjectIdFromUrl();
    const isEdit = !!projectId;
    console.log('Is edit mode:', isEdit, 'Project ID:', projectId);
    
    try {
        // Get form values
        const projectName = document.getElementById('project-title').value;
        const projectCategory = document.getElementById('project-category').value;
        const projectFile = document.getElementById('project-file').files[0];
        const projectStatus = document.getElementById('project-status').value;
        
        // Log form values for debugging
        console.log('Project data to save:', {
            name: projectName,
            category: projectCategory,
            status: projectStatus,
            fileSelected: !!projectFile,
            fileSize: projectFile ? projectFile.size : 'No file',
            fileType: projectFile ? projectFile.type : 'No file',
        });
        
        if (!projectName) {
            alert('Project name is required!');
            return;
        }
        
        if (!projectCategory) {
            alert('Project category is required!');
            return;
        }
        
        if (!isEdit && !projectFile) {
            alert('Project file is required for new projects!');
            return;
        }
        
        // Check file size if one is selected
        if (projectFile) {
            const maxSize = 64 * 1024 * 1024; // 64MB in bytes
            if (projectFile.size > maxSize) {
                alert(`File size (${(projectFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed size (64MB).`);
                return;
            }
            
            console.log(`File size: ${(projectFile.size / (1024 * 1024)).toFixed(2)}MB of max ${maxSize / (1024 * 1024)}MB`);
        }
        
        // Create project data object
        const projectData = {
            name: projectName,
            category: projectCategory,
            status: projectStatus,
            is_featured: document.getElementById('project-featured').checked
        };
        
        // If editing, add the project ID
        if (isEdit) {
            projectData.id = projectId;
        }
        
        console.log('Project data to save:', projectData);
        
        // Save project data using PHP endpoint
        const saveResponse = await fetch('save_project.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        // Check for HTTP errors in the response
        if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            console.error('HTTP error during save:', saveResponse.status, errorText);
            throw new Error(`HTTP error ${saveResponse.status}: ${errorText}`);
        }
        
        const saveResult = await saveResponse.json();
        console.log('Save project result:', saveResult);
        
        if (!saveResponse.ok) {
            throw new Error(saveResult.error || 'Failed to save project');
        }
        
        // Get the project ID (either existing or new)
        const savedProjectId = isEdit ? projectId : saveResult.data[0].id;
        console.log('Saved project ID for file upload:', savedProjectId);
        
        // If a file is provided, upload it using PHP endpoint
        if (projectFile) {
            console.log('Preparing to upload file:', projectFile.name);
            
            // Create FormData object for file upload
            const formData = new FormData();
            formData.append('file', projectFile);
            formData.append('project_id', savedProjectId);
            formData.append('project_name', projectName);
            
            try {
                console.log('Starting file upload...');
                
                // Track upload progress
                const xhr = new XMLHttpRequest();
                
                // Create a promise to handle the XHR response
                const uploadPromise = new Promise((resolve, reject) => {
                    xhr.open('POST', 'upload_file.php', true);
                    
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = Math.round((e.loaded / e.total) * 100);
                            console.log(`Upload progress: ${percentComplete}%`);
                        }
                    };
                    
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                console.error('Error parsing JSON response:', e);
                                reject(new Error('Invalid response from server: ' + xhr.responseText));
                            }
                        } else {
                            console.error('XHR error:', xhr.status, xhr.statusText, xhr.responseText);
                            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
                        }
                    };
                    
                    xhr.onerror = () => {
                        console.error('Network error during upload');
                        reject(new Error('Network error during upload'));
                    };
                    
                    xhr.send(formData);
                });
                
                // Wait for the upload to complete
                const fileData = await uploadPromise;
                
                console.log('File upload response:', fileData);
                
                if (!fileData.success) {
                    throw new Error(fileData.error || 'Error uploading file');
                }
                
            } catch (fileError) {
                console.error('Error uploading file:', fileError);
                alert(`Project saved but file upload failed: ${fileError.message}`);
                // Continue with redirect even if file upload fails
            }
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
        
        // Check if we're in edit mode
        const projectId = getProjectIdFromUrl();
        if (projectId) {
            console.log('In edit mode for project ID:', projectId);
            await loadProjectData(projectId);
        } else {
            console.log('In create mode for new project');
        }
        
        // Set up form submit handler
        document.getElementById('project-form').addEventListener('submit', saveProject);
        
    } catch (err) {
        console.error('Error initializing form:', err);
        alert(`An error occurred while loading the form: ${err.message}`);
    }
}); 