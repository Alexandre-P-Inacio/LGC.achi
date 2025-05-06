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
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net https://*.azureedge.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self';">
    <title>Architecture Portfolio</title>
    <link rel="icon" type="image/png" href="assets/LGC LOGO.png">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="client-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Load scripts -->
    <script src="animation.js" defer></script>
    <!-- Removed navigation.js as it conflicts with PHP navigation -->
    <!-- <script src="navigation.js"></script> -->
    <script src="client-dashboard.js" defer></script>
    
    <style>

        
        /* Fix hero section spacing to avoid overlap with fixed navbar */
        #hero {
            padding-top: 100px; /* Add padding to push content down below the navbar */
            margin-top: 0;
        }
        
        /* Enhanced Featured Projects Styles */
        #projects {
            padding: 5rem 0;
            background-color: #f8f9fa;
        }
        
        #projects h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            position: relative;
            color: #333;
        }
        
        #projects h2:after {
            content: '';
            display: block;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, #333, #828282);
            margin: 15px auto 0;
            border-radius: 2px;
        }
        
        /* Carousel Layout */
        .projects-container {
            position: relative;
            max-width: 1320px; /* Exact width for 3 cards: 3 x 400px + 2 x 32px gaps + padding */
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            overflow: visible;
        }
        
        .project-carousel-wrapper {
            width: 100%;
            overflow: hidden;
            position: relative;
            scroll-behavior: smooth;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
            cursor: grab;
            mask-image: linear-gradient(to right, transparent 0%, black 0%, black 100%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 0%, black 100%, transparent 100%);
        }
        
        /* Hide scrollbar */
        .project-carousel-wrapper::-webkit-scrollbar {
            display: none;
        }
        
        .project-carousel {
            display: flex;
            gap: 2rem;
            padding: 1rem 0.5rem;
            min-width: max-content;
            justify-content: flex-start;
            margin: 0 auto;
        }
        
        /* Add initial padding to center the first 3 cards */
        @media (min-width: 1200px) {
            .project-carousel-wrapper {
                overflow: hidden;
                padding: 0;
            }
            
            .project-carousel {
                justify-content: center;
            }
        }
        
        /* Scroll Buttons */
        .scroll-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: white;
            color: #333;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 10;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            opacity: 0.9;
        }
        
        .scroll-btn:hover {
            background-color: #333;
            color: white;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
            opacity: 1;
        }
        
        .scroll-btn:focus {
            outline: none;
        }
        
        .scroll-left {
            left: -25px;
        }
        
        .scroll-right {
            right: -25px;
        }
        
        /* Hide scroll buttons when not needed */
        .scroll-btn.hidden {
            display: none;
        }
        
        /* Project Card */
        .project-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            flex: 0 0 auto;
            width: 400px; /* Fixed width for all cards */
            min-width: 350px;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            margin-right: 0;
        }
        
        .project-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .project-image {
            height: 240px;
            background-size: cover;
            background-position: center;
            position: relative;
            overflow: hidden;
        }
        
        .project-image::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.4));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .project-card:hover .project-image::before {
            opacity: 1;
        }
        
        .project-card h3 {
            font-size: 1.4rem;
            margin: 1.5rem 1.5rem 0.5rem;
            color: #333;
            font-weight: 600;
        }
        
        .project-card p {
            color: #666;
            margin: 0 1.5rem 1.5rem;
            font-size: 1rem;
        }
        
        .view-project-btn {
            margin: auto 1.5rem 1.5rem;
            padding: 0.8rem 1.5rem;
            background-color: #333;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            text-align: center;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            display: block;
        }
        
        .view-project-btn:hover {
            background-color: #000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .no-projects, .error-message {
            width: 100%;
            text-align: center;
            padding: 3rem;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            color: #666;
            font-size: 1.1rem;
        }
        
        .error-message i {
            color: #dc3545;
            font-size: 2rem;
            margin-bottom: 1rem;
            display: block;
        }
        
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            width: 100%;
        }
        
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1.5rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Make the layout responsive */
        @media (max-width: 1200px) {
            .projects-container {
                max-width: 800px; /* Width for 2 cards on tablets */
            }
            
            .project-card {
                width: 360px;
            }
        }
        
        @media (max-width: 768px) {
            #projects {
                padding: 3rem 0;
            }
            
            #projects h2 {
                font-size: 2rem;
                margin-bottom: 2rem;
            }
            
            .projects-container {
                padding: 0 1rem;
                max-width: 400px; /* Width for 1 card on mobile */
            }
            
            .project-carousel {
                gap: 1.5rem;
            }
            
            .project-card {
                width: 360px;
                min-width: 280px;
            }
            
            .project-image {
                height: 200px;
            }
            
            .project-card h3 {
                font-size: 1.2rem;
                margin: 1.2rem 1.2rem 0.4rem;
            }
            
            .project-card p {
                margin: 0 1.2rem 1.2rem;
                font-size: 0.9rem;
            }
            
            .view-project-btn {
                margin: auto 1.2rem 1.2rem;
                padding: 0.7rem 1.2rem;
                font-size: 0.8rem;
            }
            
            .scroll-btn {
                width: 40px;
                height: 40px;
                font-size: 1rem;
            }
            
            .scroll-left {
                left: 5px;
            }
            
            .scroll-right {
                right: 5px;
            }
        }
    </style>
</head>
<body>
    <header>
        <?php include_once 'navigation.php'; ?>
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
                                    } else {
                                        // It's binary data, create a data URL
                                        $image_url = 'data:image/jpeg;base64,' . base64_encode($project['image_data']);
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
                                    <div class="project-image" style="background-image: url('<?php echo htmlspecialchars($image_url); ?>')"></div>
                                    <h3><?php echo htmlspecialchars($project['name'] ?? 'Unnamed Project'); ?></h3>
                                    <?php if ($show_category): ?>
                                        <p><?php echo htmlspecialchars($category_display); ?></p>
                                    <?php endif; ?>
                                    <a href="portfolios.php?project=<?php echo htmlspecialchars($project['id']); ?>" class="view-project-btn">
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

        <section id="about">
            <div class="about-content">
                <h2>About Us</h2>
                <p>LLGC ingegneria architettura was founded in 2009. The collaboration between different professional skills through integrated design between engineering and architecture has become a point of strength and distinction over time. An approach aimed at understanding the needs of the interlocutor by evaluating the different peculiarities of each client, with a view to research and innovation in the sector. LGC ia has gained multiple experiences in the field of building, industrial, interior design, exhibit, structural, plant design, following each project in the different study phases, from preliminary design also through 3D graphic modeling, obtaining authorization titles, up to the construction phase with particular attention to work management and safety. LGC has also developed its specialization in the sector of infrastructures for radio telecommunications networks, providing its engineering and architecture services to the main national operators. LGC ia over the years has become a design partner of Italian and foreign multinational companies.</p>
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
    
    <script>
        // Check login status when loading the page
        document.addEventListener('DOMContentLoaded', function() {
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
            
            // Implement drag-to-scroll functionality
            let isDown = false;
            let startX;
            let scrollLeft;
            
            // Mouse events for desktop
            carouselWrapper.addEventListener('mousedown', (e) => {
                isDown = true;
                carouselWrapper.style.cursor = 'grabbing';
                startX = e.pageX - carouselWrapper.offsetLeft;
                scrollLeft = carouselWrapper.scrollLeft;
                e.preventDefault();
            });
            
            carouselWrapper.addEventListener('mouseleave', () => {
                isDown = false;
                carouselWrapper.style.cursor = 'grab';
            });
            
            carouselWrapper.addEventListener('mouseup', () => {
                isDown = false;
                carouselWrapper.style.cursor = 'grab';
            });
            
            carouselWrapper.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - carouselWrapper.offsetLeft;
                const walk = (x - startX) * 2; // Scroll speed multiplier
                carouselWrapper.scrollLeft = scrollLeft - walk;
            });
            
            // Touch events for mobile
            carouselWrapper.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - carouselWrapper.offsetLeft;
                scrollLeft = carouselWrapper.scrollLeft;
            });
            
            carouselWrapper.addEventListener('touchend', () => {
                isDown = false;
            });
            
            carouselWrapper.addEventListener('touchcancel', () => {
                isDown = false;
            });
            
            carouselWrapper.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                const x = e.touches[0].pageX - carouselWrapper.offsetLeft;
                const walk = (x - startX) * 2;
                carouselWrapper.scrollLeft = scrollLeft - walk;
                e.preventDefault(); // Prevent page scroll
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
    </script>
</body>
</html> 