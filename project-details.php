<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Get currently logged in user
$current_user = isset($_SESSION['username']) ? $_SESSION['username'] : null;
$is_admin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;

// Get project ID from URL
$project_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Initialize variables
$project = null;
$project_files = [];
$error_message = '';

// Check if project ID is valid
if ($project_id <= 0) {
    $error_message = 'Invalid project ID.';
} else {
    // Fetch project details
    $sql = "SELECT p.*, u.username AS creator_name 
            FROM projects p 
            LEFT JOIN users u ON p.created_by = u.id 
            WHERE p.id = ? AND (p.status = 'published' OR ?=1)";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $project_id, $is_admin);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $project = $result->fetch_assoc();
        
        // Format category name for display
        if (!empty($project['category']) && $project['category'] !== 'none') {
            $category_display = ucwords(str_replace('-', ' ', $project['category']));
        } else {
            $category_display = 'Uncategorized';
        }
        
        // Fetch project files
        $files_sql = "SELECT * FROM project_files WHERE project_id = ? ORDER BY file_order ASC";
        $files_stmt = $conn->prepare($files_sql);
        $files_stmt->bind_param("i", $project_id);
        $files_stmt->execute();
        $files_result = $files_stmt->get_result();
        
        while ($file = $files_result->fetch_assoc()) {
            $project_files[] = $file;
        }
        
        $files_stmt->close();
    } else {
        $error_message = 'Project not found or you do not have permission to view it.';
    }
    
    $stmt->close();
}

// Handle image data
$image_url = '';
if ($project && !empty($project['image_data'])) {
    // If it's already a data URL or a regular URL
    if (strpos($project['image_data'], 'data:') === 0 || 
        preg_match('/^https?:\/\//i', $project['image_data'])) {
        $image_url = $project['image_data'];
    } else {
        // Convert binary data to data URL
        $image_url = 'data:image/jpeg;base64,' . base64_encode($project['image_data']);
    }
}

// Map category to image file (for fallback images)
$category_image_map = [
    'rf-telecommunications' => 'assets/Telecomunication.jpg',
    'energy' => 'assets/Energy.jpg',
    'construction' => 'assets/Construction.jpg',
    'banking' => 'assets/Bank-insurance-office.jpg',
    'sand' => 'assets/Stands.jpg',
    'oil-gas' => 'assets/Oil-gas.jpg',
    'real-estate' => 'assets/Real-Estate.jpg',
    'nuclear' => 'assets/Nuclear.png',
    'industrial' => 'assets/Industrial.jpg',
    'naval' => 'assets/Naval.jpg',
    'bpo' => 'assets/GDO.jpg',
    'automotive' => 'assets/Automotive.jpg',
    'aerospace' => 'assets/Aerospace.jpg',
    'chemistry-pharmaceutical' => 'assets/Chemistry-Pharmacy.jpg'
];

// Use category image as fallback
if (empty($image_url) && $project && isset($project['category']) && 
    array_key_exists($project['category'], $category_image_map)) {
    $image_url = $category_image_map[$project['category']];
}

// If still no image, use a default placeholder
if (empty($image_url)) {
    $image_url = 'assets/placeholder.jpg';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://*.azureedge.net https://*.supabase.co https://cdnjs.cloudflare.com; worker-src blob:; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https://*.supabase.co; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co; frame-src 'self' blob: data:;">
    <title><?php echo $project ? htmlspecialchars($project['name']) . ' - Project Details' : 'Project Not Found'; ?> - Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/logo(2).png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- jQuery required for lightbox and carousel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <!-- PDF.js for PDF processing -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    
    <style>
        /* Project details specific styles */
        .project-details-hero {
            height: 400px;
            background-size: cover;
            background-position: center;
            position: relative;
            margin-top: 60px;
        }
        
        .project-details-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
        }
        
        .project-hero-content {
            position: absolute;
            bottom: 50px;
            left: 50px;
            color: white;
            max-width: 800px;
        }
        
        .project-hero-content h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .project-hero-content p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 1.5rem;
        }
        
        .project-details-section {
            padding: 4rem 0;
        }
        
        .project-details-grid {
            display: grid;
            grid-template-columns: 7fr 3fr;
            gap: 3rem;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        .project-description h2 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 1.5rem;
        }
        
        .project-description p {
            font-size: 1.1rem;
            line-height: 1.7;
            color: #555;
            margin-bottom: 1.5rem;
        }
        
        .project-info {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
            position: sticky;
            top: 100px;
        }
        
        .project-info h3 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #eee;
        }
        
        .info-item {
            margin-bottom: 1.5rem;
        }
        
        .info-item strong {
            display: block;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #777;
            margin-bottom: 0.3rem;
        }
        
        .info-item p {
            font-size: 1.1rem;
            color: #333;
        }
        
        .project-status {
            display: inline-block;
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-published {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-draft {
            background-color: #f8f9fa;
            color: #6c757d;
        }
        
        .status-archived {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .project-gallery {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #eee;
        }
        
        .project-gallery h2 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 2rem;
        }
        
        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .gallery-item {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .gallery-item:hover {
            transform: translateY(-5px);
        }
        
        .gallery-item img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            display: block;
        }
        
        .gallery-item .file-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .gallery-item:hover .file-info {
            opacity: 1;
        }
        
        .file-info h4 {
            margin: 0 0 0.3rem;
            font-size: 1rem;
        }
        
        .file-info p {
            margin: 0;
            font-size: 0.85rem;
            opacity: 0.8;
        }
        
        .file-type-label {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            background: rgba(0, 0, 0, 0.7);
            color: white;
        }
        
        .error-container {
            max-width: 800px;
            margin: 5rem auto;
            padding: 3rem;
            text-align: center;
            background: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .error-container i {
            font-size: 4rem;
            color: #dc3545;
            margin-bottom: 1.5rem;
        }
        
        .error-container h2 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 1rem;
        }
        
        .error-container p {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 2rem;
        }
        
        .back-button {
            display: inline-block;
            padding: 0.8rem 2rem;
            background-color: #333;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .back-button:hover {
            background-color: #000;
            transform: translateY(-3px);
        }
        
        /* Responsive adjustments */
        @media (max-width: 992px) {
            .project-details-grid {
                grid-template-columns: 1fr;
            }
            
            .project-info {
                position: static;
                margin-bottom: 2rem;
            }
            
            .project-hero-content {
                left: 30px;
                bottom: 30px;
            }
            
            .project-hero-content h1 {
                font-size: 2.5rem;
            }
        }
        
        @media (max-width: 768px) {
            .project-details-hero {
                height: 300px;
            }
            
            .project-hero-content {
                left: 20px;
                bottom: 20px;
                max-width: 90%;
            }
            
            .project-hero-content h1 {
                font-size: 2rem;
            }
            
            .project-hero-content p {
                font-size: 1rem;
            }
            
            .gallery-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
        }
    </style>
</head>
<body>
    <header>
        <?php include_once 'navigation.php'; ?>
    </header>

    <main>
        <?php if (!empty($error_message)): ?>
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Project Not Found</h2>
                <p><?php echo htmlspecialchars($error_message); ?></p>
                <a href="portfolios.php" class="back-button">Back to Projects</a>
            </div>
        <?php else: ?>
            <section class="project-details-hero" style="background-image: url('<?php echo htmlspecialchars($image_url); ?>')">
                <div class="project-hero-content">
                    <h1><?php echo htmlspecialchars($project['name']); ?></h1>
                    <p><?php echo isset($category_display) ? htmlspecialchars($category_display) : 'Uncategorized'; ?></p>
                </div>
            </section>

            <section class="project-details-section">
                <div class="project-details-grid">
                    <div class="project-description">
                        <h2>Project Overview</h2>
                        <?php if (!empty($project['description'])): ?>
                            <p><?php echo nl2br(htmlspecialchars($project['description'])); ?></p>
                        <?php else: ?>
                            <p>No description available for this project.</p>
                        <?php endif; ?>
                        
                        <?php if (!empty($project_files)): ?>
                            <div class="project-gallery">
                                <h2>Project Gallery</h2>
                                <div class="gallery-grid">
                                    <?php foreach ($project_files as $file): ?>
                                        <?php
                                        // Determine file type and thumbnail
                                        $file_type = pathinfo($file['file_name'], PATHINFO_EXTENSION);
                                        $file_type_label = strtoupper($file_type);
                                        
                                        // Determine thumbnail based on file type
                                        $thumbnail_url = '';
                                        if (in_array($file_type, ['jpg', 'jpeg', 'png', 'gif'])) {
                                            // Use the actual image if it's an image file
                                            if (!empty($file['file_data'])) {
                                                if (strpos($file['file_data'], 'data:') === 0) {
                                                    $thumbnail_url = $file['file_data'];
                                                } else {
                                                    $thumbnail_url = 'data:image/jpeg;base64,' . base64_encode($file['file_data']);
                                                }
                                            }
                                        } else {
                                            // Use default thumbnail based on file type
                                            switch ($file_type) {
                                                case 'pdf':
                                                    $thumbnail_url = 'assets/pdf-thumbnail.jpg';
                                                    break;
                                                case 'doc':
                                                case 'docx':
                                                    $thumbnail_url = 'assets/word-thumbnail.jpg';
                                                    break;
                                                case 'xls':
                                                case 'xlsx':
                                                    $thumbnail_url = 'assets/excel-thumbnail.jpg';
                                                    break;
                                                case 'ppt':
                                                case 'pptx':
                                                    $thumbnail_url = 'assets/powerpoint-thumbnail.jpg';
                                                    break;
                                                default:
                                                    $thumbnail_url = 'assets/file-thumbnail.jpg';
                                            }
                                        }
                                        
                                        // Fallback to default thumbnail if needed
                                        if (empty($thumbnail_url)) {
                                            $thumbnail_url = 'assets/file-thumbnail.jpg';
                                        }
                                        ?>
                                        <div class="gallery-item" data-file-id="<?php echo htmlspecialchars($file['id']); ?>" onclick="viewFile(<?php echo htmlspecialchars($file['id']); ?>)">
                                            <img src="<?php echo htmlspecialchars($thumbnail_url); ?>" alt="<?php echo htmlspecialchars($file['file_name']); ?>">
                                            <div class="file-type-label"><?php echo htmlspecialchars($file_type_label); ?></div>
                                            <div class="file-info">
                                                <h4><?php echo htmlspecialchars($file['file_name']); ?></h4>
                                                <p><?php echo !empty($file['description']) ? htmlspecialchars($file['description']) : 'No description'; ?></p>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="project-info">
                        <h3>Project Details</h3>
                        
                        <div class="info-item">
                            <strong>Client</strong>
                            <p><?php echo !empty($project['client']) ? htmlspecialchars($project['client']) : 'Not specified'; ?></p>
                        </div>
                        
                        <div class="info-item">
                            <strong>Location</strong>
                            <p><?php echo !empty($project['location']) ? htmlspecialchars($project['location']) : 'Not specified'; ?></p>
                        </div>
                        
                        <div class="info-item">
                            <strong>Completion Date</strong>
                            <p>
                                <?php 
                                if (!empty($project['completion_date'])) {
                                    echo date('F Y', strtotime($project['completion_date']));
                                } else {
                                    echo 'Not specified';
                                }
                                ?>
                            </p>
                        </div>
                        
                        <div class="info-item">
                            <strong>Category</strong>
                            <p><?php echo isset($category_display) ? htmlspecialchars($category_display) : 'Uncategorized'; ?></p>
                        </div>
                        
                        <?php if ($is_admin): ?>
                            <div class="info-item">
                                <strong>Status</strong>
                                <span class="project-status status-<?php echo htmlspecialchars($project['status']); ?>">
                                    <?php echo ucfirst(htmlspecialchars($project['status'])); ?>
                                </span>
                            </div>
                            
                            <div class="info-item">
                                <strong>Created By</strong>
                                <p><?php echo !empty($project['creator_name']) ? htmlspecialchars($project['creator_name']) : 'Unknown'; ?></p>
                            </div>
                            
                            <div class="info-item">
                                <strong>Created Date</strong>
                                <p>
                                    <?php 
                                    if (!empty($project['created_at'])) {
                                        echo date('M d, Y', strtotime($project['created_at']));
                                    } else {
                                        echo 'Unknown';
                                    }
                                    ?>
                                </p>
                            </div>
                            
                            <a href="admin-edit-project.php?id=<?php echo $project_id; ?>" class="back-button" style="width: 100%; text-align: center; margin-top: 1rem;">
                                <i class="fas fa-edit"></i> Edit Project
                            </a>
                        <?php endif; ?>
                        
                        <a href="portfolios.php" class="back-button" style="width: 100%; text-align: center; margin-top: 1rem; background-color: #6c757d;">
                            <i class="fas fa-arrow-left"></i> Back to Projects
                        </a>
                    </div>
                </div>
            </section>
        <?php endif; ?>
    </main>

    <footer>
        <div class="footer-content">
            <div class="social-links">
                <a href="https://www.instagram.com/lgcarchi/"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/profile.php?id=100094347141527"><i class="fab fa-facebook"></i></a>
                <a href="https://twitter.com/ingegneria_lgc"><i class="fab fa-twitter"></i></a>
            </div>
            <p>&copy; <?php echo date('Y'); ?> Architecture Portfolio. All rights reserved.</p>
        </div>
    </footer>
    
    <!-- File Viewer Modal -->
    <div id="file-viewer-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-file-title">File Preview</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div id="file-viewer-container">
                    <iframe id="file-iframe" width="100%" height="600" style="display: none;"></iframe>
                    <img id="file-image" style="display: none; max-width: 100%;" />
                    <div id="file-unsupported" style="display: none; text-align: center; padding: 2rem;">
                        <i class="fas fa-file-alt" style="font-size: 4rem; color: #6c757d; margin-bottom: 1rem;"></i>
                        <h3>This file type cannot be previewed</h3>
                        <p>The file may need to be downloaded to be viewed.</p>
                        <a id="file-download-link" href="#" class="back-button">
                            <i class="fas fa-download"></i> Download File
                        </a>
                    </div>
                    <div id="file-loading" style="display: none; text-align: center; padding: 2rem;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #333; margin-bottom: 1rem;"></i>
                        <p>Loading file...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize modal functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Get modal elements
            const modal = document.getElementById('file-viewer-modal');
            const closeBtn = modal.querySelector('.close-modal');
            
            // Close modal when clicking the close button
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                resetFileViewer();
            });
            
            // Close modal when clicking outside the content
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    resetFileViewer();
                }
            });
        });
        
        // Function to view a file
        function viewFile(fileId) {
            const modal = document.getElementById('file-viewer-modal');
            const fileIframe = document.getElementById('file-iframe');
            const fileImage = document.getElementById('file-image');
            const fileUnsupported = document.getElementById('file-unsupported');
            const fileLoading = document.getElementById('file-loading');
            const fileTitle = document.getElementById('modal-file-title');
            const fileDownloadLink = document.getElementById('file-download-link');
            
            // Reset file viewer
            resetFileViewer();
            
            // Show loading indicator
            fileLoading.style.display = 'block';
            
            // Show modal
            modal.style.display = 'block';
            
            // Fetch file data from the server
            fetch(`view-file.php?id=${fileId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Hide loading indicator
                    fileLoading.style.display = 'none';
                    
                    if (data.error) {
                        showUnsupportedFile(data.error);
                        return;
                    }
                    
                    // Set file title
                    fileTitle.textContent = data.file_name;
                    
                    // Set download link
                    fileDownloadLink.href = `download-file.php?id=${fileId}`;
                    
                    // Determine how to display the file based on type
                    const fileType = data.file_type.toLowerCase();
                    
                    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                        // Show image
                        fileImage.src = data.file_url;
                        fileImage.style.display = 'block';
                    } else if (fileType === 'pdf') {
                        // Show PDF in iframe
                        fileIframe.src = data.file_url;
                        fileIframe.style.display = 'block';
                    } else {
                        // Show unsupported file message
                        showUnsupportedFile();
                    }
                })
                .catch(error => {
                    console.error('Error fetching file:', error);
                    fileLoading.style.display = 'none';
                    showUnsupportedFile('Error loading file. Please try again later.');
                });
        }
        
        // Function to reset file viewer
        function resetFileViewer() {
            const fileIframe = document.getElementById('file-iframe');
            const fileImage = document.getElementById('file-image');
            const fileUnsupported = document.getElementById('file-unsupported');
            const fileLoading = document.getElementById('file-loading');
            
            fileIframe.style.display = 'none';
            fileIframe.src = '';
            fileImage.style.display = 'none';
            fileImage.src = '';
            fileUnsupported.style.display = 'none';
            fileLoading.style.display = 'none';
        }
        
        // Function to show unsupported file message
        function showUnsupportedFile(errorMessage = null) {
            const fileUnsupported = document.getElementById('file-unsupported');
            
            if (errorMessage) {
                const errorElement = fileUnsupported.querySelector('h3');
                errorElement.textContent = errorMessage;
            }
            
            fileUnsupported.style.display = 'block';
        }
    </script>
</body>
</html> 