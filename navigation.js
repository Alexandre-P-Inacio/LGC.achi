// Script that automatically inserts the same navigation bar on all HTML pages
document.addEventListener('DOMContentLoaded', function() {
    // Navigation bar structure (upperbar)
    const navHTML = `
    <header>
        <nav>
            <a href="index.html" class="logo">
                <img src="assets/LGC LOGO.png" alt="LGC Logo" class="logo-image">
            </a>
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
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
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
            
            if (isAdmin) {
                userMenu = `<span>Hello, ${currentUser}</span> | <a href="admin.html">Admin Dashboard</a> | <a href="#" id="logout-link">Logout</a>`;
            } else {
                userMenu = `<span>Hello, ${currentUser}</span> | <a href="#client-dashboard" id="nav-dashboard" onclick="showDashboard(); return false;">My Dashboard</a> | <a href="#" id="logout-link">Logout</a>`;
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
        if (!window.supabase && !window.supabaseNav) {
            const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI';
            
            try {
                window.supabaseNav = supabase.createClient(supabaseUrl, supabaseKey);
                console.log('Navigation: Created supabaseNav client');
            } catch (e) {
                console.error('Navigation: Failed to create Supabase client', e);
                return;
            }
        }
        
        const supabaseClient = window.supabase || window.supabaseNav;
        if (!supabaseClient) {
            console.error('Navigation: No Supabase client available');
            return;
        }
        
        // Check for unread chat messages
        const { data, error, count } = await supabaseClient
            .from('chat_messages')
            .select('*', { count: 'exact' })
            .eq('receiver', currentUser)
            .eq('read', false);
            
        if (error) {
            console.error('Navigation: Error checking unread messages:', error);
            return;
        }
        
        // Get the notification dot element for the fixed chat button
        const notificationDot = document.getElementById('fixed-chat-notification');
        if (!notificationDot) return;
        
        // Show or hide the notification dot based on unread messages
        if (data && data.length > 0) {
            notificationDot.style.display = 'block';
            notificationDot.setAttribute('data-count', data.length);
            console.log(`Navigation: Found ${data.length} unread messages`);
        } else {
            notificationDot.style.display = 'none';
            console.log('Navigation: No unread messages');
        }
        
    } catch (e) {
        console.error('Navigation: Exception checking unread messages:', e);
    }
}