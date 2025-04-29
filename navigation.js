// Script that automatically inserts the same navigation bar on all HTML pages
document.addEventListener('DOMContentLoaded', function() {
    // Navigation bar structure (upperbar)
    const navHTML = `
    <header>
        <nav>
            <a href="index.html" class="logo">
                <img src="assets/LGC LOGO.png" alt="LGC Logo" class="logo-image">
            </a>
            <div class="hamburger-menu">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
            </div>
            <ul class="nav-links">
                <li><a href="index.html" id="nav-home">Home</a></li>
                <li><a href="portfolios.html" id="nav-portfolios">Portfolios</a></li>
                <li><a href="index.html#about" id="nav-about">About</a></li>
                <li><a href="contact.html" id="nav-contact">Contact</a></li>
                <li class="auth-buttons">
                    <a href="login.html" class="login-button">Sign In</a>
                    <a href="register.html" class="register-button">Register</a>
                </li>
            </ul>
        </nav>
    </header>
    <div class="menu-backdrop"></div>
    `;
 
    // Check if a header tag already exists
    const existingHeader = document.querySelector('header');
   
    if (existingHeader) {
        // If header already exists, replace with the new one
        existingHeader.outerHTML = navHTML;
    } else {
        // If it doesn't exist, insert at the beginning of the body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
 
    // Set current page link as active
    const currentPage = window.location.pathname.split('/').pop();
    
    // Highlight active navigation link based on current page
    if (currentPage === '' || currentPage === 'index.html') {
        document.getElementById('nav-home')?.classList.add('active');
        
        // Check if hash is dashboard to highlight dashboard link
        if(window.location.hash === '#client-dashboard') {
            document.getElementById('nav-dashboard')?.classList.add('active');
            document.getElementById('nav-home')?.classList.remove('active');
        }
    } else if (currentPage === 'portfolios.html') {
        document.getElementById('nav-portfolios')?.classList.add('active');
    } else if (currentPage === 'contact.html') {
        document.getElementById('nav-contact')?.classList.add('active');
    } else if (currentPage.includes('about')) {
        document.getElementById('nav-about')?.classList.add('active');
    }
 
    // Check if user is logged in (integration with existing authentication system)
    const currentUser = localStorage.getItem('currentUser');
    const isAdminRaw = localStorage.getItem('isAdmin');
    const isAdmin = isAdminRaw === 'true' || isAdminRaw === true;
    
    console.log('User login status:', { currentUser, isAdmin, isAdminRaw });
    
    if (currentUser) {
        // Hide the authentication buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'none';
        }
       
        // Create user menu element
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            // Create user menu element
            const userElement = document.createElement('li');
            userElement.id = 'user-display';
            userElement.className = 'user-display';
            
            // Add the user greeting directly
            const userGreeting = document.createElement('span');
            userGreeting.textContent = `Hello, ${currentUser}`;
            userElement.appendChild(userGreeting);
            
            // Admin Dashboard link
            if (isAdmin || currentUser === 'admin') {
                localStorage.setItem('isAdmin', 'true'); // Ensure the flag is properly set
                console.log('Building admin menu');
                
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'admin-link';
                adminLink.textContent = 'Admin Dashboard';
                userElement.appendChild(adminLink);
            } else {
                console.log('Building regular user menu');
                
                const dashboardLink = document.createElement('a');
                dashboardLink.href = '#client-dashboard';
                dashboardLink.id = 'nav-dashboard';
                dashboardLink.className = 'admin-link'; // Use the same styling as admin link
                dashboardLink.textContent = 'My Dashboard';
                dashboardLink.onclick = function(e) {
                    e.preventDefault();
                    if (typeof showDashboard === 'function') {
                        showDashboard();
                    }
                    return false;
                };
                userElement.appendChild(dashboardLink);
            }
            
            // Logout link (always present)
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logout-link';
            logoutLink.className = 'logout-link';
            logoutLink.textContent = 'Logout';
            userElement.appendChild(logoutLink);
            
            // Append the complete user menu
            navLinks.appendChild(userElement);
            
            // Add logout event
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdmin');
                window.location.reload();
            });
        }
    }
    
    // Add smooth scrolling for the About link when on home page
    const aboutLink = document.getElementById('nav-about');
    if (aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            // Only do smooth scroll if we're already on the home page
            const isHomePage = currentPage === '' || currentPage === 'index.html';
            
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
            // Otherwise, default link behavior will navigate to index.html#about
        });
    }
    
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
});

// Debug helper function to set admin status
window.setAdminStatus = function(isAdmin) {
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    console.log('Admin status set to', isAdmin ? 'true' : 'false');
    console.log('Current localStorage values:', {
        currentUser: localStorage.getItem('currentUser'),
        isAdmin: localStorage.getItem('isAdmin')
    });
    console.log('Reload the page to see changes');
};