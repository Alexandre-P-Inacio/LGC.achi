<?php
// Start the session
session_start();

// Include database configuration
require_once 'config.php';

// Functions to fetch data from the database

/**
 * Get featured projects from the database
 * 
 * @return array Array of featured projects
 */
function getFeaturedProjects($conn) {
    $projects = [];
    
    $query = "SELECT * FROM projects WHERE is_featured = 1 ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
    }
    
    return $projects;
}

/**
 * Check if a user has unread notifications
 * 
 * @param string $username Username to check notifications for
 * @return bool True if there are unread notifications
 */
function hasUnreadNotifications($conn, $username) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE recipient_username = ? AND `read` = 0");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    return ($row['count'] > 0);
}

// Get currently logged in user
$current_user = isset($_SESSION['username']) ? $_SESSION['username'] : null;
$is_admin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;

// Handle logout
if (isset($_GET['logout'])) {
    // Clear all session variables
    $_SESSION = [];
    
    // Destroy the session
    session_destroy();
    
    // Redirect to home page
    header("Location: index.php");
    exit;
}

// Get featured projects
$featured_projects = getFeaturedProjects($conn);

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

// Default featured project images for fallback
$featured_images = [
    'assets/Featured Project 1.png',
    'assets/Featured Project 2.png',
    'assets/Featured Project 3.png'
];
?>
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/LGC LOGO.png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="client-dashboard.css">
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
    
    <!-- Load scripts -->
    <script src="animation.js" defer></script>
    <script src="client-dashboard.js" defer></script>
    
    <style>
        /* Fixed Chat Button Styles */
        .fixed-chat-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background-color: #0a66c2;
            color: white;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            z-index: 99;
            transition: all 0.3s ease;
        }
        
        .fixed-chat-button:hover {
            transform: scale(1.05);
            background-color: #094d8f;
        }
        
        .fixed-chat-button i {
            font-size: 24px;
        }
        
        .fixed-chat-button {
            transition: transform 0.3s ease, background-color 0.3s ease;
            position: relative;
        }
        
        .fixed-chat-button i {
            transform: scale(1);
            transition: transform 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .fixed-chat-button {
                width: 65px;
                height: 65px;
                bottom: 20px;
                right: 20px;
            }
            
            .fixed-chat-button i {
                font-size: 26px;
            }
        }
    </style>
</head>
<body>
    <header>
        <?php include 'navigation.php'; ?>
    </header>
    
    <main>
        <section id="hero">
            <div class="hero-slideshow" id="hero-slideshow">
                <div class="hero-slide active"></div>
                <div class="hero-slide"></div>
                <div class="hero-slide"></div>
                <div class="hero-slide"></div>
                <div class="hero-slide"></div>
                <div class="hero-slide"></div>
            </div>
            <div class="slideshow-dots">
                <div class="slideshow-dot active" data-slide="0"></div>
                <div class="slideshow-dot" data-slide="1"></div>
                <div class="slideshow-dot" data-slide="2"></div>
                <div class="slideshow-dot" data-slide="3"></div>
                <div class="slideshow-dot" data-slide="4"></div>
                <div class="slideshow-dot" data-slide="5"></div>
            </div>
            <div class="hero-content">
                <h1>Architecture Portfolio</h1>
            </div>
        </section>

        <section id="projects">
            <h2>Featured Projects</h2>
            <div class="projects-container">
                <button class="scroll-btn scroll-left" id="scroll-left">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="project-carousel-wrapper">
                    <div class="project-carousel" id="featured-projects-container">
                        <?php if (empty($featured_projects)): ?>
                            <p class="no-projects">No featured projects available at the moment.</p>
                        <?php else: ?>
                            <?php foreach ($featured_projects as $index => $project): ?>
                                <?php
                                // Format category name for display
                                $category_display = 'Uncategorized';
                                $show_category = true;
                                
                                if (empty($project['category']) || $project['category'] === 'none') {
                                    $show_category = false;
                                } else {
                                    $category_display = ucwords(str_replace('-', ' ', $project['category']));
                                }
                                
                                // Determine which image to use
                                $image_url = '';
                                
                                // PRIORITIZE image_data column
                                if (!empty($project['image_data'])) {
                                    // Check if it's a data URL
                                    if (strpos($project['image_data'], 'data:') === 0) {
                                        $image_url = $project['image_data'];
                                    }
                                    // If it looks like a URL
                                    else if (preg_match('/^https?:\/\//i', $project['image_data'])) {
                                        $image_url = $project['image_data'];
                                    }
                                }
                                
                                // Fallback to default images if no valid image_data
                                if (empty($image_url)) {
                                    $image_url = isset($category_image_map[$project['category']]) 
                                        ? $category_image_map[$project['category']] 
                                        : $featured_images[$index % count($featured_images)];
                                }
                                ?>
                                <div class="project-card">
                                    <div class="project-image" style="height: 240px; position: relative; overflow: hidden; background-color: #f5f5f5;">
                                        <img src="<?php echo htmlspecialchars($image_url); ?>" 
                                            alt="<?php echo htmlspecialchars($project['name'] ?? 'Project Image'); ?>" 
                                            onerror="this.onerror=null; this.src='<?php echo htmlspecialchars($category_image_map[$project['category']] ?? $featured_images[$index % count($featured_images)]); ?>';"
                                            style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;">
                                    </div>
                                    <h3><?php echo htmlspecialchars($project['name'] ?? 'Unnamed Project'); ?></h3>
                                    <?php if ($show_category): ?>
                                        <p><?php echo htmlspecialchars($category_display); ?></p>
                                    <?php endif; ?>
                                    <a href="javascript:void(0)" class="view-project-btn" 
                                       data-file-url="<?php echo htmlspecialchars($project['file_url'] ?? ''); ?>" 
                                       data-project-id="<?php echo htmlspecialchars($project['id']); ?>" 
                                       data-file-name="<?php echo htmlspecialchars(basename($project['file_url'] ?? '')); ?>">
                                        View Project
                                    </a>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
                <button class="scroll-btn scroll-right" id="scroll-right">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </section>

        <section id="about" class="about">
            <div class="about-content">
                <h2>About Us</h2>
                <div class="about-text">
                    <!-- Desktop paragraph (single paragraph for PC view) -->
                    <p class="desktop-paragraph">
                        LLGC ingegneria architettura was founded in 2009. The collaboration between different professional skills through integrated design between engineering and architecture has become a point of strength and distinction over time. An approach aimed at understanding the needs of the interlocutor by evaluating the different peculiarities of each client, with a view to research and innovation in the sector. LGC ia has gained multiple experiences in the field of building, industrial, interior design, exhibit, structural, plant design, following each project in the different study phases, from preliminary design also through 3D graphic modeling, obtaining authorization titles, up to the construction phase with particular attention to work management and safety. LGC has also developed its specialization in the sector of infrastructures for radio telecommunications networks, providing its engineering and architecture services to the main national operators. LGC ia over the years has become a design partner of Italian and foreign multinational companies.
                    </p>
                    
                    <!-- Mobile paragraphs (multiple paragraphs for mobile view) -->
                    <div class="about-text-content">
                        <p class="mobile-paragraph">LLGC ingegneria architettura was founded in 2009. The collaboration between different professional skills through integrated design between engineering and architecture has become a point of strength and distinction over time.</p>
                        
                        <p class="mobile-paragraph">An approach aimed at understanding the needs of the interlocutor by evaluating the different peculiarities of each client, with a view to research and innovation in the sector.</p>
                        
                        <p class="mobile-paragraph collapsible-content">LGC ia has gained multiple experiences in the field of building, industrial, interior design, exhibit, structural, plant design, following each project in the different study phases, from preliminary design also through 3D graphic modeling, obtaining authorization titles, up to the construction phase with particular attention to work management and safety.</p>
                        
                        <p class="mobile-paragraph collapsible-content">LGC has also developed its specialization in the sector of infrastructures for radio telecommunications networks, providing its engineering and architecture services to the main national operators.</p>
                        
                        <p class="mobile-paragraph collapsible-content">LGC ia over the years has become a design partner of Italian and foreign multinational companies.</p>
                    </div>
                    <button id="about-toggle-btn" class="about-toggle-btn">
                        <span class="show-more-text">Show More</span>
                        <span class="show-less-text">Show Less</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </section>
    </main>

    <!-- Client Dashboard Popup -->
    <div id="client-dashboard-overlay" class="dashboard-overlay">
        <div class="dashboard-popup">
            <div class="dashboard-popup-header">
                <h2>Practices</h2>
                <button class="close-dashboard" onclick="closeDashboard()"><i class="fas fa-times"></i></button>
            </div>
            <div class="dashboard-popup-content">
                <p>Select a practice area below</p>
                <div class="category-grid">
                    <!-- RF Telecommunications -->
                    <div class="category-card" data-category="rf-telecommunications">
                        <div class="category-overlay">
                            <h3>RF & Telecommunications</h3>
                        </div>
                    </div>
                    
                    <!-- Energy -->
                    <div class="category-card" data-category="energy">
                        <div class="category-overlay">
                            <h3>Energy</h3>
                        </div>
                    </div>
                    
                    <!-- Construction -->
                    <div class="category-card" data-category="construction">
                        <div class="category-overlay">
                            <h3>Construction</h3>
                        </div>
                    </div>
                    
                    <!-- Bank Insurance Office -->
                    <div class="category-card" data-category="banking">
                        <div class="category-overlay">
                            <h3>Banking & Finance</h3>
                        </div>
                    </div>
                    
                    <!-- Sand -->
                    <div class="category-card" data-category="sand">
                        <div class="category-overlay">
                            <h3>Stand</h3>
                        </div>
                    </div>
                    
                    <!-- Oil & Gas -->
                    <div class="category-card" data-category="oil-gas">
                        <div class="category-overlay">
                            <h3>Oil & Gas</h3>
                        </div>
                    </div>
                    
                    <!-- Real Estate -->
                    <div class="category-card" data-category="real-estate">
                        <div class="category-overlay">
                            <h3>Real Estate</h3>
                        </div>
                    </div>
                    
                    <!-- Nuclear -->
                    <div class="category-card" data-category="nuclear">
                        <div class="category-overlay">
                            <h3>Nuclear</h3>
                        </div>
                    </div>
                    
                    <!-- Industrial -->
                    <div class="category-card" data-category="industrial">
                        <div class="category-overlay">
                            <h3>Industrial</h3>
                        </div>
                    </div>
                    
                    <!-- Naval -->
                    <div class="category-card" data-category="naval">
                        <div class="category-overlay">
                            <h3>Naval</h3>
                        </div>
                    </div>
                    
                    <!-- BPO -->
                    <div class="category-card" data-category="bpo">
                        <div class="category-overlay">
                            <h3>GDO</h3>
                        </div>
                    </div>
                    
                    <!-- Automotive -->
                    <div class="category-card" data-category="automotive">
                        <div class="category-overlay">
                            <h3>Automotive</h3>
                        </div>
                    </div>
                    
                    <!-- Aerospace -->
                    <div class="category-card" data-category="aerospace">
                        <div class="category-overlay">
                            <h3>Aerospace</h3>
                        </div>
                    </div>
                    
                    <!-- Chemistry-Pharmaceutical -->
                    <div class="category-card" data-category="chemistry-pharmaceutical">
                        <div class="category-overlay">
                            <h3>Chemistry & Pharmaceutical</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
                    
                    <!-- Video preview element -->
                    <div id="video-wrapper" style="display: none;">
                        <video id="video-player" controls width="100%">
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-controls">
                            <a id="video-download-button" href="#" class="video-control-button" download title="Download Video">
                                <i class="fas fa-download"></i>
                            </a>
                            <button id="video-fullscreen-button" class="video-control-button" title="Fullscreen">
                                <i class="fas fa-expand"></i>
                            </button>
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
                        <p>Loading file....</p>
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
        // About section show more/less button functionality
        document.addEventListener('DOMContentLoaded', function() {
            const toggleBtn = document.getElementById('about-toggle-btn');
            const aboutText = document.querySelector('.about-text');
            
            if (toggleBtn && aboutText) {
                toggleBtn.addEventListener('click', function() {
                    aboutText.classList.toggle('expanded');
                });
            }
            
            // Initialize carousel functionality
            initCarousel();
        });
        
        // Initialize carousel functionality
        function initCarousel() {
            const carouselWrapper = document.querySelector('.project-carousel-wrapper');
            const carousel = document.getElementById('featured-projects-container');
            const leftBtn = document.getElementById('scroll-left');
            const rightBtn = document.getElementById('scroll-right');
            
            if (!carousel || !carouselWrapper || !leftBtn || !rightBtn) return;
            
            const cards = carousel.querySelectorAll('.project-card');
            
            // If we have 3 or fewer cards, hide navigation buttons
            if (cards.length <= 3) {
                leftBtn.classList.add('hidden');
                rightBtn.classList.add('hidden');
                return;
            }
            
            // Show navigation buttons
            leftBtn.classList.remove('hidden');
            rightBtn.classList.remove('hidden');
            
            // Center the carousel to show exactly 3 cards
            const containerWidth = carouselWrapper.clientWidth;
            const cardWidth = cards[0].offsetWidth;
            const gap = 32; // 2rem gap
            const scrollAmount = cardWidth + gap;
            
            // Ensure scroll snapping to cards
            carouselWrapper.style.scrollSnapType = 'x mandatory';
            cards.forEach(card => {
                card.style.scrollSnapAlign = 'center';
            });
            
            // Disable left button initially (we're showing the first 3 cards)
            leftBtn.disabled = true;
            leftBtn.style.opacity = '0.5';
            
            // Scroll left/right with buttons - scroll exactly one card
            leftBtn.addEventListener('click', () => {
                carouselWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            
            rightBtn.addEventListener('click', () => {
                carouselWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
            
            // Update button states on scroll
            carouselWrapper.addEventListener('scroll', () => {
                const scrollPosition = carouselWrapper.scrollLeft;
                const maxScroll = carouselWrapper.scrollWidth - carouselWrapper.clientWidth;
                
                // Enable/disable buttons based on scroll position
                leftBtn.disabled = scrollPosition <= 0;
                leftBtn.style.opacity = scrollPosition <= 0 ? '0.5' : '0.9';
                
                rightBtn.disabled = scrollPosition >= maxScroll;
                rightBtn.style.opacity = scrollPosition >= maxScroll ? '0.5' : '0.9';
            });
        }
        
        // File viewer functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listeners to the "View Project" buttons
            document.querySelectorAll('.view-project-btn').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const fileUrl = this.getAttribute('data-file-url');
                    const fileName = this.getAttribute('data-file-name');
                    const projectId = this.getAttribute('data-project-id');
                    
                    if (fileUrl) {
                        // Show file directly in modal
                        showFileInModal(fileUrl, fileName);
                    } else {
                        // Fallback to the portfolios page if no file is available
                        window.location.href = `portfolios.php?project=${projectId}`;
                    }
                });
            });
            
            // Initialize file viewer
            initFileViewer();
        });
        
        // These functions are from the original HTML but are needed for basic functionality
        // The file modal window functionality is kept as JavaScript
    </script>
</body>
</html> 