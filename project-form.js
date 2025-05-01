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
        .from('projects')
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
    
    // Set content type radio buttons
    // Since content_type column might not exist, we need to detect from file_url
    const contentType = data.content_type || detectContentType(data.file_url);
    if (contentType === 'video') {
        document.getElementById('content-type-video').checked = true;
        document.getElementById('file-upload-group').style.display = 'none';
        document.getElementById('video-upload-group').style.display = 'block';
        document.getElementById('project-file').required = false;
        document.getElementById('project-video').required = true;
    } else {
        document.getElementById('content-type-file').checked = true;
        document.getElementById('file-upload-group').style.display = 'block';
        document.getElementById('video-upload-group').style.display = 'none';
        document.getElementById('project-file').required = true;
        document.getElementById('project-video').required = false;
    }
    
    // Display current file name if exists
    if (data.file_url) {
        // Extract filename from URL
        const fileName = data.file_url.split('/').pop().split('-').pop();
        // Determine if it's a video from the file extension or name pattern
        const isVideo = contentType === 'video' || 
                       data.file_url.includes('-video-') || 
                       /\.(mp4|webm|mov|avi|wmv|mpeg|mpg)$/i.test(data.file_url);
        
        const fileInput = isVideo ? document.getElementById('project-video') : document.getElementById('project-file');
        
        // Create a display element for current file
        const currentFileDisplay = document.createElement('div');
        currentFileDisplay.className = 'current-file-display';
        
        if (isVideo) {
            currentFileDisplay.innerHTML = `
                <p>Current video: <a href="${data.file_url}" target="_blank">${fileName}</a></p>
                <video width="320" height="240" controls>
                    <source src="${data.file_url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <p><small>Upload a new video only if you want to replace the current one</small></p>
            `;
        } else {
        currentFileDisplay.innerHTML = `
            <p>Current file: <a href="${data.file_url}" target="_blank">${fileName}</a></p>
            <p><small>Upload a new file only if you want to replace the current one</small></p>
        `;
        }
        
        // Insert the display before the file input
        fileInput.parentNode.insertBefore(currentFileDisplay, fileInput.nextSibling);
        
        // Make file input optional when editing
        fileInput.removeAttribute('required');
    }
    
    // Display current image if exists
    if (data.image_data) {
        const imageInput = document.getElementById('project-image');
        
        // Create a display element for current image
        const currentImageDisplay = document.createElement('div');
        currentImageDisplay.className = 'current-image-display';
        currentImageDisplay.innerHTML = `
            <p>Current image:</p>
            <img src="${data.image_data}" alt="${data.name}" style="max-width: 200px; max-height: 150px; object-fit: contain; margin-bottom: 10px;">
            <p><small>Upload a new image only if you want to replace the current one</small></p>
        `;
        
        // Insert the display before the image input
        imageInput.parentNode.insertBefore(currentImageDisplay, imageInput.nextSibling);
    }
    
    // Update save button text
    document.getElementById('save-button').innerHTML = '<i class="fas fa-save"></i> Update Project';
}

// Helper function to detect content type from file URL or extension
function detectContentType(fileUrl) {
    if (!fileUrl) return 'file'; // Default to file
    
    // Check file extension
    const ext = fileUrl.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'wmv', 'mpeg', 'mpg', 'm4v'];
    
    if (videoExtensions.includes(ext)) {
        return 'video';
    }
    
    return 'file';
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
<<<<<<< Updated upstream
        const contentType = document.querySelector('input[name="content-type"]:checked').value;
        const projectFile = contentType === 'file' ? document.getElementById('project-file').files[0] : null;
        const projectVideo = contentType === 'video' ? document.getElementById('project-video').files[0] : null;
=======
        const projectFile = document.getElementById('project-file').files[0];
        const projectVideo = document.getElementById('project-video').files[0];
>>>>>>> Stashed changes
        const projectImage = document.getElementById('project-image').files[0];
        const projectStatus = document.getElementById('project-status').value;
        
        // Get the content type from radio buttons
        const contentType = document.getElementById('content-type-video').checked ? 'video' : 'file';
        
        if (!projectName) {
            alert('Project name is required!');
            return;
        }
        
        if (!projectCategory) {
            alert('Project category is required!');
            return;
        }
        
        if (!isEdit && !projectFile && !projectVideo) {
            alert('Project file or video is required for new projects!');
            return;
        }
        
        let fileUrl = null;
        let imageUrl = null;
        
        // Upload file if exists (document or video)
        const fileToUpload = projectFile || projectVideo;
        
        if (fileToUpload) {
            // Log file details for debugging
            console.log('File to upload:', {
                name: fileToUpload.name,
                size: fileToUpload.size,
                type: fileToUpload.type,
                sizeInMB: (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB',
                contentType: contentType
            });
            
            // Create a random file name to avoid collisions
            const fileExt = fileToUpload.name.split('.').pop();
            // Include content type in the filename for easier detection later
            const filePrefix = contentType === 'video' ? 'video' : 'doc';
            const fileName = `${filePrefix}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `project-files/${fileName}`;
            
            try {
                // Upload file to Supabase Storage with explicit file size option
                console.log('Starting file upload to path:', filePath);
                
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('projects')
                    .upload(filePath, fileToUpload, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: fileToUpload.type // Explicitly set content type
                    });
                
            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                    console.error('Error details:', JSON.stringify(uploadError, null, 2));
                    
                    if (uploadError.message && uploadError.message.includes('maximum allowed size')) {
                        alert(`Error: The file is too large. Maximum size is 500MB. Your file is ${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB.`);
                    } else {
                alert(`Error uploading file: ${uploadError.message}`);
                    }
                return;
            }
                
                console.log('Upload successful:', uploadData);
            
            // Get the public URL for the file
            const { data: { publicUrl } } = supabase.storage
                .from('projects')
                .getPublicUrl(filePath);
                
                console.log('Public URL generated:', publicUrl);
            fileUrl = publicUrl;
            } catch (uploadException) {
                console.error('Exception during file upload:', uploadException);
                alert(`Upload failed: ${uploadException.message}`);
                return;
            }
        }
        
        // Upload image if exists
        if (projectImage) {
            // Create a random file name to avoid collisions
            const imageExt = projectImage.name.split('.').pop();
            const imageName = `image-${Math.random().toString(36).substring(2)}-${Date.now()}.${imageExt}`;
            const imagePath = `project-images/${imageName}`;
            
            // Upload image to Supabase Storage
            const { data: uploadImageData, error: uploadImageError } = await supabase.storage
                .from('projects')
                .upload(imagePath, projectImage);
                
            if (uploadImageError) {
                console.error('Error uploading image:', uploadImageError);
                alert(`Error uploading image: ${uploadImageError.message}`);
                return;
            }
            
            // Get the public URL for the image
            const { data: { publicUrl: publicImageUrl } } = supabase.storage
                .from('projects')
                .getPublicUrl(imagePath);
                
            imageUrl = publicImageUrl;
        }
        
        // Create project data object
        const projectData = {
            name: projectName,
            category: projectCategory,
            status: projectStatus,
            // Store content type as a field in the database
            // Since the content_type column doesn't exist yet, commenting this out
            // content_type: contentType 
        };
        
        if (isEdit) {
            // For updates, only set updated_at
            projectData.updated_at = new Date().toISOString();
        } else {
            // For new projects, set created_at
            projectData.created_at = new Date().toISOString();
        }
        
        // Instead, store content type in the file_url field name by adding a prefix
        if (fileUrl) {
            // Add a prefix to the URL to indicate content type
            projectData.file_url = fileUrl;
        }
        
        // Add image URL if a new image was uploaded
        if (imageUrl) {
            projectData.image_data = imageUrl;
        }
        
        console.log('Project data to save:', projectData);
        
        let result;
        
        if (isEdit) {
            // Update existing project
            console.log('Updating existing project with ID:', projectId);
            result = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', projectId);
        } else {
            // Add new project
            console.log('Inserting new project with data:', projectData);
            result = await supabase
                .from('projects')
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
        
        // Create the projects table if it doesn't exist with image_data field
        // Note: This is not the ideal way to create tables, but it works for this example
        // In a production environment, you would use Supabase migrations or Admin UI
        const { error: tableError } = await supabase.rpc('create_projects_table_if_not_exists');
        if (tableError) {
            console.error('Error ensuring projects table exists:', tableError);
        }
        
        // Ensure the image_data column exists in the projects table
        const { error: columnError } = await supabase.rpc('add_image_data_column_if_not_exists');
        if (columnError) {
            console.error('Error ensuring image_data column exists:', columnError);
            // Try a fallback method if the RPC is not available
            try {
                // This is a silent operation, it will fail if column already exists and that's OK
                const { error: alterError } = await supabase.from('projects').alter('image_data', null);
                console.log('Alter table operation completed:', alterError ? 'with error' : 'successfully');
            } catch (e) {
                console.log('Expected error if column already exists:', e);
            }
        }
        
        // Create storage bucket if it doesn't exist
        try {
            console.log('Creating or checking storage bucket with 500MB limit');
            const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('projects', {
            public: true,
                fileSizeLimit: 524288000, // 500MB limit (increased for large video files)
                allowedMimeTypes: [
                    // Document types
                    'application/pdf', 
                    'application/msword', 
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                    'application/vnd.ms-excel', 
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint', 
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    // Video types
                    'video/mp4',
                    'video/webm',
                    'video/quicktime',
                    'video/x-msvideo',
                    'video/x-ms-wmv',
                    'video/mpeg'
                ]
        });
            
            // Only log if there's an actual error (not just a "bucket already exists" error)
        if (bucketError && bucketError.code !== '23505') { // Ignore duplicate bucket error
            console.error('Error ensuring storage bucket exists:', bucketError);
                console.error('Bucket error details:', JSON.stringify(bucketError, null, 2));
            } else {
                console.log('Storage bucket ready:', bucketData || 'Bucket already exists');
                
                // Update bucket settings even if it already exists
                console.log('Updating bucket settings with new file size limit');
                const { error: updateError } = await supabase.storage.updateBucket('projects', {
                    public: true,
                    fileSizeLimit: 524288000, // 500MB limit
                });
                
                if (updateError) {
                    console.error('Error updating bucket settings:', updateError);
                } else {
                    console.log('Bucket settings updated successfully');
                }
            }
        } catch (bucketException) {
            console.error('Exception during bucket creation:', bucketException);
        }
        
        // Create directory for project images if not exists
        try {
            const { data: dirExists } = await supabase.storage
                .from('projects')
                .list('project-images');
                
            if (!dirExists || dirExists.length === 0) {
                console.log('Creating project-images directory...');
                // Create an empty file to create the directory
                const { error: dirError } = await supabase.storage
                    .from('projects')
                    .upload('project-images/.gitkeep', new Blob(['']));
                    
                if (dirError && !dirError.message.includes('already exists')) {
                    console.error('Error creating project-images directory:', dirError);
                }
            }
        } catch (e) {
            console.log('Error checking/creating image directory, might already exist:', e);
        }
        
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

        // Add direct save button click handler as a backup mechanism
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            console.log('Adding direct click handler to save button');
            saveButton.addEventListener('click', async function(e) {
                // Prevent default button action
                e.preventDefault();
                
                // Don't proceed if there's already a save in progress
                if (this.disabled) {
                    console.log('Save already in progress');
                    return;
                }
                
                // Disable button to prevent multiple clicks
                this.disabled = true;
                try {
                    // Show loading state
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                    
                    // Trigger form submission
                    await saveProject(e);
                } catch (err) {
                    console.error('Error in save button handler:', err);
                    alert('Failed to save project: ' + err.message);
                } finally {
                    // Reset button state
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-save"></i> Save Project';
                }
            });
        }
    } catch (err) {
        console.error('Error initializing project form:', err);
    }
}); 