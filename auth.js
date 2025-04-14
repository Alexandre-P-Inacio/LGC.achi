// Initialize Supabase client
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c2dtc2tpYW1rcHpndGxhaWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzM5NzIsImV4cCI6MjA1OTk0OTk3Mn0.oYGnYIpOUteNha2V1EoyhgxDA1XFfzxTjY8jAbSyLmI'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Only redirect if we're not already on the home page
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }
});

// Register function
async function register(username, password) {
    try {
        // Inserir o usuário na tabela sem autenticação
        const { error } = await supabase
            .from('Users') // Certifique-se de que o nome da tabela está correto
            .insert([{ username: username, password: password }]); // Armazene a senha de forma segura!

        if (error) throw error;

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para login sem autenticação
async function login(username, password) {
    try {
        // Verificar se o usuário existe
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .eq('password', password);

        if (error) throw error;

        const userExists = data && data.length > 0;
        
        if (userExists) {
            // Armazenar o nome do usuário no localStorage
            localStorage.setItem('currentUser', username);
            
            // Exibir pop-up de sucesso
            alert("Login bem-sucedido!");
            
            // Atualizar a UI
            updateUserInterface(username);
            
            // Retornar sucesso
            return { success: true, message: "Login bem-sucedido." };
        } else {
            return { success: false, error: "Usuário ou senha incorretos." };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para atualizar a interface do usuário
function updateUserInterface(username) {
    // Ocultar os botões de autenticação
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'none';
    }
    
    // Criar um elemento para mostrar o nome do usuário
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Verificar se já existe um elemento para o usuário
        let userElement = document.getElementById('user-display');
        
        // Se não existir, criar um novo
        if (!userElement) {
            userElement = document.createElement('li');
            userElement.id = 'user-display';
            userElement.className = 'user-display';
            navLinks.appendChild(userElement);
        }
        
        // Definir o conteúdo do elemento
        userElement.innerHTML = `<span>Olá, ${username}</span> | <a href="#" id="logout-link">Sair</a>`;
        
        // Adicionar evento de logout
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Verificar se o usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        updateUserInterface(currentUser);
    }
});

// Logout function
async function logout() {
    console.log('Iniciando logout...');
    // Remover o usuário do localStorage
    localStorage.removeItem('currentUser');
    console.log('Usuário removido do localStorage.');
    
    // Atualizar a UI - Isso precisa ser feito antes do redirecionamento
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'block';
        console.log('Botões de autenticação exibidos.');
    }
    
    const userElement = document.getElementById('user-display');
    if (userElement) {
        userElement.remove();
        console.log('Elemento de usuário removido.');
    }
    
    // Redirecionar para a página de index - Usar caminho relativo sem a barra no início
    console.log('Redirecionando para a página de index...');
    window.location.href = 'index.html';
}

// Check if user is admin
async function isAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
        .from('Users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
    if (error) return false;
    return data?.is_admin || false;
}

// Função para criar um novo usuário
async function createUser(email, password) {
    // Lógica para inserir um novo usuário na tabela
    const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
    await db.query(query, [email, password]);
}

// Função para autenticar um usuário sem e-mail
async function authenticate(username, password) {
    try {
        // Lógica para autenticar um usuário
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .eq('password', password); // Armazene a senha de forma segura!

        if (error) throw error;

        return data.length > 0; // Retorna true se o usuário existir
    } catch (error) {
        return { success: false, error: error.message };
    }
}

