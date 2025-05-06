<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in and is an admin
require_login();
require_admin();

// Check if project ID is provided
if (!isset($_GET['id'])) {
    header("Location: admin.php");
    exit();
}

$project_id = sanitize_input($conn, $_GET['id']);

// Get project details
$project = get_project($project_id);

// If project not found, redirect to admin dashboard
if (!$project) {
    header("Location: admin.php");
    exit();
}

// Initialize variables
$success_message = '';
$error_message = '';

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_project'])) {
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
        try {
            // Start with basic information update
            $update_query = "UPDATE projects SET 
                            name = ?, 
                            status = ?,
                            category = ?,
                            visibility = ?,
                            is_featured = ?,
                            updated_at = NOW()
                            WHERE id = ?";
            
            $stmt = $conn->prepare($update_query);
            $stmt->bind_param("ssssis", 
                $name, 
                $status,
                $category,
                $visibility,
                $is_featured,
                $project_id
            );
            
            // Check for file upload
            if (isset($_FILES['project_file']) && $_FILES['project_file']['error'] === UPLOAD_ERR_OK) {
                $file_data = file_get_contents($_FILES['project_file']['tmp_name']);
                
                // Update the file separately
                $file_update_query = "UPDATE projects SET file = ? WHERE id = ?";
                $file_stmt = $conn->prepare($file_update_query);
                $file_stmt->bind_param("ss", $file_data, $project_id);
                $file_stmt->execute();
                $file_stmt->close();
            }
            
            // Check for image upload
            if (isset($_FILES['project_image']) && $_FILES['project_image']['error'] === UPLOAD_ERR_OK) {
                $image_data = file_get_contents($_FILES['project_image']['tmp_name']);
                
                // Update the image separately
                $image_update_query = "UPDATE projects SET image_data = ? WHERE id = ?";
                $image_stmt = $conn->prepare($image_update_query);
                $image_stmt->bind_param("ss", $image_data, $project_id);
                $image_stmt->execute();
                $image_stmt->close();
            }
            
            // Execute the main update
            if ($stmt->execute()) {
                $success_message = "Project updated successfully!";
                
                // Refresh project data
                $project = get_project($project_id);
            } else {
                $error_message = "Failed to update project: " . $stmt->error;
            }
            
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
    <title>Edit Project - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
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
        
        .current-file {
            background-color: #f5f5f5;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .current-file i {
            font-size: 24px;
            margin-right: 15px;
            color: var(--secondary-color);
        }
        
        .current-file .file-info {
            flex: 1;
        }
        
        .image-preview {
            width: 100%;
            margin-top: 15px;
            display: block;
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
                    <li><a href="admin-add-project.php"><i class="fas fa-plus-circle"></i> Add Project</a></li>
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

            <!-- Edit Project Form -->
            <section class="project-management">
                <div class="section-header">
                    <h2>Edit Project</h2>
                    <a href="admin.php" class="btn-secondary btn"><i class="fas fa-arrow-left"></i> Back to Dashboard</a>
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
                    <form action="admin-edit-project.php?id=<?php echo $project_id; ?>" method="POST" enctype="multipart/form-data">
                        <!-- Project Name -->
                        <div class="form-group">
                            <label for="name">Project Name</label>
                            <input type="text" id="name" name="name" class="form-control" value="<?php echo htmlspecialchars($project['name']); ?>" required>
                        </div>

                        <!-- Project Category -->
                        <div class="form-group">
                            <label for="category">Category</label>
                            <select id="category" name="category" class="form-control">
                                <option value="">Select a category</option>
                                <option value="Residential" <?php echo ($project['category'] === 'Residential') ? 'selected' : ''; ?>>Residential</option>
                                <option value="Commercial" <?php echo ($project['category'] === 'Commercial') ? 'selected' : ''; ?>>Commercial</option>
                                <option value="Industrial" <?php echo ($project['category'] === 'Industrial') ? 'selected' : ''; ?>>Industrial</option>
                                <option value="Interior" <?php echo ($project['category'] === 'Interior') ? 'selected' : ''; ?>>Interior</option>
                                <option value="Landscape" <?php echo ($project['category'] === 'Landscape') ? 'selected' : ''; ?>>Landscape</option>
                                <option value="Urban" <?php echo ($project['category'] === 'Urban') ? 'selected' : ''; ?>>Urban</option>
                                <option value="Other" <?php echo ($project['category'] === 'Other') ? 'selected' : ''; ?>>Other</option>
                            </select>
                        </div>

                        <!-- Project Status -->
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" name="status" class="form-control">
                                <option value="In Progress" <?php echo ($project['status'] === 'In Progress') ? 'selected' : ''; ?>>In Progress</option>
                                <option value="Completed" <?php echo ($project['status'] === 'Completed') ? 'selected' : ''; ?>>Completed</option>
                                <option value="Incompleted" <?php echo ($project['status'] === 'Incompleted') ? 'selected' : ''; ?>>Incompleted</option>
                            </select>
                        </div>

                        <!-- Project Visibility -->
                        <div class="form-group">
                            <label for="visibility">Visibility</label>
                            <select id="visibility" name="visibility" class="form-control">
                                <option value="Public" <?php echo ($project['visibility'] === 'Public') ? 'selected' : ''; ?>>Public</option>
                                <option value="Private" <?php echo ($project['visibility'] === 'Private') ? 'selected' : ''; ?>>Private</option>
                                <option value="Shared" <?php echo ($project['visibility'] === 'Shared') ? 'selected' : ''; ?>>Shared</option>
                            </select>
                        </div>

                        <!-- Featured Project -->
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="is_featured" <?php echo ($project['is_featured'] == 1) ? 'checked' : ''; ?>> Featured Project
                            </label>
                        </div>

                        <!-- Project File Upload -->
                        <div class="form-group">
                            <label for="project_file">Project File</label>
                            
                            <?php if ($project['file']): ?>
                                <div class="current-file">
                                    <i class="fas fa-file-alt"></i>
                                    <div class="file-info">
                                        <div class="file-name">Current Project File</div>
                                        <div class="file-size">Click below to replace</div>
                                    </div>
                                </div>
                            <?php endif; ?>
                            
                            <div class="file-upload-container" id="file-upload-container">
                                <i class="fas fa-file-upload"></i>
                                <h3><?php echo $project['file'] ? 'Replace Project File' : 'Upload Project File'; ?></h3>
                                <p>Click to select or drag and drop your file here</p>
                                <input type="file" id="file-upload" name="project_file" style="display: none;">
                            </div>
                            <div class="file-list" id="file-list"></div>
                        </div>

                        <!-- Project Image Upload -->
                        <div class="form-group">
                            <label for="project_image">Project Image</label>
                            
                            <?php if ($project['image_data']): ?>
                                <div class="image-preview">
                                    <img src="data:image/jpeg;base64,<?php echo base64_encode($project['image_data']); ?>" alt="Current Project Image">
                                </div>
                            <?php endif; ?>
                            
                            <div class="file-upload-container" id="image-upload-container">
                                <i class="fas fa-image"></i>
                                <h3><?php echo $project['image_data'] ? 'Replace Project Image' : 'Upload Project Image'; ?></h3>
                                <p>Click to select or drag and drop your image here (JPEG, PNG, GIF)</p>
                                <input type="file" id="project-image" name="project_image" accept="image/*" style="display: none;">
                            </div>
                            <div class="new-image-preview" style="display: none;"></div>
                        </div>

                        <!-- Project Info -->
                        <div class="form-group">
                            <label>Project Information</label>
                            <div class="info-box">
                                <div><strong>Created:</strong> <?php echo format_date($project['created_at']); ?></div>
                                <div><strong>Last Updated:</strong> <?php echo format_date($project['updated_at']); ?></div>
                                <div><strong>Project ID:</strong> <?php echo $project['id']; ?></div>
                                <?php if ($project['file']): ?>
                                <div style="margin-top: 10px;">
                                    <a href="view-file.php?id=<?php echo $project_id; ?>" class="btn btn-primary btn-sm">
                                        <i class="fas fa-eye"></i> View Project File
                                    </a>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>

                        <!-- Form Buttons -->
                        <div class="form-actions">
                            <a href="admin.php" class="btn btn-secondary">Cancel</a>
                            <button type="submit" name="update_project" class="btn btn-primary">Update Project</button>
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
        const newImagePreview = document.querySelector('.new-image-preview');
        const imageUploadContainer = document.getElementById('image-upload-container');
        const currentImagePreview = document.querySelector('.image-preview');
        
        if (imageInput && newImagePreview && imageUploadContainer) {
            imageUploadContainer.addEventListener('click', function() {
                imageInput.click();
            });
            
            imageInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        if (currentImagePreview) {
                            currentImagePreview.style.display = 'none';
                        }
                        
                        newImagePreview.innerHTML = `<img src="${e.target.result}" alt="New Project Image">`;
                        newImagePreview.style.display = 'block';
                    };
                    
                    reader.readAsDataURL(this.files[0]);
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