// Script que insere automaticamente a mesma barra de navegação em todas as páginas HTML
document.addEventListener('DOMContentLoaded', function() {
    // Navigation bar structure (upperbar)
    const navHTML = `
    <header>
        <nav>
            <div class="logo">ARCHITECT</div>
            <ul class="nav-links">
                <li><a href="index.html" id="nav-home">Home</a></li>
                <li><a href="portfolios.html" id="nav-portfolios">Portfólios</a></li>
                <li><a href="chat.html" id="nav-chat">Chat</a></li>
                <li><a href="#about" id="nav-about">About</a></li>
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
    } else if (currentPage === 'portfolios.html') {
        document.getElementById('nav-portfolios')?.classList.add('active');
    } else if (currentPage === 'chat.html') {
        document.getElementById('nav-chat')?.classList.add('active');
    } else if (currentPage === 'contact.html') {
        document.getElementById('nav-contact')?.classList.add('active');
    } else if (currentPage.includes('about')) {
        document.getElementById('nav-about')?.classList.add('active');
    }
 
    // Check if user is logged in (integration with existing authentication system)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // Hide the authentication buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'none';
        }
       
        // Show username and logout link
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const userElement = document.createElement('li');
            userElement.id = 'user-display';
            userElement.className = 'user-display';
            userElement.innerHTML = `<span>Hello, ${currentUser}</span> | <a href="#" id="logout-link">Logout</a>`;
            navLinks.appendChild(userElement);
           
            // Add logout event
            document.getElementById('logout-link').addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
    }

    // Add a chat link to the navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Find the About link
        const aboutLink = document.getElementById('nav-about');
        if (aboutLink) {
            // Create a new li element for the chat link
            const chatLi = document.createElement('li');
            const chatLink = document.createElement('a');
            chatLink.href = 'chat.html';
            chatLink.id = 'nav-chat';
            chatLink.textContent = 'Chat';
            
            // Add the link to the li
            chatLi.appendChild(chatLink);
            
            // Insert before the About link
            navLinks.insertBefore(chatLi, aboutLink.parentNode);
            
            // Mark as active if on chat page
            if (window.location.pathname.includes('chat.html')) {
                chatLink.classList.add('active');
            }
        }
    }
});