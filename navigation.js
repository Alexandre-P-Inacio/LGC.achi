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
 
    // Mark the active link in navigation based on current URL
    const currentPage = window.location.pathname.split('/').pop();
   
    // Remove the 'active' class from all links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
   
    // Add the 'active' class to the link corresponding to the current page
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
    } else if (currentPage === 'chat.html') {
        document.getElementById('nav-chat')?.classList.add('active');
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
            
            // Different menu options based on user role
            let userMenu = '';
            
            // Force admin menu if username is 'admin'
            if (isAdmin || currentUser === 'admin') {
                console.log('Building admin menu');
                localStorage.setItem('isAdmin', 'true'); // Ensure the flag is properly set
                userMenu = `
                    <div class="user-greeting"><span>Hello, ${currentUser}</span></div>
                    <div class="user-nav-links">
                        <a href="admin.html" class="admin-link">Admin Dashboard</a>
                    </div>
                    <a href="#" id="logout-link" class="logout-link">Logout</a>
                `;
            } else {
                console.log('Building regular user menu');
                userMenu = `
                    <div class="user-greeting"><span>Hello, ${currentUser}</span></div>
                    <div class="user-nav-links">
                        <a href="#client-dashboard" id="nav-dashboard" class="dashboard-link" onclick="showDashboard(); return false;">My Dashboard</a>
                    </div>
                    <a href="#" id="logout-link" class="logout-link">Logout</a>
                `;
            }
            
            userElement.innerHTML = userMenu;
            navLinks.appendChild(userElement);
           
            // Add logout event
            document.getElementById('logout-link').addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdmin');
                window.location.reload();
            });
            
            // Check for unread messages
            checkUnreadMessages();
            
            // Set up periodic check for unread messages
            setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
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
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            backdrop.classList.toggle('active');
            
            // Disable body scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking on backdrop
        backdrop.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// Function to check for unread messages
async function checkUnreadMessages() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    try {
        // Check if Supabase is available as a global object
        if (!window.supabase && typeof supabase !== 'undefined') {
            window.supabase = supabase;
        }
        
        // Initialize Supabase client if not already available
        if (!window.supabaseClient) {
            const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';
            
            try {
                // Check if the createClient function is available
                if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
                    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
                } else {
                    return;
                }
            } catch (e) {
                return;
            }
        }
        
        // Use the properly initialized client
        const client = window.supabaseClient;
        if (!client || typeof client.from !== 'function') {
            return;
        }
        
        // Check for unread chat messages
        const { data, error, count } = await client
            .from('chat_messages')
            .select('*', { count: 'exact' })
            .eq('receiver', currentUser)
            .eq('read', false);
            
        if (error) {
            return;
        }
        
        // Get the notification dot element for the fixed chat button
        const notificationDot = document.getElementById('fixed-chat-notification');
        if (!notificationDot) return;
        
        // Show or hide the notification dot based on unread messages
        if (data && data.length > 0) {
            notificationDot.style.display = 'block';
            notificationDot.setAttribute('data-count', data.length);
        } else {
            notificationDot.style.display = 'none';
        }
        
    } catch (e) {
    }
}

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