// Use the existing Supabase client from window.supabase
// We'll remove the initialization code that's causing conflicts
const supabase = window.supabase;

console.log('Using existing Supabase client:', supabase);

// Function to create an RPC function that fixes the image_data column type
async function createFixImageDataColumnFunction() {
    console.log('Creating fix_image_data_column_type function...');
    try {
        // This SQL function will:
        // 1. Check if the image_data column exists
        // 2. Check its data type
        // 3. If it's BYTEA, convert it to TEXT
        // 4. If it's already TEXT, do nothing
        const createFunctionSQL = `
            CREATE OR REPLACE FUNCTION fix_image_data_column_type()
            RETURNS void AS $$
            DECLARE
                column_type text;
            BEGIN
                -- Check if column exists and get its type
                SELECT data_type INTO column_type
                FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name = 'image_data';
                
                -- If column doesn't exist, create it as TEXT
                IF column_type IS NULL THEN
                    EXECUTE 'ALTER TABLE projects ADD COLUMN image_data TEXT DEFAULT NULL';
                -- If column exists but is BYTEA, convert to TEXT
                ELSIF column_type = 'bytea' THEN
                    -- First create a temporary column
                    EXECUTE 'ALTER TABLE projects ADD COLUMN image_data_new TEXT DEFAULT NULL';
                    
                    -- Update the temporary column, converting each BYTEA to base64 text
                    EXECUTE 'UPDATE projects SET image_data_new = encode(image_data, ''base64'')';
                    
                    -- Drop the original column
                    EXECUTE 'ALTER TABLE projects DROP COLUMN image_data';
                    
                    -- Rename the new column
                    EXECUTE 'ALTER TABLE projects RENAME COLUMN image_data_new TO image_data';
                END IF;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        // Execute the SQL to create the function
        const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
        if (error) {
            // If exec_sql RPC doesn't exist or fails, try a different approach
            console.error('Error creating fix_image_data_column_type function:', error);
            console.log('Using fallback method to create function...');
            
            // We'll have to rely on the direct alter method in the initialization code
            return false;
        }
        
        console.log('fix_image_data_column_type function created successfully');
        return true;
    } catch (e) {
        console.error('Exception creating fix_image_data_column_type function:', e);
        return false;
    }
}

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
    if (categorySelect) {
        if (data.category) {
            // Find and select the matching option
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === data.category) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        } else {
            // If category is null or undefined, select the "No Category" option
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === 'none') {
                    categorySelect.selectedIndex = i;
                    break;
                }
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
    
    // Display current image if exists from image_data
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
        // Get selected content type from radio buttons
        const contentType = document.getElementById('content-type-video').checked ? 'video' : 'file';
        console.log('Selected content type:', contentType);
        
        // Get form values
        const projectName = document.getElementById('project-title').value;
        const projectCategory = document.getElementById('project-category').value;
        const projectFile = contentType === 'file' ? document.getElementById('project-file').files[0] : null;
        const projectVideo = contentType === 'video' ? document.getElementById('project-video').files[0] : null;
        const projectImage = document.getElementById('project-image').files[0];
        const projectStatus = document.getElementById('project-status').value;
        
        // For debugging only - log the image information
        if (projectImage) {
            console.log('Project image details:', {
                name: projectImage.name,
                type: projectImage.type,
                size: `${(projectImage.size / 1024).toFixed(2)} KB`
            });
        }
        
        if (!projectName) {
            alert('Project name is required!');
            return;
        }
        
        // Category is now optional, so we don't need to validate it
        // if (!projectCategory) {
        //     alert('Project category is required!');
        //     return;
        // }
        
        if (!isEdit && !projectFile && !projectVideo) {
            alert('Project file or video is required for new projects!');
            return;
        }
        
        // Note: Project image is optional - no validation required
        
        let fileUrl = null;
        
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
        
        // Upload and process image if exists
        let imageUrl = null;
        let imageData = null;
        
        // Image is OPTIONAL - only process if an image file was selected
        if (projectImage) {
            console.log('Processing project image - this is optional');
            
            // 1. Upload the image to storage for image_url
            try {
                // Create a random file name for the image
                const fileExt = projectImage.name.split('.').pop();
                const fileName = `image-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `project-images/${fileName}`;
                
                console.log('Starting image upload to path:', filePath);
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('projects')
                    .upload(filePath, projectImage, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: projectImage.type
                    });
                    
                if (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    alert(`Error uploading image: ${uploadError.message}`);
                    return;
                }
                
                console.log('Image upload successful:', uploadData);
                
                // Get the public URL for the image
                const { data: { publicUrl } } = supabase.storage
                    .from('projects')
                    .getPublicUrl(filePath);
                    
                console.log('Image public URL generated:', publicUrl);
                imageUrl = publicUrl;
                
                // 2. Convert image to base64 for image_data column
                const reader = new FileReader();
                imageData = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(projectImage);
                });
                
                console.log('Image converted to base64:', 
                    imageData ? `${imageData.substring(0, 50)}... (length: ${imageData.length})` : 'failed');
                
                // Ensure image_data is in the correct format
                if (imageData) {
                    console.log('Image data type:', typeof imageData);
                    // Make sure it's a data URL format
                    if (!imageData.startsWith('data:')) {
                        console.warn('Image data is not in data URL format, adding prefix');
                        imageData = `data:${projectImage.type};base64,${imageData}`;
                    }
                }
                
            } catch (uploadException) {
                console.error('Exception during image processing:', uploadException);
                alert(`Image processing failed: ${uploadException.message}`);
                return;
            }
        }
        
        // Create project data object
        const projectData = {
            name: projectName,
            status: projectStatus,
            // Store content type as a field in the database
            // Since the content_type column doesn't exist yet, commenting this out
            // content_type: contentType 
        };
        
        // Handle category field
        if (projectCategory && projectCategory !== 'none' && projectCategory !== '') {
            // Add the category if it has a valid value
            projectData.category = projectCategory;
        } else {
            // Explicitly set category to null when "No Category" is selected or empty
            projectData.category = null;
        }
        
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
            // Don't use image_url column since it doesn't exist in the database
            // projectData.image_url = imageUrl;
            console.log('Image URL saved to storage but not added to database record since image_url column does not exist');
        }
        
        // Add image data if a new image was uploaded
        if (imageData) {
            projectData.image_data = imageData;
            console.log('Saving image data to image_data column');
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
            console.error('Error details:', JSON.stringify(result.error, null, 2));
            console.error('Project data size:', JSON.stringify(projectData).length, 'bytes');
            
            // Check if error is related to image_data size
            if (imageData && result.error.message && 
                (result.error.message.includes('too large') || 
                 result.error.message.includes('size') || 
                 result.error.message.includes('limit'))) {
                alert(`Error: The image may be too large. Try using a smaller image file.`);
            } else {
                alert(`Error ${isEdit ? 'updating' : 'adding'} project: ${result.error.message}`);
            }
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
        
        // Create the projects table if it doesn't exist with image_url field
        // Note: This is not the ideal way to create tables, but it works for this example
        // In a production environment, you would use Supabase migrations or Admin UI
        const { error: tableError } = await supabase.rpc('create_projects_table_if_not_exists');
        if (tableError) {
            console.error('Error ensuring projects table exists:', tableError);
        }
        
        // Ensure the image_data column exists and is the correct type
        console.log('Checking image_data column type...');
        const { error: fixError } = await supabase.rpc('fix_image_data_column_type');
        if (fixError) {
            console.error('Error fixing image_data column type:', fixError);
            
            // Try direct SQL via REST API as a fallback
            console.log('Attempting direct SQL method to fix column type...');
            try {
                // First, let's check the column type using REST API
                const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabase.supabaseKey}`,
                        'apikey': supabase.supabaseKey
                    },
                    body: JSON.stringify({
                        query: `
                            SELECT data_type 
                            FROM information_schema.columns 
                            WHERE table_name = 'projects' 
                            AND column_name = 'image_data'
                        `
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Column type information:', data);
                    
                    if (data.length > 0 && data[0].data_type === 'bytea') {
                        console.log('Column is BYTEA, attempting to convert to TEXT...');
                        
                        // If the column is BYTEA, try to convert it to TEXT
                        const alterResponse = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${supabase.supabaseKey}`,
                                'apikey': supabase.supabaseKey
                            },
                            body: JSON.stringify({
                                query: `
                                    ALTER TABLE projects 
                                    ADD COLUMN image_data_new TEXT DEFAULT NULL;
                                    
                                    UPDATE projects 
                                    SET image_data_new = encode(image_data, 'base64');
                                    
                                    ALTER TABLE projects 
                                    DROP COLUMN image_data;
                                    
                                    ALTER TABLE projects 
                                    RENAME COLUMN image_data_new TO image_data;
                                `
                            })
                        });
                        
                        if (alterResponse.ok) {
                            console.log('Successfully converted image_data column to TEXT');
                        } else {
                            console.error('Failed to convert column:', await alterResponse.text());
                        }
                    } else {
                        console.log('Column is already TEXT or does not exist, no conversion needed');
                    }
                } else {
                    console.error('Failed to check column type:', await response.text());
                }
            } catch (sqlError) {
                console.error('Error in direct SQL fix:', sqlError);
            }
        } else {
            console.log('Image data column fixed successfully via RPC');
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
                    'video/mpeg',
                    // Image types
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/webp',
                    'image/svg+xml',
                    'image/bmp',
                    'image/tiff'
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
                
                // Ensure the project-images directory exists in the storage bucket
                try {
                    console.log('Creating project-images directory if it doesn\'t exist');
                    // We can't create directories directly, but we can upload a small placeholder file
                    const placeholderContent = new Blob([''], { type: 'text/plain' });
                    const { error: dirError } = await supabase.storage
                        .from('projects')
                        .upload('project-images/.placeholder', placeholderContent, {
                            upsert: true
                        });
                    
                    if (dirError && dirError.message !== 'The resource already exists') {
                        console.error('Error creating project-images directory:', dirError);
                    } else {
                        console.log('project-images directory ready');
                    }
                } catch (dirException) {
                    console.error('Exception during directory creation:', dirException);
                }
            }
        } catch (bucketException) {
            console.error('Exception during bucket creation:', bucketException);
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