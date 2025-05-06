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
    // First check for PDF signature in the first few bytes
    // PDF files start with "%PDF-" signature
    $pdf_signature = "%PDF-";
    
    if (strlen($file_data) > 5 && substr($file_data, 0, 5) === $pdf_signature) {
        $file_type = 'pdf';
        $mime_type = 'application/pdf';
    } else {
        // Use finfo as a secondary method
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->buffer($file_data);
        
        if (strpos($mime_type, 'pdf') !== false) {
            $file_type = 'pdf';
            $mime_type = 'application/pdf';
        } else if (strpos($mime_type, 'video') !== false) {
            $file_type = 'video';
        } else {
            // Fallback to file name extension as last resort
            $file_name = $project['file_name'] ?? '';
            $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            if ($ext === 'pdf') {
                $file_type = 'pdf';
                $mime_type = 'application/pdf';
            } else if (in_array($ext, ['mp4','webm','ogg','mov'])) {
                $file_type = 'video';
            } else {
                // Force PDF type for now to ensure flipbook display
                $file_type = 'pdf';
                $mime_type = 'application/pdf';
            }
        }
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
    <!-- jQuery required for Turn.js and inline scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
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
            height: 500px;
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
            background: -webkit-gradient(linear, right top, left top, color-stop(0.95, #FFF), color-stop(1, #DADADA));
            background-image: linear-gradient(right, #FFF 95%, #C4C4C4 100%);
            box-shadow: inset -10px 0 20px -10px rgba(0,0,0,0.2);
        }
        
        .flipbook .page.even {
            background: -webkit-gradient(linear, left top, right top, color-stop(0.95, #FFF), color-stop(1, #DADADA));
            background-image: linear-gradient(left, #FFF 95%, #C4C4C4 100%);
            box-shadow: inset 10px 0 20px -10px rgba(0,0,0,0.2);
        }
        
        .flipbook-nav {
            display: flex;
            justify-content: center;
            margin-top: 15px;
            gap: 20px;
        }
        
        .flipbook-nav button {
            background-color: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .flipbook-nav button:hover {
            background-color: #2980b9;
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
                    <form action="admin-users.php" method="GET">
                        <input type="text" name="search" placeholder="Search users..." 
                            value="<?php echo isset($_GET['search']) ? htmlspecialchars($_GET['search']) : ''; ?>">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </form>
                </div>
                <div class="user-profile">
                    <span><?php echo htmlspecialchars($_SESSION['username']); ?></span>
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
                        <!-- PDF Flipbook Viewer (used for any non-video file) -->
                        <div id="flipbook-wrapper" class="flipbook-container">
                            <div class="pdf-viewer">
                                <div id="flipbook"></div>
                            </div>
                            <div class="flipbook-nav">
                                <button id="prev-page-btn"><i class="fas fa-chevron-left"></i></button>
                                <button id="next-page-btn"><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        <div class="controls">
                            <button id="download-btn"><i class="fas fa-download"></i> Download File</button>
                        </div>
                        <!-- Hidden download link -->
                        <a id="download-link" style="display: none;" download="<?php echo htmlspecialchars($project['name']); ?>.pdf"></a>
                        
                        <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const fileData = new Uint8Array([<?php echo implode(',', unpack('C*', $file_data)); ?>]);
                            const fileBlob = new Blob([fileData], { type: '<?php echo $mime_type ?? 'application/pdf'; ?>' });
                            const pdfjsLib = window['pdfjs-dist/build/pdf'];
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
                            
                            pdfjsLib.getDocument({ data: fileData }).promise.then(function(pdf) {
                                console.log("PDF loaded successfully with " + pdf.numPages + " pages");
                                const pagePromises = [];
                                
                                for (let i = 1; i <= pdf.numPages; i++) {
                                    pagePromises.push(
                                        pdf.getPage(i).then(function(page) {
                                            const viewport = page.getViewport({ scale: 1.5 });
                                            const canvas = document.createElement('canvas');
                                            const context = canvas.getContext('2d');
                                            canvas.width = viewport.width;
                                            canvas.height = viewport.height;
                                            
                                            return page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                                                return new Promise((resolve) => {
                                                    canvas.toBlob((blob) => {
                                                        const url = URL.createObjectURL(blob);
                                                        const pageDiv = document.createElement('div');
                                                        pageDiv.className = i % 2 === 0 ? 'page even' : 'page odd';
                                                        
                                                        const img = document.createElement('img');
                                                        img.src = url;
                                                        img.style.width = '100%';
                                                        img.style.height = '100%';
                                                        
                                                        pageDiv.appendChild(img);
                                                        resolve(pageDiv);
                                                    });
                                                });
                                            });
                                        })
                                    );
                                }
                                
                                Promise.all(pagePromises).then(function(pages) {
                                    const flipbook = document.getElementById('flipbook');
                                    flipbook.innerHTML = '';
                                    pages.forEach((pageDiv) => flipbook.appendChild(pageDiv));
                                    
                                    console.log("Initializing turn.js with " + pages.length + " pages");
                                    
                                    $(flipbook).turn({
                                        width: $('.pdf-viewer').width(),
                                        height: $('.pdf-viewer').height(),
                                        autoCenter: true,
                                        elevation: 50,
                                        gradients: true,
                                        display: 'double',
                                        acceleration: true,
                                        when: {
                                            turning: function(e, page, view) {
                                                console.log("Turning to page: " + page);
                                            }
                                        }
                                    });
                                    
                                    document.getElementById('prev-page-btn').addEventListener('click', () => {
                                        $(flipbook).turn('previous');
                                    });
                                    
                                    document.getElementById('next-page-btn').addEventListener('click', () => {
                                        $(flipbook).turn('next');
                                    });
                                    
                                    document.getElementById('download-btn').addEventListener('click', () => {
                                        const dl = document.getElementById('download-link');
                                        dl.href = URL.createObjectURL(fileBlob);
                                        dl.click();
                                    });
                                }).catch(function(error) {
                                    console.error("Error rendering pages:", error);
                                });
                            }).catch(function(error) {
                                console.error("Error loading PDF:", error);
                                // Fallback for non-PDF files
                                const downloadBtn = document.getElementById('download-btn');
                                downloadBtn.click();
                            });
                        });
                        </script>
                    <?php endif; ?>
                </div>
            </section>
        </main>
    </div>
</body>
</html> 