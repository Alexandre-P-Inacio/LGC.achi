<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in and is an admin
require_login();
require_admin();

// Initialize variables
$success_message = '';
$error_message = '';

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_project'])) {
    // Get form data
    $name = sanitize_input($conn, $_POST['name']);
    $status = sanitize_input($conn, $_POST['status']);
    $category = sanitize_input($conn, $_POST['category']);
    $visibility = sanitize_input($conn, $_POST['visibility']);
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;
    
    // Validate input
    if (empty($name)) {
        $error_message = "Project name is required.";
    } else {
        // Generate a UUID for the project
        $project_id = generate_uuid();
        
        // Initialize file and image variables
        $file_data = null;
        $image_data = null;
        
        // Handle project file upload
        if (isset($_FILES['project_file']) && $_FILES['project_file']['error'] === UPLOAD_ERR_OK) {
            $file_data = file_get_contents($_FILES['project_file']['tmp_name']);
        }
        
        // Handle project image upload
        if (isset($_FILES['project_image']) && $_FILES['project_image']['error'] === UPLOAD_ERR_OK) {
            $image_data = file_get_contents($_FILES['project_image']['tmp_name']);
        }
        
        // Create project in database
        try {
            // Prepare statement
            $stmt = $conn->prepare("INSERT INTO projects (id, name, file, status, category, is_featured, visibility, image_data, created_at, updated_at) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
            
            // Bind parameters
            $stmt->bind_param("ssssssss", 
                $project_id, 
                $name, 
                $file_data,
                $status,
                $category,
                $is_featured,
                $visibility,
                $image_data
            );
            
            // Execute query
            if ($stmt->execute()) {
                $success_message = "Project added successfully!";
                
                // Clear form data on successful submission
                $name = $category = $status = $visibility = '';
                $is_featured = 0;
            } else {
                $error_message = "Failed to add project: " . $stmt->error;
            }
            
            // Close statement
            $stmt->close();
            
        } catch (Exception $e) {
            $error_message = "An error occurred: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Project - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .password-field {
            position: relative;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            width: 90%;
            max-width: 600px;
            margin: 50px auto;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .close {
            font-size: 24px;
            cursor: pointer;
        }
        
        .file-upload-container {
            border: 2px dashed #ddd;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
            transition: var(--transition);
            cursor: pointer;
        }
        
        .file-upload-container:hover {
            border-color: var(--secondary-color);
        }
        
        .file-upload-container i {
            font-size: 40px;
            color: #ccc;
            margin-bottom: 15px;
        }
        
        .file-upload-container h3 {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .file-upload-container p {
            font-size: 14px;
            color: #888;
        }
        
        .file-list {
            margin-top: 20px;
        }
        
        .file-item {
            display: flex;
            align-items: center;
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 10px 15px;
            margin-bottom: 10px;
        }
        
        .file-item i {
            font-size: 24px;
            margin-right: 15px;
        }
        
        .file-info {
            flex: 1;
        }
        
        .file-name {
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .file-size {
            font-size: 12px;
            color: #888;
        }
        
        .image-preview {
            width: 100%;
            margin-top: 15px;
            display: none;
        }
        
        .image-preview img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 5px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo">
                <h2>LGC.achi</h2>
                <p>Admin Panel</p>
            </div>
            <nav class="nav-menu">
                <ul>
                    <li><a href="admin.php"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><a href="admin-users.php"><i class="fas fa-users"></i> Manage Users</a></li>
                    <li class="active"><a href="admin-add-project.php"><i class="fas fa-plus-circle"></i> Add Project</a></li>
                    <li><a href="index.php" target="_blank"><i class="fas fa-home"></i> View Site</a></li>
                    <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            <header class="top-header">
                <div class="search-container">
                    <!-- No search needed on this page -->
                </div>
                <div class="user-profile">
                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
                </div>
            </header>

            <!-- Add Project Form -->
            <section class="project-management">
                <div class="section-header">
                    <h2>Add New Project</h2>
                </div>

                <?php if (!empty($success_message)): ?>
                    <div class="alert success">
                        <?php echo $success_message; ?>
                    </div>
                <?php endif; ?>

                <?php if (!empty($error_message)): ?>
                    <div class="alert error">
                        <?php echo $error_message; ?>
                    </div>
                <?php endif; ?>

                <div class="form-container">
                    <form action="admin-add-project.php" method="POST" enctype="multipart/form-data">
                        <!-- Project Name -->
                        <div class="form-group">
                            <label for="name">Project Name</label>
                            <input type="text" id="name" name="name" class="form-control" value="<?php echo isset($name) ? htmlspecialchars($name) : ''; ?>" required>
                        </div>

                        <!-- Project Category -->
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select id="category" name="category" class="form-control">
                                <option value="">Select a category</option>
                                <option value="Residential" <?php echo (isset($category) && $category === 'Residential') ? 'selected' : ''; ?>>Residential</option>
                                <option value="Commercial" <?php echo (isset($category) && $category === 'Commercial') ? 'selected' : ''; ?>>Commercial</option>
                                <option value="Industrial" <?php echo (isset($category) && $category === 'Industrial') ? 'selected' : ''; ?>>Industrial</option>
                                <option value="Interior" <?php echo (isset($category) && $category === 'Interior') ? 'selected' : ''; ?>>Interior</option>
                                <option value="Landscape" <?php echo (isset($category) && $category === 'Landscape') ? 'selected' : ''; ?>>Landscape</option>
                                <option value="Urban" <?php echo (isset($category) && $category === 'Urban') ? 'selected' : ''; ?>>Urban</option>
                                <option value="Other" <?php echo (isset($category) && $category === 'Other') ? 'selected' : ''; ?>>Other</option>
                            </select>
                        </div>

                        <!-- Project Status -->
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" class="form-control">
                                <option value="In Progress" <?php echo (isset($status) && $status === 'In Progress') ? 'selected' : ''; ?>>In Progress</option>
                                <option value="Completed" <?php echo (isset($status) && $status === 'Completed') ? 'selected' : ''; ?>>Completed</option>
                                <option value="Incompleted" <?php echo (isset($status) && $status === 'Incompleted') ? 'selected' : ''; ?>>Incompleted</option>
                            </select>
                        </div>

                        <!-- Project Visibility -->
                        <div class="form-group">
                            <label for="visibility">Visibility</label>
                            <select id="visibility" name="visibility" class="form-control">
                                <option value="Public" <?php echo (isset($visibility) && $visibility === 'Public') ? 'selected' : ''; ?>>Public</option>
                                <option value="Private" <?php echo (isset($visibility) && $visibility === 'Private') ? 'selected' : ''; ?>>Private</option>
                                <option value="Shared" <?php echo (isset($visibility) && $visibility === 'Shared') ? 'selected' : ''; ?>>Shared</option>
                            </select>
                        </div>

                        <!-- Featured Project -->
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="is_featured" <?php echo (isset($is_featured) && $is_featured) ? 'checked' : ''; ?>> Featured Project
                            </label>
                        </div>

                        <!-- Project File Upload -->
                        <div class="form-group">
                            <label for="project_file">Project File</label>
                            <div class="file-upload-container" id="file-upload-container">
                                <i class="fas fa-file-upload"></i>
                                <h3>Upload Project File</h3>
                                <p>Click to select or drag and drop your file here</p>
                                <input type="file" id="file-upload" name="project_file" style="display: none;">
                            </div>
                            <div class="file-list" id="file-list"></div>
                        </div>

                        <!-- Project Image Upload -->
                        <div class="form-group">
                            <label for="project_image">Project Image</label>
                            <div class="file-upload-container" id="image-upload-container">
                                <i class="fas fa-image"></i>
                                <h3>Upload Project Image</h3>
                                <p>Click to select or drag and drop your image here (JPEG, PNG, GIF)</p>
                                <input type="file" id="project-image" name="project_image" accept="image/*" style="display: none;">
                            </div>
                            <div class="image-preview"></div>
                        </div>

                        <!-- Form Buttons -->
                        <div class="form-actions">
                            <button type="reset" class="btn btn-secondary">Reset</button>
                            <button type="submit" name="add_project" class="btn btn-primary">Add Project</button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    </div>

    <script src="js/admin.js"></script>
    <script>
        // File upload preview
        const fileInput = document.getElementById('file-upload');
        const fileList = document.getElementById('file-list');
        const fileUploadContainer = document.getElementById('file-upload-container');
        
        if (fileInput && fileList && fileUploadContainer) {
            fileUploadContainer.addEventListener('click', function() {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', function() {
                fileList.innerHTML = '';
                
                if (this.files.length > 0) {
                    for (let i = 0; i < this.files.length; i++) {
                        const file = this.files[i];
                        const fileSize = formatFileSize(file.size);
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        let fileIconClass = 'fas fa-file';
                        
                        // Set icon based on file type
                        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
                            fileIconClass = 'fas fa-file-image';
                        } else if (['doc', 'docx', 'txt', 'pdf'].includes(fileExtension)) {
                            fileIconClass = 'fas fa-file-alt';
                        } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
                            fileIconClass = 'fas fa-file-excel';
                        } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                            fileIconClass = 'fas fa-file-archive';
                        }
                        
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';
                        fileItem.innerHTML = `
                            <i class="${fileIconClass}"></i>
                            <div class="file-info">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${fileSize}</div>
                            </div>
                        `;
                        
                        fileList.appendChild(fileItem);
                    }
                }
            });
        }
        
        // Image upload preview
        const imageInput = document.getElementById('project-image');
        const imagePreview = document.querySelector('.image-preview');
        const imageUploadContainer = document.getElementById('image-upload-container');
        
        if (imageInput && imagePreview && imageUploadContainer) {
            imageUploadContainer.addEventListener('click', function() {
                imageInput.click();
            });
            
            imageInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Project Preview">`;
                        imagePreview.style.display = 'block';
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                } else {
                    imagePreview.innerHTML = '';
                    imagePreview.style.display = 'none';
                }
            });
        }
        
        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
    </script>
</body>
</html> 