<?php
// Include database configuration and helper functions
require_once 'config.php';
require_once 'functions.php';

// Ensure user is logged in
require_login();

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

// Get file data
$file_data = $project['file'];
$file_type = null;

// Try to detect file type
if (!empty($file_data)) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->buffer($file_data);
    
    if (strpos($mime_type, 'pdf') !== false) {
        $file_type = 'pdf';
    } else if (strpos($mime_type, 'video') !== false) {
        $file_type = 'video';
    } else {
        // Default to binary download if not pdf or video
        $file_type = 'other';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Project File - LGC Architecture</title>
    <link rel="stylesheet" href="css/admin-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- PDF.js for PDF handling -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <!-- Turn.js for flipbook effect -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js"></script>
    <style>
        .file-viewer-container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: var(--shadow);
        }
        
        .pdf-viewer {
            width: 100%;
            height: 600px;
            background-color: #fff;
            margin: 20px 0;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
        }
        
        .flipbook {
            width: 100%;
            height: 100%;
        }
        
        .page {
            background-color: white;
            background-size: 100% 100%;
        }
        
        .video-viewer {
            width: 100%;
            margin: 20px 0;
        }
        
        video {
            width: 100%;
            max-height: 600px;
            background-color: #000;
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 15px 0;
        }
        
        .controls button {
            padding: 8px 15px;
            background-color: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .controls button:hover {
            background-color: #2980b9;
        }
        
        .no-file {
            text-align: center;
            padding: 50px 20px;
            color: #888;
        }
        
        .project-header {
            margin-bottom: 20px;
        }
        
        .project-header h2 {
            margin-bottom: 10px;
        }
        
        .project-details {
            display: flex;
            gap: 15px;
            color: #666;
            font-size: 14px;
        }
        
        .project-details span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .loading {
            text-align: center;
            padding: 50px 20px;
            color: #666;
        }
        
        .flipbook-container {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        .pdf-viewer {
            background-color: #444;
            border-radius: 5px;
            height: 650px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 30px 50px rgba(0,0,0,0.3);
            margin: 20px 0;
        }
        
        .flipbook {
            width: 100%;
            height: 100%;
            transition: margin-left 0.25s ease-out;
        }
        
        .flipbook .page {
            width: 50%;
            height: 100%;
            background-color: white;
            float: left;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .flipbook .page.odd {
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
                    <img src="images/admin-avatar.png" alt="Admin">
                </div>
            </header>

            <section class="project-management">
                <div class="section-header">
                    <h2>View Project File</h2>
                    <a href="admin.php" class="btn-secondary btn"><i class="fas fa-arrow-left"></i> Back to Dashboard</a>
                </div>

                <div class="project-header">
                    <h2><?php echo htmlspecialchars($project['name']); ?></h2>
                    <div class="project-details">
                        <span><i class="fas fa-folder"></i> <?php echo htmlspecialchars($project['category'] ?? 'N/A'); ?></span>
                        <span><i class="fas fa-clock"></i> Last updated: <?php echo format_date($project['updated_at']); ?></span>
                        <span class="status-badge <?php echo strtolower($project['status'] ?? 'in_progress'); ?>">
                            <?php echo htmlspecialchars($project['status'] ?? 'In Progress'); ?>
                        </span>
                    </div>
                </div>

                <div class="file-viewer-container">
                    <?php if (empty($file_data)): ?>
                        <div class="no-file">
                            <i class="fas fa-exclamation-circle fa-3x"></i>
                            <h3>No file available</h3>
                            <p>This project does not have an associated file.</p>
                        </div>
                    <?php elseif ($file_type === 'pdf'): ?>
                        <!-- PDF Viewer (Flipbook) -->
                        <div class="controls">
                            <button id="prev-btn"><i class="fas fa-chevron-left"></i> Previous</button>
                            <button id="next-btn">Next <i class="fas fa-chevron-right"></i></button>
                            <button id="download-btn"><i class="fas fa-download"></i> Download PDF</button>
                        </div>
                        <div class="pdf-viewer">
                            <div class="flipbook" id="flipbook">
                                <div class="loading">
                                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                                    <p>Loading PDF...</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hidden download link -->
                        <a id="download-link" style="display: none;" download="<?php echo htmlspecialchars($project['name']); ?>.pdf"></a>
                        
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                // Create a blob from the PDF data and set it as the download link
                                const pdfData = new Uint8Array([<?php 
                                    $bytes = unpack('C*', $file_data);
                                    echo implode(',', $bytes);
                                ?>]);
                                
                                const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                
                                // Set download link
                                const downloadLink = document.getElementById('download-link');
                                downloadLink.href = pdfUrl;
                                
                                // Handle download button click
                                document.getElementById('download-btn').addEventListener('click', function() {
                                    downloadLink.click();
                                });
                                
                                // Initialize PDF.js
                                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
                                
                                // Load the PDF
                                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                                loadingTask.promise.then(function(pdf) {
                                    console.log('PDF loaded');
                                    
                                    // Clear the loading indicator
                                    document.querySelector('#flipbook').innerHTML = '';
                                    
                                    // Load all pages
                                    const numPages = pdf.numPages;
                                    let pagesLoaded = 0;
                                    
                                    for (let i = 1; i <= numPages; i++) {
                                        pdf.getPage(i).then(function(page) {
                                            const scale = 1.5;
                                            const viewport = page.getViewport({ scale });
                                            
                                            // Create a div for this page
                                            const pageDiv = document.createElement('div');
                                            pageDiv.className = 'page';
                                            document.getElementById('flipbook').appendChild(pageDiv);
                                            
                                            // Create canvas for rendering
                                            const canvas = document.createElement('canvas');
                                            const context = canvas.getContext('2d');
                                            canvas.height = viewport.height;
                                            canvas.width = viewport.width;
                                            
                                            // Render the page
                                            const renderContext = {
                                                canvasContext: context,
                                                viewport: viewport
                                            };
                                            
                                            page.render(renderContext).promise.then(function() {
                                                pageDiv.appendChild(canvas);
                                                pagesLoaded++;
                                                
                                                if (pagesLoaded === numPages) {
                                                    // Initialize turn.js flipbook after all pages are loaded
                                                    $('#flipbook').turn({
                                                        width: $('.pdf-viewer').width(),
                                                        height: $('.pdf-viewer').height(),
                                                        autoCenter: true,
                                                        gradients: true,
                                                        acceleration: true
                                                    });
                                                    
                                                    // Add navigation controls
                                                    document.getElementById('prev-btn').addEventListener('click', function() {
                                                        $('#flipbook').turn('previous');
                                                    });
                                                    
                                                    document.getElementById('next-btn').addEventListener('click', function() {
                                                        $('#flipbook').turn('next');
                                                    });
                                                }
                                            });
                                        });
                                    }
                                }).catch(function(error) {
                                    console.error('Error loading PDF:', error);
                                    document.querySelector('#flipbook').innerHTML = `
                                        <div class="no-file">
                                            <i class="fas fa-exclamation-circle fa-3x"></i>
                                            <h3>Error loading PDF</h3>
                                            <p>${error.message}</p>
                                        </div>
                                    `;
                                });
                            });
                        </script>
                    <?php elseif ($file_type === 'video'): ?>
                        <!-- Video Player -->
                        <div class="video-viewer">
                            <video controls autoplay>
                                <source src="data:<?php echo $mime_type; ?>;base64,<?php echo base64_encode($file_data); ?>" type="<?php echo $mime_type; ?>">
                                Your browser does not support the video tag.
                            </video>
                            <div class="controls">
                                <button id="download-btn"><i class="fas fa-download"></i> Download Video</button>
                            </div>
                        </div>
                        
                        <!-- Hidden download link -->
                        <a id="download-link" style="display: none;" download="<?php echo htmlspecialchars($project['name']); ?>.mp4"></a>
                        
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                // Create a blob from the video data and set it as the download link
                                const videoData = new Uint8Array([<?php 
                                    $bytes = unpack('C*', $file_data);
                                    echo implode(',', $bytes);
                                ?>]);
                                
                                const videoBlob = new Blob([videoData], { type: '<?php echo $mime_type; ?>' });
                                const videoUrl = URL.createObjectURL(videoBlob);
                                
                                // Set download link
                                const downloadLink = document.getElementById('download-link');
                                downloadLink.href = videoUrl;
                                
                                // Handle download button click
                                document.getElementById('download-btn').addEventListener('click', function() {
                                    downloadLink.click();
                                });
                            });
                        </script>
                    <?php else: ?>
                        <!-- Other file types (download only) -->
                        <div class="no-file">
                            <i class="fas fa-file fa-3x"></i>
                            <h3>File available for download only</h3>
                            <p>This file type cannot be previewed in the browser.</p>
                            <button id="download-btn" class="btn btn-primary" style="margin-top: 15px;">
                                <i class="fas fa-download"></i> Download File
                            </button>
                        </div>
                        
                        <!-- Hidden download link -->
                        <a id="download-link" style="display: none;" download="<?php echo htmlspecialchars($project['name']); ?>_file"></a>
                        
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {
                                // Create a blob from the file data and set it as the download link
                                const fileData = new Uint8Array([<?php 
                                    $bytes = unpack('C*', $file_data);
                                    echo implode(',', $bytes);
                                ?>]);
                                
                                const fileBlob = new Blob([fileData], { type: 'application/octet-stream' });
                                const fileUrl = URL.createObjectURL(fileBlob);
                                
                                // Set download link
                                const downloadLink = document.getElementById('download-link');
                                downloadLink.href = fileUrl;
                                
                                // Handle download button click
                                document.getElementById('download-btn').addEventListener('click', function() {
                                    downloadLink.click();
                                });
                            });
                        </script>
                    <?php endif; ?>
                </div>
            </section>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="js/admin.js"></script>
</body>
</html> 