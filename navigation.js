// Script que insere automaticamente a mesma barra de navegação em todas as páginas HTML
document.addEventListener('DOMContentLoaded', function() {
    // Estrutura da barra de navegação (upperbar)
    const navHTML = `
    <header>
        <nav>
            <div class="logo">ARCHITECT</div>
            <ul class="nav-links">
                <li><a href="index.html" id="nav-home">Home</a></li>
                <li><a href="portfolios.html" id="nav-portfolios">Portfólios</a></li>
                <li><a href="chat.html" id="nav-chat">Chat</a></li>
                <li><a href="#about" id="nav-about">About</a></li>
                <li><a href="contact.html" id="nav-contact">Contactos</a></li>
                <li class="auth-buttons">
                    <a href="login.html" class="login-button">Sign In</a>
                    <a href="register.html" class="register-button">Register</a>
                </li>
            </ul>
        </nav>
    </header>
    `;
 
    // Verifica se já existe uma tag header
    const existingHeader = document.querySelector('header');
   
    if (existingHeader) {
        // Se já existir um header, substitui pelo novo
        existingHeader.outerHTML = navHTML;
    } else {
        // Se não existir, insere no início do body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
 
    // Marca o link ativo na navegação com base na URL atual
    const currentPage = window.location.pathname.split('/').pop();
   
    // Remove a classe 'active' de todos os links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
   
    // Adiciona a classe 'active' ao link correspondente à página atual
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
 
    // Verifica se o usuário está logado (integração com o sistema de autenticação existente)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // Ocultar os botões de autenticação
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.style.display = 'none';
        }
       
        // Mostrar o nome do usuário e link de logout
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const userElement = document.createElement('li');
            userElement.id = 'user-display';
            userElement.className = 'user-display';
            userElement.innerHTML = `<span>Olá, ${currentUser}</span> | <a href="#" id="logout-link">Sair</a>`;
            navLinks.appendChild(userElement);
           
            // Adicionar evento de logout
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