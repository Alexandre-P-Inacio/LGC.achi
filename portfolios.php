<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';
require_once 'functions.php';

// Get currently logged in user
$current_user = isset($_SESSION['username']) ? $_SESSION['username'] : null;
$is_admin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;

// Check if a specific project is requested
$project_id = isset($_GET['project']) ? $_GET['project'] : null;

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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://*.azureedge.net https://*.supabase.co https://cdnjs.cloudflare.com; worker-src blob:; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https://*.supabase.co; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co https://pwsgmskiamkpzgtlaikm.supabase.co; frame-src 'self' data: blob: https://*.supabase.co https://pwsgmskiamkpzgtlaikm.supabase.co https://docs.google.com; object-src 'self' blob: data: https://*.supabase.co;">
    <title>Projects - Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/logo(2).png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- jQuery required for Turn.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <!-- Turn.js library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js"></script>
    <!-- PDF.js for PDF processing -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
    <script>
        // Configure PDF.js worker
        window.addEventListener('DOMContentLoaded', function() {
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
                console.log('PDF.js worker configured');
            } else {
                console.error('PDF.js library not loaded');
            }
        });
    </script>
    
    <!-- Load Supabase first -->
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <script>
        // Make Supabase globally accessible
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Checking supabase:', typeof supabase);
            if (typeof supabase !== 'undefined') {
                window.supabase = supabase;
                console.log('Supabase made globally available');
            }
        });
    </script>
    
    <!-- Load other scripts -->
    <script src="auth.js" defer></script>
    <script src="animation.js" defer></script>
    <!-- Do not include navigation.js as it conflicts with PHP navigation -->
</head>
<body>
    <header>
        <?php include_once 'navigation.php'; ?>
    </header>

    <main>
        <section id="portfolios">
            <div class="container">
                <div class="portfolio-header">
                    <h2>Our Projects</h2>
                    <p id="category-filter-info">Showing all projects</p>
                </div>
                
                <div class="portfolio-filters">
                    <button class="filter-button active" data-filter="all">All Categories</button>
                    <div class="filter-dropdown">
                        <button class="filter-dropdown-btn">Select Category <i class="fas fa-chevron-down"></i></button>
                        <div class="filter-dropdown-content">
                            <button class="filter-item" data-filter="rf-telecommunications">RF Telecommunications</button>
                            <button class="filter-item" data-filter="energy">Energy</button>
                            <button class="filter-item" data-filter="construction">Construction</button>
                            <button class="filter-item" data-filter="banking">Bank Insurance Office</button>
                            <button class="filter-item" data-filter="sand">Stand</button>
                            <button class="filter-item" data-filter="oil-gas">Oil & Gas</button>
                            <button class="filter-item" data-filter="real-estate">Real Estate</button>
                            <button class="filter-item" data-filter="nuclear">Nuclear</button>
                            <button class="filter-item" data-filter="industrial">Industrial</button>
                            <button class="filter-item" data-filter="naval">Naval</button>
                            <button class="filter-item" data-filter="bpo">BPO</button>
                            <button class="filter-item" data-filter="automotive">Automotive</button>
                            <button class="filter-item" data-filter="aerospace">Aerospace</button>
                            <button class="filter-item" data-filter="chemistry-pharmaceutical">Chemistry-Pharmaceutical</button>
                        </div>
                    </div>
                </div>
                
                <div id="no-projects" class="no-projects" style="display: none;">
                    <i class="fas fa-folder-open"></i>
                    <h3>No projects found</h3>
                    <p>There are no projects in this category yet.</p>
                </div>
                
                <div id="portfolio-grid" class="portfolio-grid">
                    <!-- Projects will be loaded here dynamically -->
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading projects...</p>
                    </div>
                </div>
            </div>
        </section>
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
            <div class="file-info-bar">
                <div class="file-type-icon" id="file-type-icon">DOC</div>
                <span id="file-info">Loading file information...</span>
            </div>
            <div class="modal-body">
                <div id="file-viewer-container">
                    <!-- Turn.js Flipbook container -->
                    <div id="flipbook-wrapper">
                        <div id="flipbook"></div>
                        <div class="flipbook-nav">
                            <button id="prev-page-btn"><i class="fas fa-chevron-left"></i></button>
                            <button id="next-page-btn"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                    
                    <!-- Original preview elements -->
                    <iframe id="file-iframe" width="100%" height="600" style="display: none;"></iframe>
                    <img id="file-image" style="display: none;" />
                    <div id="file-unsupported" style="display: none;">
                        <i class="fas fa-file-alt"></i>
                        <h3>This file type cannot be previewed</h3>
                        <p>The file may need to be downloaded to be viewed.</p>
                        <a id="file-download-link" href="#" class="action-button">
                            <i class="fas fa-download"></i> Download File
                        </a>
                    </div>
                    
                    <!-- Loading indicator -->
                    <div class="modal-loading" id="file-loading">
                        <div class="loading-spinner"></div>
                        <p>Loading file...</p>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-action-button" id="zoom-in-button">
                    <i class="fas fa-search-plus"></i> Zoom In
                </button>
                <button class="file-action-button" id="zoom-out-button">
                    <i class="fas fa-search-minus"></i> Zoom Out
                </button>
                <a id="download-button" href="#" class="file-action-button">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        </div>
    </div>
    
    <script>
        // JavaScript to fetch and display projects
        document.addEventListener('DOMContentLoaded', function() {
            // Check for category filter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const categoryFilter = urlParams.get('category');
            
            // Check if there's a stored category in localStorage
            const storedCategory = localStorage.getItem('selectedCategory');
            
            // Determine which category to use
            let currentCategory = categoryFilter || storedCategory || 'all';
            
            // Update filter UI based on selected category
            updateFilterUI(currentCategory);
            
            // Load projects based on the selected category
            loadProjects(currentCategory);
            
            // Add click event to filter buttons
            document.querySelectorAll('.filter-button, .filter-item').forEach(button => {
                button.addEventListener('click', function() {
                    const category = this.getAttribute('data-filter');
                    currentCategory = category;
                    localStorage.setItem('selectedCategory', category);
                    updateFilterUI(category);
                    loadProjects(category);
                });
            });
            
            // Initialize the file viewer modal
            initFileViewer();
            
            // Get filter dropdown elements
            const filterDropdownBtn = document.querySelector('.filter-dropdown-btn');
            const filterDropdownContent = document.querySelector('.filter-dropdown-content');
            
            // Toggle dropdown on button click
            if (filterDropdownBtn) {
                filterDropdownBtn.addEventListener('click', function() {
                    filterDropdownContent.classList.toggle('show');
                });
            }
            
            // Close dropdown when clicking outside
            window.addEventListener('click', function(event) {
                if (!event.target.matches('.filter-dropdown-btn') && !event.target.closest('.filter-dropdown-content')) {
                    if (filterDropdownContent.classList.contains('show')) {
                        filterDropdownContent.classList.remove('show');
                    }
                }
            });
            
            // Add event handler for portfolio item clicks
            document.addEventListener('click', function(e) {
                const portfolioLink = e.target.closest('.view-project-btn');
                if (portfolioLink) {
                    e.preventDefault();
                    const projectId = new URL(portfolioLink.href).searchParams.get('id');
                    if (projectId) {
                        window.location.href = 'project-details.php?id=' + projectId;
                    }
                }
            });
        });
        
        // Function to update the filter UI based on selected category
        function updateFilterUI(category) {
            // Update the All button
            document.querySelector('.filter-button').classList.toggle('active', category === 'all');
            
            // Update dropdown button text
            const dropdownBtn = document.querySelector('.filter-dropdown-btn');
            
            // Format the category name for display
            let categoryDisplay = 'Select Category';
            if (category !== 'all') {
                categoryDisplay = category
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            // Update the filter info text
            const filterInfo = document.getElementById('category-filter-info');
            filterInfo.textContent = category === 'all' ? 'Showing all projects' : `Showing ${categoryDisplay} projects`;
        }
        
        // Function to load projects from the database
        function loadProjects(category) {
            const portfolioGrid = document.getElementById('portfolio-grid');
            const noProjectsElement = document.getElementById('no-projects');
            
            // Show loading spinner
            portfolioGrid.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading projects...</p>
                </div>
            `;
            
            // Hide no projects message
            noProjectsElement.style.display = 'none';
            
            // Create URL with query parameter if category is not 'all'
            let url = 'fetch-projects.php';
            if (category !== 'all') {
                url += `?category=${encodeURIComponent(category)}`;
            }
            
            // Fetch projects from the server
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network error (status ${response.status}): ${response.statusText}`);
                    }
                    return response.text(); // Get response as text first
                })
                .then(text => {
                    // First check if the response is empty
                    if (!text || text.trim() === '') {
                        throw new Error('Empty response from server');
                    }
                    
                    try {
                        // Try to parse the text as JSON
                        return JSON.parse(text);
                    } catch (error) {
                        // Log the raw response for debugging
                        console.error('Invalid JSON received:', text);
                        throw new Error(`JSON parsing failed: ${error.message}`);
                    }
                })
                .then(projects => {
                    // Clear loading spinner
                    portfolioGrid.innerHTML = '';
                    
                    // Check if we got an error object
                    if (projects.error) {
                        throw new Error(projects.error);
                    }
                    
                    // Check if projects were found
                    if (!Array.isArray(projects) || projects.length === 0) {
                        // Show no projects message
                        noProjectsElement.style.display = 'flex';
                        return;
                    }
                    
                    // Create project cards
                    projects.forEach(project => {
                        // Create project card HTML
                        const projectCard = createProjectCard(project);
                        portfolioGrid.appendChild(projectCard);
                    });
                    
                    // Add event listeners to view details buttons
                    document.querySelectorAll('.view-file-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const projectId = this.getAttribute('data-project-id');
                            if (projectId) {
                                showFileInModal(projectId, this.getAttribute('data-project-name'));
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Error fetching projects:', error);
                    portfolioGrid.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Error loading projects</h3>
                            <p>${error.message || 'Please try again later'}</p>
                        </div>
                    `;
                });
        }
        
        // Function to create a project card element
        function createProjectCard(project) {
            // Create main card element
            const card = document.createElement('div');
            card.className = 'portfolio-item';
            card.setAttribute('data-category', project.category || 'uncategorized');
            
            // Determine project image
            let imageUrl = 'assets/placeholder.jpg'; // Default placeholder
            
            if (project.image_data) {
                // Use the project image if available
                if (typeof project.image_data === 'string' && project.image_data.startsWith('data:')) {
                    imageUrl = project.image_data;
                } else {
                    // Convert binary data to Base64 if needed
                    imageUrl = 'data:image/jpeg;base64,' + project.image_data;
                }
            } else if (project.category && window.categoryImageMap && window.categoryImageMap[project.category]) {
                // Use category image as fallback
                imageUrl = window.categoryImageMap[project.category];
            }
            
            // Format the category name for display
            let categoryDisplay = 'Uncategorized';
            if (project.category && project.category !== 'none') {
                categoryDisplay = project.category
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            // Determine if there is a file to view
            const hasFile = project.has_file === true;
            const viewFileButton = hasFile ? 
                `<button class="view-file-btn" data-project-id="${project.id}" data-project-name="${project.name}">
                    <i class="fas fa-file"></i> View File
                </button>` : '';
            
            // Create card HTML
            card.innerHTML = `
                <div class="portfolio-image" style="background-image: url('${imageUrl}')">
                    <div class="portfolio-overlay">
                        <h3>${project.name || 'Untitled Project'}</h3>
                        <p>${categoryDisplay}</p>
                        <div class="portfolio-buttons">
                            <a href="project-details.php?id=${project.id}" class="view-project-btn">View Details</a>
                            ${viewFileButton}
                        </div>
                    </div>
                </div>
            `;
            
            return card;
        }
        
        // Initialize the file viewer modal
        function initFileViewer() {
            const modal = document.getElementById('file-viewer-modal');
            const closeBtn = modal.querySelector('.close-modal');
            
            // Close the modal when clicking the close button
            closeBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
            
            // Close the modal when clicking outside the content
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Function to display file in modal
        function showFileInModal(projectId, projectName) {
            const modal = document.getElementById('file-viewer-modal');
            const title = document.getElementById('modal-file-title');
            const fileLoading = document.getElementById('file-loading');
            const fileTypeIcon = document.getElementById('file-type-icon');
            const fileInfo = document.getElementById('file-info');
            const iframe = document.getElementById('file-iframe');
            const imgPreview = document.getElementById('file-image');
            const unsupportedView = document.getElementById('file-unsupported');
            const flipbookWrapper = document.getElementById('flipbook-wrapper');
            const downloadButton = document.getElementById('download-button');
            
            // Reset display
            iframe.style.display = 'none';
            imgPreview.style.display = 'none';
            unsupportedView.style.display = 'none';
            flipbookWrapper.style.display = 'none';
            
            // Show loading
            fileLoading.style.display = 'flex';
            
            // Set title
            title.textContent = projectName || 'File Preview';
            
            // Show modal
            modal.style.display = 'block';
            
            // Fetch file data
            fetch(`get-project-file.php?id=${projectId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('File not found');
                    }
                    return response.json();
                })
                .then(data => {
                    // Hide loading
                    fileLoading.style.display = 'none';
                    
                    if (!data.file || !data.file_type) {
                        throw new Error('No file available');
                    }
                    
                    // Update file info
                    const fileType = data.file_type.toUpperCase();
                    fileTypeIcon.textContent = fileType;
                    fileInfo.textContent = `${data.file_name} • ${data.file_size || 'Unknown size'}`;
                    
                    // Set up download button
                    downloadButton.href = `download-file.php?id=${projectId}`;
                    
                    // Display based on file type
                    if (data.file_type.toLowerCase() === 'pdf') {
                        displayPdf(data.file, projectName);
                    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(data.file_type.toLowerCase())) {
                        displayImage(data.file, data.file_type);
                    } else {
                        // Unsupported file type
                        unsupportedView.style.display = 'block';
                        document.getElementById('file-download-link').href = `download-file.php?id=${projectId}`;
                    }
                })
                .catch(error => {
                    console.error('Error loading file:', error);
                    fileLoading.style.display = 'none';
                    unsupportedView.style.display = 'block';
                    document.getElementById('file-download-link').href = `download-file.php?id=${projectId}`;
                });
        }
        
        // Function to display PDF
        function displayPdf(pdfData, fileName) {
            const flipbookWrapper = document.getElementById('flipbook-wrapper');
            const flipbook = document.getElementById('flipbook');
            
            // Show flipbook wrapper
            flipbookWrapper.style.display = 'block';
            
            // Create data URL
            const pdfUrl = `data:application/pdf;base64,${pdfData}`;
            
            // Initialize PDF.js
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
            
            // Load PDF document
            pdfjsLib.getDocument({url: pdfUrl}).promise.then(function(pdf) {
                console.log('PDF loaded with ' + pdf.numPages + ' pages');
                
                // Clear flipbook
                flipbook.innerHTML = '';
                
                // Create pages
                const pagePromises = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(renderPage(pdf, i));
                }
                
                Promise.all(pagePromises).then(function(pages) {
                    pages.forEach(function(page) {
                        flipbook.appendChild(page);
                    });
                    
                    // Initialize Turn.js
                    $(flipbook).turn({
                        width: flipbookWrapper.offsetWidth * 0.9,
                        height: 500,
                        autoCenter: true,
                        display: 'single',
                        acceleration: true,
                        gradients: true,
                        elevation: 50
                    });
                    
                    // Setup navigation
                    document.getElementById('prev-page-btn').addEventListener('click', function() {
                        $(flipbook).turn('previous');
                    });
                    
                    document.getElementById('next-page-btn').addEventListener('click', function() {
                        $(flipbook).turn('next');
                    });
                    
                    // Show flipbook
                    flipbook.style.display = 'block';
                });
            });
        }
        
        // Function to render PDF page
        function renderPage(pdf, pageNumber) {
            return pdf.getPage(pageNumber).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({scale: scale});
                
                // Create canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Create page div
                const pageDiv = document.createElement('div');
                pageDiv.className = 'page';
                pageDiv.appendChild(canvas);
                
                // Render PDF page
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                
                return page.render(renderContext).promise.then(function() {
                    return pageDiv;
                });
            });
        }
        
        // Function to display image
        function displayImage(imageData, fileType) {
            const imgPreview = document.getElementById('file-image');
            
            // Create data URL
            const imgUrl = `data:image/${fileType};base64,${imageData}`;
            
            // Set image source
            imgPreview.src = imgUrl;
            imgPreview.style.display = 'block';
            
            // Setup zoom buttons
            let currentZoom = 1;
            document.getElementById('zoom-in-button').addEventListener('click', function() {
                currentZoom += 0.2;
                imgPreview.style.transform = `scale(${currentZoom})`;
            });
            
            document.getElementById('zoom-out-button').addEventListener('click', function() {
                if (currentZoom > 0.5) {
                    currentZoom -= 0.2;
                    imgPreview.style.transform = `scale(${currentZoom})`;
                }
            });
        }
        
        // Make the category image map available to JavaScript
        window.categoryImageMap = <?php echo json_encode($category_image_map); ?>;
    </script>
    
    <style>
        /* Portfolio Page Styles */
        #portfolios {
            padding: 120px 0 60px;
            background-color: #f8f9fa;
            min-height: 80vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .portfolio-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .portfolio-header h2 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            position: relative;
            display: inline-block;
        }
        
        .portfolio-header h2::after {
            content: '';
            position: absolute;
            width: 50%;
            height: 3px;
            background: #000000c9;
            bottom: -10px;
            left: 25%;
        }
        
        #category-filter-info {
            font-size: 1.1rem;
            color: #666;
            margin-top: 20px;
        }
        
        .portfolio-filters {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .filter-button {
            padding: 8px 16px;
            background-color: #f1f1f1;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .filter-button.active {
            background-color: #000000c9;
            color: white;
        }
        
        .filter-dropdown {
            position: relative;
            display: inline-block;
        }
        
        .filter-dropdown-btn {
            padding: 8px 16px;
            background-color: #f1f1f1;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 180px;
            justify-content: space-between;
        }
        
        .filter-dropdown-btn.active {
            background-color: #000000c9;
            color: white;
        }
        
        .filter-dropdown-content {
            display: none;
            position: absolute;
            background-color: white;
            min-width: 220px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            z-index: 1;
            border-radius: 8px;
            padding: 8px 0;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .filter-dropdown-content.show {
            display: block;
        }
        
        .filter-item {
            display: block;
            width: 100%;
            padding: 8px 16px;
            text-align: left;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .filter-item:hover {
            background-color: #f8f9fa;
        }
        
        .filter-item.active {
            background-color: #f1f1f1;
            font-weight: 500;
        }
        
        .portfolio-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 30px;
            min-height: 200px;
        }
        
        .portfolio-item {
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease forwards;
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .portfolio-item:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .portfolio-image {
            height: 250px;
            background-size: cover;
            background-position: center;
            position: relative;
        }
        
        .portfolio-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .portfolio-image:hover .portfolio-overlay {
            opacity: 1;
        }
        
        .portfolio-overlay h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .portfolio-overlay p {
            margin-bottom: 20px;
            font-size: 1rem;
        }
        
        .portfolio-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .view-project-btn, .view-file-btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: white;
            color: #333;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .view-project-btn:hover, .view-file-btn:hover {
            background-color: #f0f0f0;
            transform: translateY(-2px);
        }
        
        .view-file-btn {
            background-color: #e1ecf4;
            color: #2c5777;
        }
        
        .view-file-btn:hover {
            background-color: #d1e1f0;
        }
        
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            grid-column: 1 / -1;
            color: #666;
        }
        
        .loading-spinner i {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #000000c9;
        }
        
        .no-projects {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 150px;
            color: #666;
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            border: 2px dashed #ddd;
            text-align: center;
            margin: 20px auto 30px;
            max-width: 600px;
        }
        
        .no-projects i {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #ddd;
        }
        
        .no-projects h3 {
            margin: 10px 0;
            font-size: 1.4rem;
        }
        
        .no-projects p {
            margin: 5px 0 0;
            font-size: 1rem;
        }
        
        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: rgba(0,0,0,0.7);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background-color: #fff;
            width: 80%;
            max-width: 800px;
            height: 80vh;
            margin: 5vh auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-header {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.25rem;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #888;
            transition: color 0.3s;
        }
        
        .close-modal:hover {
            color: #333;
        }
        
        .modal-body {
            flex: 1;
            padding: 20px;
            overflow: auto;
            position: relative;
        }
        
        .file-info-bar {
            padding: 10px 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        
        .file-type-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #007bff;
            color: white;
            border-radius: 5px;
            font-weight: bold;
            font-size: 0.8rem;
            margin-right: 15px;
        }
        
        #file-viewer-container {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        #file-image {
            max-width: 100%;
            max-height: 60vh;
            object-fit: contain;
            transition: transform 0.3s ease;
        }
        
        #file-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        #file-unsupported {
            text-align: center;
            padding: 30px;
            color: #666;
        }
        
        #file-unsupported i {
            font-size: 3rem;
            margin-bottom: 15px;
            color: #ddd;
        }
        
        .file-actions {
            padding: 15px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid #eee;
        }
        
        .file-action-button {
            padding: 8px 15px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
            color: #333;
            text-decoration: none;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
        }
        
        .file-action-button:hover {
            background-color: #f1f1f1;
        }
        
        #flipbook-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        #flipbook {
            width: 100%;
            height: 100%;
        }
        
        #flipbook .page {
            background-color: white;
        }
        
        .flipbook-nav {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            transform: translateY(-50%);
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            pointer-events: none;
            z-index: 10;
        }
        
        .flipbook-nav button {
            width: 40px;
            height: 40px;
            background-color: rgba(0,0,0,0.6);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            transition: background-color 0.3s;
        }
        
        .flipbook-nav button:hover {
            background-color: rgba(0,0,0,0.8);
        }
        
        .modal-loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: rgba(255,255,255,0.8);
            z-index: 5;
        }
        
        @media (max-width: 768px) {
            .portfolio-grid {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
            
            .modal-content {
                width: 95%;
                height: 90vh;
                margin: 5vh auto;
            }
        }
    </style>
</body>
</html> 