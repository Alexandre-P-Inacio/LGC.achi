<?php
// This file can be included in all PHP files to provide a consistent navigation
// Get the current page filename to highlight active links
$current_page = basename($_SERVER['PHP_SELF']);

// Get currently logged in user from session
$current_user = isset($_SESSION['username']) ? $_SESSION['username'] : null;
$is_admin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;

// Check if we're on the home page
$is_home_page = ($current_page === 'index.php');
$is_portfolios_page = ($current_page === 'portfolios.php');
$is_contact_page = ($current_page === 'contact.php');
$is_about_section = isset($_GET['section']) && $_GET['section'] === 'about';

// Session should be already started before including this file
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Function to determine if current page is active
function isCurrentPage($pageName) {
    $currentPage = basename($_SERVER['PHP_SELF']);
    return ($currentPage == $pageName) ? 'active' : '';
}

// Check if user is logged in
$isLoggedIn = isset($_SESSION['username']);
$isAdmin = false;

// Check if the user is an admin if logged in
if ($isLoggedIn) {
    // Use the session variable directly instead of calling the function
    $isAdmin = isset($_SESSION['is_admin']) ? $_SESSION['is_admin'] : false;
}

$username = $isLoggedIn ? $_SESSION['username'] : '';
?>

<header>
    <nav>
        <a href="index.php" class="logo">
            <img src="assets/LGC LOGO.png" alt="LGC Logo" class="logo-image">
        </a>
        <div class="hamburger-menu">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
        </div>
        <ul class="nav-links">
            <li><a href="index.php" id="nav-home" class="<?php echo isCurrentPage('index.php'); ?>">Home</a></li>
            <li><a href="portfolios.php" id="nav-portfolios" class="<?php echo isCurrentPage('portfolios.php'); ?>">Portfolios</a></li>
            <li><a href="index.php#about" id="nav-about" class="<?php echo strpos($_SERVER['REQUEST_URI'], '#about') !== false ? 'active' : ''; ?>">About</a></li>
            <li><a href="contact.php" id="nav-contact" class="<?php echo isCurrentPage('contact.php'); ?>">Contact</a></li>
            <?php if (!$isLoggedIn): ?>
                <li class="auth-buttons">
                    <a href="login.php" class="login-button">Sign In</a>
                    <a href="register.php" class="register-button">Register</a>
                </li>
            <?php else: ?>
                <li class="user-display">
                    <span>Hello, <?php echo htmlspecialchars($username); ?></span> | 
                    <?php if ($isAdmin): ?>
                        <a href="admin.php">Admin Dashboard</a>
                    <?php else: ?>
                        <a href="#client-dashboard" id="nav-dashboard">My Dashboard</a>
                    <?php endif; ?> | 
                    <a href="logout.php" id="logout-link">Logout</a>
                </li>
            <?php endif; ?>
        </ul>
    </nav>
</header>
<div class="menu-backdrop"></div>

<script>
    // Toggle mobile menu
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const backdrop = document.querySelector('.menu-backdrop');
    
    if (hamburger) {
        // Ensure consistent hamburger menu styling across all pages
        const setHamburgerState = (isActive) => {
            if (isActive) {
                hamburger.classList.add('active');
                navLinks.classList.add('active');
                backdrop.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        };
        
        hamburger.addEventListener('click', function() {
            const isActive = !navLinks.classList.contains('active');
            setHamburgerState(isActive);
        });
        
        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                setHamburgerState(false);
            });
        });
        
        // Close menu when clicking on backdrop
        backdrop.addEventListener('click', function() {
            setHamburgerState(false);
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                setHamburgerState(false);
            }
        });
    }
    
    // Add smooth scrolling for the About link when on home page
    const aboutLink = document.getElementById('nav-about');
    if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            // Only do smooth scroll if we're already on the home page
            const isHomePage = window.location.pathname.endsWith('index.php') || 
                              window.location.pathname.endsWith('/');
            
            if (isHomePage) {
                e.preventDefault();
                const aboutSection = document.getElementById('about');
                
                if (aboutSection) {
                    aboutSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without refresh
                    history.pushState(null, '', '#about');
                }
            }
        });
    }
    
    // Set up client dashboard functionality
    const dashboardLink = document.getElementById('nav-dashboard');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof showDashboard === 'function') {
                showDashboard();
            }
            return false;
        });
    }
</script> 